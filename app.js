if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
var cors = require("cors");
const router = require("./routers");
const errorHandler = require("./middlewares/errorHandler");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.set("query parser", "extended");

app.use("/", router);

app.use(errorHandler);

module.exports = app;
