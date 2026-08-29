const request = require("supertest");
const app = require("../app");
const { signToken } = require("../helpers/jwt");
const { sequelize } = require("../models");
const { hashPassword } = require("../helpers/bcrypt");

let access_token;

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

  access_token = signToken({
    id: 1,
    email: "nick@gmail.com",
    role: "admin",
  });
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

describe("POST /lodgings", () => {
  describe("POST /lodgings - success", () => {
    test("it should be return an object with property of message and data", async () => {
      const body = {
        name: "Kos Cantika Tipe Standard",
        facility:
          "Kasur Tunggal Single, Kipas Angin, Lemari Baju, Kamar Mandi Luar, Parkir Motor Aman",
        roomCapacity: 1,
        imgUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHTp7apvkXa3GCA6kr1xfCuuhL0FdCdvkLLbFSOc1Q0Mqhb3vIU4WDvuE&s=10",
        location: "Tembalang, Semarang, Jawa Tengah",
        price: 850000,
        typeId: 3,
        authorId: 1,
      };
      const response = await request(app)
        .post("/lodgings")
        .send(body)
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Succeed create data lodging",
      );
      expect(response.body).toHaveProperty("data", expect.any(Object));
    });
  });

  describe("POST /lodgings - failed", () => {
    test("it should be return an object with property of error message", async () => {
      const body = {
        name: "Kos Cantika Tipe Standard",
        facility:
          "Kasur Tunggal Single, Kipas Angin, Lemari Baju, Kamar Mandi Luar, Parkir Motor Aman",
        roomCapacity: 1,
        imgUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHTp7apvkXa3GCA6kr1xfCuuhL0FdCdvkLLbFSOc1Q0Mqhb3vIU4WDvuE&s=10",
        location: "Tembalang, Semarang, Jawa Tengah",
        price: 850000,
        typeId: 3,
        authorId: 1,
      };
      const response = await request(app).post("/lodgings").send(body);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Please login first");
    });
  });

  describe("POST /lodgings - failed", () => {
    test("it should be return an object with property of error message", async () => {
      const body = {
        name: "Kos Cantika Tipe Standard",
        facility:
          "Kasur Tunggal Single, Kipas Angin, Lemari Baju, Kamar Mandi Luar, Parkir Motor Aman",
        roomCapacity: 1,
        imgUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHTp7apvkXa3GCA6kr1xfCuuhL0FdCdvkLLbFSOc1Q0Mqhb3vIU4WDvuE&s=10",
        location: "Tembalang, Semarang, Jawa Tengah",
        price: 850000,
        typeId: 3,
        authorId: 1,
      };
      const response = await request(app)
        .post("/lodgings")
        .send(body)
        .set(
          "Authorization",
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJuaWNrQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Nzk3MjE1OH0.fzh6jUzuN5redDHAAN7tRIiVVRHyDAUkZKmWkm1`,
        );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Please login first");
    });
  });

  describe("POST /lodgings - failed", () => {
    test("it should be return an object with property of error message", async () => {
      const body = {
        name: "",
        facility:
          "Kasur Tunggal Single, Kipas Angin, Lemari Baju, Kamar Mandi Luar, Parkir Motor Aman",
        roomCapacity: 1,
        imgUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHTp7apvkXa3GCA6kr1xfCuuhL0FdCdvkLLbFSOc1Q0Mqhb3vIU4WDvuE&s=10",
        location: "Tembalang, Semarang, Jawa Tengah",
        price: 850000,
        typeId: 3,
        authorId: 1,
      };
      const response = await request(app)
        .post("/lodgings")
        .send(body)
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", expect.any(String));
    });
  });
})