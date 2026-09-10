const express = require("express");
const router = express.Router();
const teamRouter = require("./team");
const AuthController = require("../controllers/authController");
const TeamController = require("../controllers/teamController");
const authentication = require("../middlewares/authentication");
// const authorization = require("../middlewares/authorization");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

router.use(authentication);

router.use("/", teamRouter);

module.exports = router;
