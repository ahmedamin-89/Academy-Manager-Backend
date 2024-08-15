const express = require("express");
const requireAuth = require("../middlewear/requireAuth");
const {
  createPlayer,
  fetchPlayers,
  changePlayerPhoto,
  deletePlayer,
} = require("../controllers/playerController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.use(requireAuth);

router.post("/", createPlayer);
router.post("/:playerId/image", upload.single("image"), changePlayerPhoto);
router.get("/", fetchPlayers);
router.get("/:teamId", fetchPlayers);
router.get("/year/:yearOfBirth", fetchPlayers);
router.delete("/:playerId", deletePlayer);

module.exports = router;
