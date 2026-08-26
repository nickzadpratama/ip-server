const express = require("express");
const LodgingController = require("../controllers/lodgingController");
// const authorization = require("../middlewares/authorization");
const router = express.Router();

router.get("/", LodgingController.read);
router.post("/", LodgingController.create);
// router.get("/:id", EventController.readById);

// router.delete("/:id", authorization, EventController.delete);
// router.put("/:id", authorization, EventController.update);
// router.patch("/:id", EventController.updateStatus);

module.exports = router;
