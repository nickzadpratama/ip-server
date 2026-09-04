const express = require("express");
const TypeController = require("../controllers/typeController");
const authorization = require("../middlewares/authorization");
const router = express.Router();

router.get("/", TypeController.read);
router.post("/", TypeController.create);
router.get("/:id", TypeController.readById);
router.put("/:id", authorization, TypeController.update);

module.exports = router;
