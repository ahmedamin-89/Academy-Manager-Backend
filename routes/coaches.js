const express = require("express");
const requireAuth = require("../middlewear/requireAuth");
const { createCoach, fetchCoaches } = require("../controllers/coachController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createCoach);
router.get("/", fetchCoaches);

module.exports = router;
