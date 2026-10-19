jest.mock("../models", () => ({
  User: { findByPk: jest.fn() },
  FanClub: { findOne: jest.fn(), findOrCreate: jest.fn() },
  FanClubMembership: { findOne: jest.fn(), findAll: jest.fn(), findOrCreate: jest.fn(), destroy: jest.fn() },
  sequelize: { transaction: jest.fn((callback) => callback({})) },
}));
jest.mock("axios");

const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
process.env.SECRET_KEY = "membership-test-only";
const { User, FanClub, FanClubMembership, sequelize } = require("../models");
const axios = require("axios");
const app = express();
app.use(express.json());
app.use("/me/fan-clubs", require("../middlewares/authentication"), require("../routers/membership"));
app.use(require("../middlewares/errorHandler"));
const token = (id = 1) => jwt.sign({ id, email: `user${id}@example.test` }, process.env.SECRET_KEY);
const club = { id: 8, externalTeamId: 42, name: "Test Club" };
const clubModel = { ...club, toJSON: () => club };
const membership = { id: 3, UserId: 1, FanClubId: 8 };
const membershipModel = { toJSON: () => membership };

beforeEach(() => {
  jest.clearAllMocks();
  User.findByPk.mockResolvedValue({ id: 1 });
  FanClub.findOne.mockResolvedValue(clubModel);
  FanClubMembership.findOrCreate.mockResolvedValue([membershipModel, true]);
  process.env.API_SPORTS_KEY = "test-provider-key";
});

test.each(["get", "put", "delete"])("%s requires authentication", async (method) => {
  const response = await request(app)[method](method === "get" ? "/me/fan-clubs" : "/me/fan-clubs/42");
  expect(response.status).toBe(401);
});

test("expired and invalid tokens, and a deleted user, return 401", async () => {
  for (const invalid of ["invalid", jwt.sign({ id: 1, exp: 1 }, process.env.SECRET_KEY)]) {
    expect((await request(app).get("/me/fan-clubs").set("Authorization", `Bearer ${invalid}`)).status).toBe(401);
  }
  User.findByPk.mockResolvedValue(null);
  expect((await request(app).get("/me/fan-clubs").set("Authorization", `Bearer ${token()}`)).status).toBe(401);
});

test("list scopes membership to the authenticated user, not the query", async () => {
  FanClubMembership.findAll.mockResolvedValue([{ ...membership, FanClub: club }]);
  const response = await request(app).get("/me/fan-clubs?userId=99").set("Authorization", `Bearer ${token()}`);
  expect(response.status).toBe(200);
  expect(response.body.data[0].FanClub.externalTeamId).toBe(42);
  expect(FanClubMembership.findAll.mock.calls[0][0].where).toEqual({ UserId: 1 });
});

test("join uses server identity and returns confirmed membership", async () => {
  const response = await request(app).put("/me/fan-clubs/42")
    .set("Authorization", `Bearer ${token()}`).send({ UserId: 99, name: "Forged club" });
  expect(response.status).toBe(201);
  expect(response.body.data.FanClub).toEqual(club);
  expect(FanClubMembership.findOrCreate.mock.calls[0][0].where).toEqual({ UserId: 1, FanClubId: 8 });
  expect(sequelize.transaction).toHaveBeenCalled();
  expect(axios.get).not.toHaveBeenCalled();
});

test("joining an existing membership returns 200", async () => {
  FanClubMembership.findOrCreate.mockResolvedValue([membershipModel, false]);
  expect((await request(app).put("/me/fan-clubs/42").set("Authorization", `Bearer ${token()}`)).status).toBe(200);
});

test("uncached clubs are verified with the provider", async () => {
  FanClub.findOne.mockResolvedValue(null);
  FanClub.findOrCreate.mockResolvedValue([clubModel, true]);
  axios.get.mockResolvedValue({ data: { errors: [], response: [{ team: { id: 42, name: "Test Club" } }] } });
  expect((await request(app).put("/me/fan-clubs/42").set("Authorization", `Bearer ${token()}`)).status).toBe(201);
  expect(FanClub.findOrCreate.mock.calls[0][0].defaults.name).toBe("Test Club");
});

