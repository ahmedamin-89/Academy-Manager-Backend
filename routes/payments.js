// routes/paymentRoutes.js

const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewear/requireAuth");

const {
  recordPayment,
  getPaymentStatus,
  fetchPlayerPayments,
} = require("../controllers/paymentsController");

// Authentication middleware can be added as needed

router.use(requireAuth);
router.post("/:playerId", recordPayment);
router.get("/player/:playerId", fetchPlayerPayments);
router.get("/status/:academyId", getPaymentStatus);

module.exports = router;
