const express = require("express");
const requireAuth = require("../middlewear/requireAuth");
const { fetchDateTrainingEvents } = require("../controllers/eventController");

const router = express.Router();

router.use(requireAuth);

router.get("/trainings/:date", fetchDateTrainingEvents);
module.exports = router;
