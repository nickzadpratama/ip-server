const router = require("express").Router();
const MembershipController = require("../controllers/membershipController");

router.get("/", MembershipController.list);
router.put("/:externalTeamId", MembershipController.join);
router.delete("/:externalTeamId", MembershipController.leave);

module.exports = router;