const request = require("supertest");
const { hashPassword } = require("../helpers/bcrypt");
const { sequelize } = require("../models");
const app = require("../app");

beforeAll(async () => {
  const users = require("../data/users.json");
  users.forEach((el) => {
    el.password = hashPassword(el.password);
    el.createdAt = el.updatedAt = new Date();
  });

  await sequelize.queryInterface.bulkInsert("Users", users, {});
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete("Users", null, {
    restartIdentity: true,
    cascade: true,
    truncate: true,
  });
});

describe("POST /login", () => {
  describe("POST /login - success", () => {
    test("it should be return an object with property of access_token", async () => {
      const body = { email: "nick@gmail.com", password: "12abcd" };
      const response = await request(app).post("/login").send(body);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token", expect.any(String));
    });
  });

  describe("POST /login - failed", () => {
    test("it should be return an object with property of error message", async () => {
      const body = { email: "", password: "12abcd" };
      const response = await request(app).post("/login").send(body);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Please input email or password",
      );
    });

    test("it should be return an object with property of error message", async () => {
      const body = { email: "nick@gmail.com", password: "" };
      const response = await request(app).post("/login").send(body);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Please input email or password",
      );
    });

    test("it should be return an object with property of error message", async () => {
      const body = { email: "saya@gmail.com", password: "12abcd" };
      const response = await request(app).post("/login").send(body);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password",
      );
    });

    test("it should be return an object with property of error message", async () => {
      const body = { email: "nick@gmail.com", password: "12345abc" };
      const response = await request(app).post("/login").send(body);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password",
      );
    });
  });
});
