const express = require("express");
const TypeController = require("../controllers/typeController");
// const authorization = require("../middlewares/authorization");
const router = express.Router();

router.get("/", TypeController.read);
router.post("/", TypeController.create);
router.put("/:id", TypeController.update);

module.exports = router;
