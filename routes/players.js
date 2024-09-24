const express = require("express");
const requireAuth = require("../middlewear/requireAuth");
const {
  createPlayer,
  fetchPlayers,
  changePlayerPhoto,
  deletePlayer,
  modifyAttendanceCount,
  getSessionAttendanceRate,
} = require("../controllers/playerController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.use(requireAuth);

router.post("/", createPlayer);
router.post("/:playerId/image", upload.single("image"), changePlayerPhoto);
router.get("/team/:teamId", fetchPlayers);
router.get("/", fetchPlayers);
router.get("/year/:yearOfBirth", fetchPlayers);
router.delete("/:playerId", deletePlayer);
router.post("/:playerId/attendance", modifyAttendanceCount);
router.get("/:playerId/attendanceRate", getSessionAttendanceRate);

module.exports = router;
