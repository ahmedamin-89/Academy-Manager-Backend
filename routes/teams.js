const express = require("express");
const {
  createTeam,
  fetchTeams,
  changeTeamPhoto,
} = require("../controllers/teamController");
const requireAuth = require("../middlewear/requireAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.use(requireAuth);
router.post("/", createTeam);
router.get("/", fetchTeams);
router.post("/photo", upload.single("image"), changeTeamPhoto);

module.exports = router;
