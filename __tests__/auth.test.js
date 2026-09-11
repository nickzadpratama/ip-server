/**
 * E2E Tests for AuthController
 * Testing authentication endpoints: POST /register, POST /login
 */

const request = require("supertest");
const app = require("../app");
const { User, sequelize } = require("../models");

const testUser = {
  username: "testuser",
  email: "testuser@example.com",
  password: "password123",
};

describe("AuthController E2E Tests", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.drop();
    await sequelize.close();
  });

  beforeEach(async () => {
    try {
      // Use delete instead of truncate to avoid foreign key issues
      await User.destroy({ where: {} });
    } catch (error) {
      console.error("Error in beforeEach:", error);
    }
  });

  describe("POST /register", () => {
    it("should register new user successfully", async () => {
      const res = await request(app).post("/register").send(testUser);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Create new User");
      expect(res.body.data.username).toBe(testUser.username);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should fail with missing username", async () => {
      const res = await request(app)
        .post("/register")
        .send({ email: "test@example.com", password: "pass123" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Username Required");
    });

    it("should fail with missing email", async () => {
      const res = await request(app)
        .post("/register")
        .send({ username: "test", password: "pass123" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email Required");
    });

    it("should fail with missing password", async () => {
      const res = await request(app)
        .post("/register")
        .send({ username: "test", email: "test@example.com" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password Required");
    });

    it("should fail with invalid email", async () => {
      const res = await request(app)
        .post("/register")
        .send({ username: "test", email: "invalid", password: "pass123" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid email format");
    });

    it("should fail with duplicate email", async () => {
      await request(app).post("/register").send(testUser);
      const res = await request(app)
        .post("/register")
        .send({ ...testUser, username: "user2" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email must be unique");
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      await request(app).post("/register").send(testUser);
    });

    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token");
      expect(typeof res.body.access_token).toBe("string");
    });

    it("should fail with missing email", async () => {
      const res = await request(app)
        .post("/login")
        .send({ password: testUser.password });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Please input email or password");
    });

    it("should fail with missing password", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: testUser.email });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Please input email or password");
    });

    it("should fail with wrong email", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "wrong@example.com", password: testUser.password });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should fail with wrong password", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: testUser.email, password: "wrongpass" });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("Integration", () => {
    it("should complete register then login flow", async () => {
      const user = {
        username: "flow",
        email: "flow@example.com",
        password: "flow123",
      };

      const regRes = await request(app).post("/register").send(user);
      expect(regRes.status).toBe(200);

      const loginRes = await request(app)
        .post("/login")
        .send({ email: user.email, password: user.password });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.access_token).toBeDefined();
    });
  });
});
