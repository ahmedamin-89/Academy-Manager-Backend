const express = require("express");
const { createTeam, fetchTeams } = require("../controllers/teamController");
const requireAuth = require("../middlewear/requireAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

upload.single("image");

const router = express.Router();

router.use(requireAuth);
router.post("/", createTeam);
router.get("/", fetchTeams);

module.exports = router;
