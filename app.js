if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
var cors = require("cors");
const router = require("./routers");
const errorHandler = require("./middlewares/errorHandler");
const app = express();
const { GoogleGenAI } = require("@google/genai");

app.get("/genAI", async (req, res, next) => {
  try {
    const { inputAI } = req.body;
    const id = new GoogleGenAI({
      apikey: "AQ.Ab8RN6KxQ8TMcABTnQ9mgKJZmc4ReIixJvisazzC5mIuVZkQww",
    });

    const interaction = await axios.interaction.create({
      model: "gemini-3.7-flash",
      input: `${inputAI}, jawab hanya seputar sepak bola Indonesia`,
    });

    const result = interaction.output_text;

    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.set("query parser", "extended");

app.use("/", router);

app.use(errorHandler);

module.exports = app;
