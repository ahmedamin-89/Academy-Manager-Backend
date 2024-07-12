const express = require("express");
const {
  createUser,
  login,
  fetchUser,
} = require("../controllers/userController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/", createUser);
router.post("/login", login);

router.get("/", requireAuth, fetchUser);

module.exports = router;
