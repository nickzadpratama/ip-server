const express = require("express");
const LodgingController = require("../controllers/lodgingController");
const authorization = require("../middlewares/authorization");
const router = express.Router();
const upload = require("../utils/multer");

router.get("/", LodgingController.read);

router.post("/", LodgingController.create);
router.get("/:id", LodgingController.lodgingById);

router.put("/:id", authorization, LodgingController.update);
router.delete("/:id", authorization, LodgingController.delete);
router.patch(
  "/:id",
  authorization,
  upload.single("image"),
  LodgingController.updateImage,
);

module.exports = router;
