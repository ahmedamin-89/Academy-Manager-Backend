const express = require("express");
const {
  createTeam,
  fetchTeams,
  changeTeamPhoto,
  changeTeamInfo,
  deleteTeam,
} = require("../controllers/teamController");
const requireAuth = require("../middlewear/requireAuth");
const multer = require("multer");
const { createTraining } = require("../controllers/trainingController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.use(requireAuth);
router.post("/", createTeam);
router.get("/", fetchTeams);

router.post("/photo", upload.single("image"), changeTeamPhoto); // Change Team Photo

router.patch("/info", changeTeamInfo); // Change Team Info

router.delete("/:teamId", deleteTeam);

router.post("/training", createTraining);

module.exports = router;
