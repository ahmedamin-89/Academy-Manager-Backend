const express = require("express");
const requireAuth = require("../middlewear/requireAuth");
const {
  createPlayer,
  fetchPlayers,
} = require("../controllers/playerController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createPlayer);
router.get("/", fetchPlayers);
router.get("/:teamId", fetchPlayers);

module.exports = router;
