const express = require("express");
const TeamController = require("../controllers/teamController");
const authorization = require("../middlewares/authorization");
const router = express.Router();
const upload = require("../utils/multer");

router.get("/", TeamController.read);

router.post("/", TeamController.create);
router.get("/:id", TeamController.teamById);

router.put("/:id", authorization, TeamController.update);
router.delete("/:id", authorization, TeamController.delete);

module.exports = router;
