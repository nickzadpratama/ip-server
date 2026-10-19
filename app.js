if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
var cors = require("cors");
const router = require("./routers");
const errorHandler = require("./middlewares/errorHandler");
const app = express();
const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;
const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  DEFAULT_GEMINI_MODEL,
].filter((model, index, models) => model && models.indexOf(model) === index);

let activeGeminiModel = null;

const requestAIResponse = async (input) => {
  const candidates = [
    activeGeminiModel,
    ...GEMINI_MODEL_CANDIDATES,
  ].filter((model, index, models) => model && models.indexOf(model) === index);
  let lastError;

  for (const model of candidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: input,
        config: {
          systemInstruction:
            "Kamu adalah teman ngobrol soal sepak bola Indonesia. Balas dengan bahasa Indonesia sehari-hari yang santai, ramah, dan kasual, seperti chat. Jawab singkat, maksimal dua kalimat. Jangan gunakan tanda bintang atau format Markdown, termasuk bold, italic, judul, dan daftar. Kalau pertanyaan di luar sepak bola Indonesia, jawab singkat dan sopan bahwa kamu hanya bisa bantu soal sepak bola Indonesia.",
        },
      });
      const result = response.text?.replace(/\*/g, "").trim();

      if (!result) {
        throw new Error("Gemini returned an empty response.");
      }

      activeGeminiModel = model;
      return result;
    } catch (error) {
      lastError = error;
      const status = error.status || error.response?.status;
      console.error(`Gemini model "${model}" failed (HTTP ${status || "unknown"}).`);

      if (
        status !== 404 &&
        status !== 503 &&
        !/model.+(not found|not supported|unavailable)|not found.+model/i.test(
          error.message || "",
        )
      ) {
        break;
      }
    }
  }

  const status = lastError?.status || lastError?.response?.status;
  let message =
    "AI service is temporarily unavailable. Please try again later.";

  if (status === 401 || status === 403) {
    message =
      "Gemini API authentication failed. Set a valid GEMINI_API_KEY on the server and restart it.";
  } else if (status === 429) {
    message =
      "Gemini API quota or rate limit reached. Check the API quota and billing settings, then try again.";
  } else if (status === 404) {
    message =
      "No configured Gemini model is available. Set GEMINI_MODEL to a model enabled for this API key.";
  }

  throw {
    name: "ServiceUnavailable",
    message,
    cause: lastError,
  };
};

app.use(cors());

app.use(express.json());

app.get("/genAI", async (req, res, next) => {
  try {
    const { input } = req.query;

    if (typeof input !== "string" || !input.trim()) {
      throw { name: "InvalidInput" };
    }
    if (input.trim().length > 500) {
      throw { name: "ChatInputTooLong" };
    }

    if (!GEMINI_API_KEY || !ai) {
      throw {
        name: "ServiceUnavailable",
        message:
          "AI service not configured. Please set GEMINI_API_KEY in environment variables.",
      };
    }

    const result = await requestAIResponse(input);

    res.status(200).json(result);
  } catch (error) {
    if (error.name === "ServiceUnavailable") {
      console.error("Gemini service is unavailable:", error.message);
    }
    next(error);
  }
});

app.use(express.urlencoded({ extended: true }));

app.set("query parser", "extended");

app.use("/", router);

app.use(errorHandler);

module.exports = app;
