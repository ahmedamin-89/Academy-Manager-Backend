const express = require("express");
const { createTeam, fetchTeams } = require("../controllers/teamController");
const requireAuth = require("../middlewear/requireAuth");

const router = express.Router();

router.use(requireAuth);
router.post("/", createTeam);
router.get("/", fetchTeams);

module.exports = router;
