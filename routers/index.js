const express = require("express");
const router = express.Router();
const teamRouter = require("./team");
const AuthController = require("../controllers/authController");
const TeamController = require("../controllers/teamController");
const authentication = require("../middlewares/authentication");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/google-login", AuthController.googleLogin);
router.post("/facebook-login", AuthController.facebookLogin);

router.use(authentication);

router.use("/sports", require("./sports"));
router.use("/me/fan-clubs", require("./membership"));

router.use("/", teamRouter);

module.exports = router;
