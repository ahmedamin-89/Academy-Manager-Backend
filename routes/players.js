const express = require("express");
const requireAuth = require("../middlewear/requireAuth");
const { createPlayer } = require("../controllers/playerController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createPlayer);

module.exports = router;
