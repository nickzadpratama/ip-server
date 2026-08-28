const express = require("express");
const router = express.Router();
const lodgingRouter = require("./lodging");
const typeRouter = require("./type");
const { Lodging } = require("../models");
const AuthController = require("../controllers/authController");
const LodgingController = require("../controllers/lodgingController");
const TypeController = require("../controllers/typeController");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");

router.post("/", async (req, res, next) => {
  res.send("This is Mami kos Server");
});

router.get("/pub/lodgings", LodgingController.read);
router.get("/pub/lodgings/:id", LodgingController.read);
router.get("/pub/types", TypeController.read);

router.post("/login", AuthController.login);

router.use(authentication);

router.post("/add-user", authorization, AuthController.register);

router.use("/lodgings", lodgingRouter);
router.use("/types", typeRouter);

module.exports = router;
