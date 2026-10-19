jest.mock("../models", () => ({ User: { findByPk: jest.fn() } }));
const mockGenerateContent = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

process.env.GEMINI_API_KEY ||= "test-gemini-key";

const request = require("supertest");
process.env.SECRET_KEY = "chatbot-auth-test-only";
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const app = require("../app");
const authRequest = () => ({ get: (url) => request(app).get(url).set("Authorization", `Bearer ${jwt.sign({ id: 1 }, process.env.SECRET_KEY)}`) });

describe("GET /genAI", () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
    User.findByPk.mockResolvedValue({ id: 1 });
  });

  it("rejects anonymous requests before calling Gemini", async () => {
    const response = await request(app).get("/genAI").query({ input: "Halo" });
    expect(response.status).toBe(401);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("rejects invalid and expired tokens before calling Gemini", async () => {
    for (const token of ["invalid", jwt.sign({ id: 1, exp: 1 }, process.env.SECRET_KEY)]) {
      const response = await request(app).get("/genAI")
        .set("Authorization", `Bearer ${token}`).query({ input: "Halo" });
      expect(response.status).toBe(401);
    }
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("rejects tokens whose user no longer exists", async () => {
    User.findByPk.mockResolvedValue(null);
    const response = await authRequest().get("/genAI").query({ input: "Halo" });
    expect(response.status).toBe(401);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("generates a concise football answer using the configured Gemini model", async () => {
    mockGenerateContent.mockResolvedValue({ text: "Persib Bandung." });

    const response = await authRequest()
      .get("/genAI")
      .query({ input: "Klub apa yang dijuluki Maung Bandung?" });

    expect(response.status).toBe(200);
    expect(response.body).toBe("Persib Bandung.");
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        contents: "Klub apa yang dijuluki Maung Bandung?",
        config: expect.objectContaining({
          systemInstruction: expect.stringContaining("bahasa Indonesia sehari-hari"),
        }),
      }),
    );
    expect(mockGenerateContent.mock.calls[0][0].config).not.toHaveProperty(
      "maxOutputTokens",
    );
  });

  it("removes asterisk formatting from Gemini replies", async () => {
    mockGenerateContent.mockResolvedValue({
      text: "**Persib** itu julukannya Maung Bandung.",
    });

    const response = await authRequest()
      .get("/genAI")
      .query({ input: "Julukan Persib apa?" });

    expect(response.status).toBe(200);
    expect(response.body).toBe("Persib itu julukannya Maung Bandung.");
    expect(response.body).not.toContain("*");
  });

  it("uses the current default Gemini model", async () => {
    mockGenerateContent.mockResolvedValue({ text: "Siap." });

    await authRequest().get("/genAI").query({ input: "Tes" });

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gemini-3.8-flash" }),
    );
  });

  it("rejects a missing or blank message", async () => {
    const missing = await authRequest().get("/genAI");
    const blank = await authRequest().get("/genAI").query({ input: "   " });

    expect(missing.status).toBe(400);
    expect(blank.status).toBe(400);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("rejects messages longer than 500 characters", async () => {
    const response = await authRequest()
      .get("/genAI")
      .query({ input: "a".repeat(501) });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("500 characters");
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns a service error when Gemini does not respond", async () => {
    mockGenerateContent.mockRejectedValue(
      Object.assign(new Error("Gemini API unavailable"), { status: 503 }),
    );

    const response = await authRequest()
      .get("/genAI")
      .query({ input: "Siapa juara Liga 1?" });

    expect(response.status).toBe(503);
    expect(response.body.message).toContain("temporarily unavailable");
  });

  it("explains when the server Gemini API key is invalid", async () => {
    mockGenerateContent.mockRejectedValue(
      Object.assign(new Error("Invalid API key"), { status: 401 }),
    );

    const response = await authRequest()
      .get("/genAI")
      .query({ input: "Siapa juara Liga 1?" });

    expect(response.status).toBe(503);
    expect(response.body.message).toContain("valid GEMINI_API_KEY");
  });

  it("explains when Gemini quota is exhausted", async () => {
    mockGenerateContent.mockRejectedValue(
      Object.assign(new Error("Quota exceeded"), { status: 429 }),
    );

    const response = await authRequest()
      .get("/genAI")
      .query({ input: "Siapa juara Liga 1?" });

    expect(response.status).toBe(503);
    expect(response.body.message).toContain("quota or rate limit");
  });

  it("rejects an empty response from Gemini", async () => {
    mockGenerateContent.mockResolvedValue({ text: "" });

    const response = await authRequest()
      .get("/genAI")
      .query({ input: "Apa itu Liga 1?" });

    expect(response.status).toBe(503);
  });
});
