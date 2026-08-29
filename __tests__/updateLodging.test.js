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

describe("PUT /lodgings/:id", () => {
  describe("PUT /lodgings/:id - success", () => {
    test("it should be return an object with property of message and data", async () => {
      // mengupdate facility dan price
      const body = {
        name: "Rauda Kost Eksklusif Jogja",
        facility:
          "AC, Full Furniture (Kasur & Lemari), Kamar Mandi Dalam (Kloset Duduk), WiFi, Dapur Bersama, Parkir Aman",
        roomCapacity: 2,
        imgUrl:
          "https://static.mamikos.com/uploads/cache/data/style/2024-10-03/RlCAiUwz.-240x320.jpg",
        location: "Condongcatur, Depok, Sleman, Yogyakarta",
        price: 2000000,
        typeId: 2,
        authorId: 1,
      };
      const response = await request(app)
        .put("/lodgings/2")
        .send(body)
        .set("Authorization", `Bearer ${access_token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Succeed update data lodging");
        expect(response.body).toHaveProperty("data", expect.any(Object));
    });
  });
  
  describe("PUT /lodgings/:id - failed", () => {
    test("it should be return an object with property of error message", async () => {
      // mengupdate facility dan price
      const body = {
        name: "Rauda Kost Eksklusif Jogja",
        facility:
          "AC, Full Furniture (Kasur & Lemari), Kamar Mandi Dalam (Kloset Duduk), WiFi, Dapur Bersama, Parkir Aman",
        roomCapacity: 2,
        imgUrl:
          "https://static.mamikos.com/uploads/cache/data/style/2024-10-03/RlCAiUwz.-240x320.jpg",
        location: "Condongcatur, Depok, Sleman, Yogyakarta",
        price: 2000000,
        typeId: 2,
        authorId: 1,
      };
      const response = await request(app)
        .put("/lodgings/2")
        .send(body);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Please login first");
    });
  });

  describe("PUT /lodgings/:id - failed", () => {
    test("it should be return an object with property of error message", async () => {
      // mengupdate facility dan price
      const body = {
        name: "Rauda Kost Eksklusif Jogja",
        facility:
          "AC, Full Furniture (Kasur & Lemari), Kamar Mandi Dalam (Kloset Duduk), WiFi, Dapur Bersama, Parkir Aman",
        roomCapacity: 2,
        imgUrl:
          "https://static.mamikos.com/uploads/cache/data/style/2024-10-03/RlCAiUwz.-240x320.jpg",
        location: "Condongcatur, Depok, Sleman, Yogyakarta",
        price: 2000000,
        typeId: 2,
        authorId: 1,
      };
      const response = await request(app)
        .put("/lodgings/2")
        .send(body).set(
          "Authorization",
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJuaWNrQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Nzk3MjE1OH0.fzh6jUzuN5redDHAAN7tRIiVVRHyDAUkZKmWkm1`,
        );

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Please login first");
    });
  });

  describe("PUT /lodgings/:id - failed", () => {
    test("it should be return an object with property of error message", async () => {
      // mengupdate facility, price dan image
      const body = {
        name: "Rauda Kost Eksklusif Jogja",
        facility:
          "AC, Full Furniture (Kasur & Lemari), Kamar Mandi Dalam (Kloset Duduk), WiFi, Dapur Bersama, Parkir Aman",
        roomCapacity: 2,
        imgUrl:
          "https://static.mamikos.com/uploads/cache/data/style/2024-10-03/RlCAiUwz.-240x320.jpg",
        location: "Condongcatur, Depok, Sleman, Yogyakarta",
        price: 2000000,
        typeId: 2,
        authorId: 1,
      };
      const response = await request(app)
        .put("/lodgings/21")
        .send(body).set("Authorization", `Bearer ${access_token}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Data not found");
    });
  });

  describe("PUT /lodgings/:id - failed", () => {
    test("it should be return an object with property of error message", async () => {
      // mengupdate facility dan price
      const body = {
        name: "",
        facility:
          "AC, Full Furniture (Kasur & Lemari), Kamar Mandi Dalam (Kloset Duduk), WiFi, Dapur Bersama, Parkir Aman",
        roomCapacity: 2,
        imgUrl:
          "https://static.mamikos.com/uploads/cache/data/style/2024-10-03/RlCAiUwz.-240x320.jpg",
        location: "Condongcatur, Depok, Sleman, Yogyakarta",
        price: 2000000,
        typeId: 2,
        authorId: 1,
      };
      const response = await request(app)
        .put("/lodgings/2")
        .send(body).set("Authorization", `Bearer ${access_token}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", expect.any(String));
    });
  });

  describe("PUT /lodgings/:id - failed", () => {
    test("it should be return an object with property of error message", async () => {
      access_token = signToken({
        id: 3,
        email: "nickz@gmail.com",
        role: "staff",
      });
      // mengupdate facility dan price
      const body = {
        name: "Rauda Kost Eksklusif Jogja",
        facility:
          "AC, Full Furniture (Kasur & Lemari), Kamar Mandi Dalam (Kloset Duduk), WiFi, Dapur Bersama, Parkir Aman",
        roomCapacity: 2,
        imgUrl:
          "https://static.mamikos.com/uploads/cache/data/style/2024-10-03/RlCAiUwz.-240x320.jpg",
        location: "Condongcatur, Depok, Sleman, Yogyakarta",
        price: 2000000,
        typeId: 2,
        authorId: 1,
      };
      const response = await request(app)
        .put("/lodgings/2").send(body)
        .set("Authorization", `Bearer ${access_token}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "You don't have any access");
    });
  });
});