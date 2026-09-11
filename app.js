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
  apiKey: "AQ.Ab8RN6IXG7F0lhnYqOqHf33ZkUMYgJKouZuy0C0gbhTx4pNN3A",
});
console.log(ai);
app.get("/genAI", async (req, res, next) => {
  try {
    const interaction = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Siapa pelatih Timnas Indonesia saat ini dan bagaimana performa mereka di kualifikasi Piala Dunia?`,
      // input: `${inputAI}, jawab hanya seputar sepak bola Indonesia`,
    });
    console.log(interaction);
    const result = interaction.text;

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
