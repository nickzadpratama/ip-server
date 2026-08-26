const express = require("express");
const TypeController = require("../controllers/typeController");
// const authorization = require("../middlewares/authorization");
const router = express.Router();

router.get("/", TypeController.read);

module.exports = router;
