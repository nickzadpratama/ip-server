/**
 * E2E Tests for AuthController
 * Testing authentication endpoints: POST /register, POST /login
 */

const request = require("supertest");
const app = require("../app");
const { User, sequelize } = require("../models");
const { verifyToken } = require("../helpers/jwt");
const { comparePassword } = require("../helpers/bcrypt");

// Mock google-auth-library supaya POST /google-login bisa diuji tanpa token Google asli
jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn(() => ({ verifyIdToken: mockVerifyIdToken })),
  mockVerifyIdToken: jest.fn(),
}));

const { mockVerifyIdToken } = require("google-auth-library");

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

  describe("POST /google-login", () => {
    const googleEmail = "google.user@example.com";

    beforeEach(async () => {
      mockVerifyIdToken.mockReset();
      try {
        await User.destroy({ where: {} });
      } catch (error) {
        console.error("Error in beforeEach:", error);
      }
    });

    it("should login with a valid Google id token and create the user", async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ email: googleEmail, name: "Google User" }),
      });

      const res = await request(app)
        .post("/google-login")
        .set("token", "valid-google-id-token");

      expect(res.status).toBe(200);
      expect(typeof res.body.access_token).toBe("string");

      const decoded = verifyToken(res.body.access_token);
      expect(decoded.email).toBe(googleEmail);

      const user = await User.findOne({ where: { email: googleEmail } });
      expect(user).not.toBeNull();
      expect(user.username).toBe("Google User");
      expect(comparePassword("login_with_google", user.password)).toBe(true);
    });

    it("should login with an existing Google user (no duplicate)", async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ email: googleEmail, name: "Google User" }),
      });

      await request(app)
        .post("/google-login")
        .set("token", "valid-google-id-token");

      const res = await request(app)
        .post("/google-login")
        .set("token", "valid-google-id-token");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token");

      const count = await User.count({ where: { email: googleEmail } });
      expect(count).toBe(1);
    });

    it("should fail with 401 when token header is missing", async () => {
      const res = await request(app).post("/google-login");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should fail with 500 when Google token verification fails", async () => {
      mockVerifyIdToken.mockRejectedValue(new Error("Invalid Google token"));

      const res = await request(app)
        .post("/google-login")
        .set("token", "bad-token");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal server error");
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
