const router = require("express").Router();
const SportsController = require("../controllers/sportsController");

router.get("/teams", SportsController.teams);
router.get("/squads", SportsController.squad);
router.get("/players", SportsController.playerStatistics);

module.exports = router;
