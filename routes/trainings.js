const express = require("express");
const requireAuth = require("../middlewear/requireAuth");

const {
  createTraining,
  fetchTeamTrainings,
  fetchTrainingEvent,
} = require("../controllers/trainingController");
const { addPlayerAttendance } = require("../controllers/eventController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createTraining);

router.get("/:teamId", fetchTeamTrainings);
router.get("/event/:eventId", fetchTrainingEvent);
router.post("/:eventId/attendance", addPlayerAttendance);

module.exports = router;
