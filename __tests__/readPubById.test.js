const request = require("supertest");
const app = require("../app");
const { signToken } = require("../helpers/jwt");
const { sequelize } = require("../models");
const { hashPassword } = require("../helpers/bcrypt");

beforeAll(async () => {
  const users = require("../data/users.json");
  users.forEach((el) => {
    el.password = hashPassword(el.password);
    el.createdAt = el.updatedAt = new Date();
  });

  await sequelize.queryInterface.bulkInsert("Users", users, {});

  const types = require("../data/types.json");
  types.forEach((el) => {
    el.createdAt = el.updatedAt = new Date();
  });

  await sequelize.queryInterface.bulkInsert("Types", types, {});

  const lodgings = require("../data/lodgings.json");
  lodgings.forEach((el) => {
    el.createdAt = el.updatedAt = new Date();
  });

  await sequelize.queryInterface.bulkInsert("Lodgings", lodgings, {});
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete("Lodgings", null, {
    restartIdentity: true,
    cascade: true,
    truncate: true,
  });

  await sequelize.queryInterface.bulkDelete("Types", null, {
    restartIdentity: true,
    cascade: true,
    truncate: true,
  });

  await sequelize.queryInterface.bulkDelete("Users", null, {
    restartIdentity: true,
    cascade: true,
    truncate: true,
  });
});

describe("GET /pub/lodgings/:id", () => {
  describe("GET /pub/lodgings/:id - success", () => {
    test("it should be return an object with property of message and data", async () => {
      const response = await request(app)
        .get("/pub/lodgings/1")

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Succeed read detail lodging",
      );
      expect(response.body).toHaveProperty("data", expect.any(Object));
    });
  });

  describe("GET /pub/lodgings/:id - failed", () => {
    test("it should be return an object with property of error message", async () => {
      const response = await request(app)
        .get("/pub/lodgings/21")

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Data not found",
      );
    });
  });
})