if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
var cors = require("cors");
const router = require("./routers");
const errorHandler = require("./middlewares/errorHandler");
const app = express();
const { GoogleGenAI } = require("@google/genai");

app.use(cors());

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY ||
    "AQ.Ab8RN6KhQ5VmtjX3Xk9TZLtx-8m-eyqVFkkLGhhoCMMevqFRuA",
});
console.log(ai);
app.get("/genAI", async (req, res, next) => {
  try {
    const { input } = req.query;

    if (!input) throw { name: "InvalidInput" };

    const interaction = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${input}, jawab hanya seputar sepak bola Indonesia, tolong jawab dengan sangat singkat dan dengan bahasa chat`,
    });
    console.log(interaction);
    const result =
      interaction.text || "Maaf, saya tidak bisa menjawab saat ini";

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.use(express.urlencoded({ extended: true }));

app.set("query parser", "extended");

app.use("/", router);

app.use(errorHandler);

module.exports = app;
