jest.mock("../models", () => ({
  User: { findByPk: jest.fn() },
}));
jest.mock("axios");

const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { User } = require("../models");

process.env.SECRET_KEY = "sports-test-only";

const app = express();
app.use(express.json());
app.use("/", require("../routers"));
app.use(require("../middlewares/errorHandler"));

const token = jwt.sign(
  { id: 1, email: "user@example.test" },
  process.env.SECRET_KEY,
);
const auth = { Authorization: `Bearer ${token}` };

beforeEach(() => {
  jest.clearAllMocks();
  User.findByPk.mockResolvedValue({ id: 1 });
  process.env.API_SPORTS_KEY = "server-only-test-key";
  axios.get.mockResolvedValue({
    data: { response: [{ team: { id: 42, name: "Test Club" } }], errors: [] },
  });
});

test.each([
  ["/sports/teams?country=Indonesia", "/teams", { country: "Indonesia" }],
  ["/sports/teams?id=42", "/teams", { id: 42 }],
  ["/sports/squads?team=42", "/players/squads", { team: 42 }],
  ["/sports/players?id=7&season=2024", "/players", { id: 7, season: 2024 }],
])("proxies %s through the server", async (path, upstreamPath, params) => {
  const response = await request(app).get(path).set(auth);

  expect(response.status).toBe(200);
  expect(response.body.response[0].team.id).toBe(42);
  expect(axios.get).toHaveBeenCalledWith(
    `https://v3.football.api-sports.io${upstreamPath}`,
    expect.objectContaining({
      params,
      headers: { "x-apisports-key": "server-only-test-key" },
      timeout: 10000,
    }),
  );
});

test("reuses successful provider responses for repeated requests", async () => {
  const first = await request(app)
    .get("/sports/teams?country=Cacheland")
    .set(auth);
  const second = await request(app)
    .get("/sports/teams?country=Cacheland")
    .set(auth);

  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
  expect(axios.get).toHaveBeenCalledTimes(1);
});

test("requires a valid login", async () => {
  expect((await request(app).get("/sports/teams?country=Indonesia")).status).toBe(401);
});

test.each([
  "/sports/teams?id=0",
  "/sports/squads?team=not-a-number",
  "/sports/players?id=7&season=invalid",
  "/sports/teams",
])("rejects invalid query parameters for %s", async (path) => {
  const response = await request(app).get(path).set(auth);
  expect(response.status).toBe(400);
  expect(axios.get).not.toHaveBeenCalled();
});

test("does not call provider without a configured server key", async () => {
  delete process.env.API_SPORTS_KEY;
  const response = await request(app)
    .get("/sports/teams?country=Indonesia")
    .set(auth);

  expect(response.status).toBe(503);
  expect(axios.get).not.toHaveBeenCalled();
});

test("reports provider errors without returning a success-shaped response", async () => {
  axios.get.mockRejectedValue(new Error("upstream unavailable"));
  const response = await request(app)
    .get("/sports/teams?country=OfflineLand")
    .set(auth);

  expect(response.status).toBe(503);
  expect(response.body).toHaveProperty("message");
});

test("explains provider quota errors", async () => {
  axios.get.mockResolvedValue({
    data: {
      response: [],
      errors: { requests: "You have reached the request limit" },
    },
  });
  const response = await request(app)
    .get("/sports/teams?country=Limitland")
    .set(auth);

  expect(response.status).toBe(503);
  expect(response.body.message).toMatch(/rate limit/i);
});