test("provider failure does not create a membership", async () => {
  FanClub.findOne.mockResolvedValue(null);
  axios.get.mockRejectedValue(new Error("offline"));
  expect((await request(app).put("/me/fan-clubs/42").set("Authorization", `Bearer ${token()}`)).status).toBe(503);
  expect(FanClubMembership.findOrCreate).not.toHaveBeenCalled();
});

test("unknown provider team returns 404", async () => {
  FanClub.findOne.mockResolvedValue(null);
  axios.get.mockResolvedValue({ data: { errors: [], response: [] } });
  expect((await request(app).put("/me/fan-clubs/42").set("Authorization", `Bearer ${token()}`)).status).toBe(404);
});

test.each(["0", "-1", "abc", "1.5", "2147483648"])("rejects invalid team ID %s", async (id) => {
  expect((await request(app).put(`/me/fan-clubs/${id}`).set("Authorization", `Bearer ${token()}`)).status).toBe(400);
  expect(FanClubMembership.findOrCreate).not.toHaveBeenCalled();
});

test("leave deletes only the authenticated user's relation", async () => {
  expect((await request(app).delete("/me/fan-clubs/42").set("Authorization", `Bearer ${token(2)}`)).status).toBe(204);
  expect(FanClubMembership.destroy).toHaveBeenCalledWith({ where: { UserId: 2, FanClubId: 8 } });
  FanClub.findOne.mockResolvedValue(null);
  expect((await request(app).delete("/me/fan-clubs/42").set("Authorization", `Bearer ${token()}`)).status).toBe(204);
});

const edits = { name: "My Club", code: "test", founded: "1990", stadium: "My Stadium", city: "My City", capacity: "1000" };

test("detail loads only the current user's membership using the external team ID", async () => {
  FanClubMembership.findOne.mockResolvedValue({ ...membership, FanClub: club, details: {} });
  const response = await request(app).get("/me/fan-clubs/42").set("Authorization", `Bearer ${token()}`);
  expect(response.status).toBe(200);
  expect(FanClubMembership.findOne.mock.calls[0][0].where).toEqual({ UserId: 1 });
  expect(FanClubMembership.findOne.mock.calls[0][0].include[0].where.externalTeamId).toBe(42);
});

test("update persists personal details and ignores injected identity and club fields", async () => {
  const update = jest.fn().mockResolvedValue(undefined);
  FanClubMembership.findOne.mockResolvedValue({ ...membership, update });
  const response = await request(app).patch("/me/fan-clubs/42").set("Authorization", `Bearer ${token()}`)
    .send({ ...edits, UserId: 99, FanClubId: 99, externalTeamId: 99 });
  expect(response.status).toBe(200);
  expect(update).toHaveBeenCalledWith({ details: { ...edits, code: "TEST", founded: 1990, capacity: 1000 } });
  expect(FanClubMembership.findOne.mock.calls[0][0].where).toEqual({ UserId: 1 });
});

test.each(["get", "patch"])("%s cannot access a team without the current user's membership", async (method) => {
  FanClubMembership.findOne.mockResolvedValue(null);
  expect((await request(app)[method]("/me/fan-clubs/42").set("Authorization", `Bearer ${token()}`).send(edits)).status).toBe(404);
});

test.each([{ name: " " }, { capacity: "-1" }, { capacity: "1.5" }, { founded: "abc" }, { founded: 1000 }, { city: {} }])(
  "invalid personal update %j is not saved", async (invalid) => {
    const update = jest.fn();
    FanClubMembership.findOne.mockResolvedValue({ update });
    expect((await request(app).patch("/me/fan-clubs/42").set("Authorization", `Bearer ${token()}`).send({ ...edits, ...invalid })).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  },
);
