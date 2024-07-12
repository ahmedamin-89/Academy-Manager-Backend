const express = require("express");
const { createAcademy } = require("../controllers/academyController");

const router = express.Router();

router.post("/", createAcademy);

module.exports = router;
