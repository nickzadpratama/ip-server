const express = require("express");
const router = express.Router();

const lodgingRouter = require("./lodging");
const typeRouter = require("./type");

router.get("/", (req, res) => {
  try {
    res.redirect("/lodging");
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

router.use("/lodgings", lodgingRouter);
router.use("/types", typeRouter);

module.exports = router;
