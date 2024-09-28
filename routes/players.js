const express = require("express");
const requireAuth = require("../middlewear/requireAuth");
const {
  createPlayer,
  fetchPlayers,
  fetchPlayerById,
  changePlayerPhoto,
  deletePlayer,
  modifyAttendanceCount,
  getSessionAttendanceRate,
} = require("../controllers/playerController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

/**
 * General Player Routes
 */

// Create a new player
router.post("/", createPlayer);

// Fetch players
router.get("/", fetchPlayers); // Fetch all players
router.get("/team/:teamId", fetchPlayers); // Fetch players by team
router.get("/year/:yearOfBirth", fetchPlayers); // Fetch players by year of birth

/**
 * Player-Specific Routes
 */

// Fetch a player by ID
router.get("/player/:playerId", fetchPlayerById);

// Update a player's photo
router.post(
  "/player/:playerId/image",
  upload.single("image"),
  changePlayerPhoto
);

// Modify a player's attendance count
router.post("/player/:playerId/attendance", modifyAttendanceCount);

// Get a player's session attendance rate
router.get("/player/:playerId/attendanceRate", getSessionAttendanceRate);

// Delete a player
router.delete("/player/:playerId", deletePlayer);

module.exports = router;
