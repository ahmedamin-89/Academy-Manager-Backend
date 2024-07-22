const express = require("express");
const requireAuth = require("../middlewear/requireAuth");

const router = express.Router();

router.use(requireAuth);

module.exports = router;
