// controllers/paymentController.js

const Payment = require("../models/paymentModel");
const MonthlyPayment = require("../models/monthlyPaymentModel");
const Player = require("../models/playerModel");
const Academy = require("../models/academyModel");

exports.recordPayment = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { amount, paymentType, paymentDate } = req.body;

    // Validate input
    if (!amount || !paymentType || !paymentDate) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Find the player and academy
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: "Player not found." });
    }

    const academy = await Academy.findById(player.academy);
    if (!academy) {
      return res.status(404).json({ error: "Academy not found." });
    }

    // Calculate the number of months based on paymentType
    let monthsPaidFor;
    switch (paymentType) {
      case "monthly":
        monthsPaidFor = 1;
        break;
      case "quarterly":
        monthsPaidFor = 3;
        break;
      case "half-yearly":
        monthsPaidFor = 6;
        break;
      case "yearly":
        monthsPaidFor = 12;
        break;
      default:
        return res.status(400).json({ error: "Invalid payment type." });
    }

    // Apply any discounts
    const discountPercent = player.appliedDiscountPercent || 0;
    const baseFeePerMonth = academy.fees * (1 - discountPercent / 100);

    // Verify the amount matches the expected amount
    const expectedAmount = baseFeePerMonth * monthsPaidFor;
    if (parseFloat(amount) !== expectedAmount) {
      return res.status(400).json({
        error: `Invalid amount. Expected amount for ${paymentType} payment is ${expectedAmount}.`,
      });
    }

    // Create a new Payment document
    const payment = new Payment({
      player: playerId,
      amount: amount,
      paymentDate: new Date(paymentDate),
      dueDate: new Date(paymentDate), // Adjust if needed
      paymentType: paymentType,
      academy: academy._id,
    });

    // Create MonthlyPayment documents
    const monthlyPayments = [];
    for (let i = 0; i < monthsPaidFor; i++) {
      const dueDate = new Date(paymentDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const monthlyPayment = new MonthlyPayment({
        player: playerId,
        amount: baseFeePerMonth,
        paymentDate: new Date(paymentDate),
        dueDate: dueDate,
        academy: academy._id,
      });

      await monthlyPayment.save();
      monthlyPayments.push(monthlyPayment._id);
    }

    payment.monthlyPayments = monthlyPayments;
    await payment.save();

    // Update the player's payments and lastPaymentDate
    player.payments.push(payment._id);
    player.lastPaymentDate = new Date(paymentDate);
    await player.save();

    res.status(201).json({
      message: "Payment recorded successfully.",
      payment,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// controllers/paymentController.js

exports.getPaymentStatus = async (req, res) => {
  try {
    const { academyId } = req.params;
    const dateParam = req.query.date || new Date(); // Use current date if not provided
    const date = new Date(dateParam);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed (0 = January)

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999); // End of the month

    // Fetch the academy to get the base fees
    const academy = await Academy.findById(academyId);
    const baseFee = academy.fees;

    // Fetch all MonthlyPayments for the academy and month
    const monthlyPayments = await MonthlyPayment.find({
      academy: academyId,
      dueDate: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).populate("player");

    // Map payments by player ID
    const paymentsByPlayer = {};

    monthlyPayments.forEach((payment) => {
      const playerId = payment.player._id.toString();
      if (!paymentsByPlayer[playerId]) {
        paymentsByPlayer[playerId] = [];
      }
      paymentsByPlayer[playerId].push(payment);
    });

    // Fetch all players in the academy
    const players = await Player.find({ academy: academyId });

    // Prepare the payment status list
    const paymentStatusList = players.map((player) => {
      const playerId = player._id.toString();
      const payments = paymentsByPlayer[playerId] || [];

      const discountPercent = player.appliedDiscountPercent || 0;
      const amountDuePerMonth = baseFee * (1 - discountPercent / 100);
      let amountPaid = 0;

      payments.forEach((payment) => {
        if (payment.paymentDate) {
          amountPaid += payment.amount;
        }
      });

      const amountDue = Math.max(amountDuePerMonth - amountPaid, 0);
      const paid = amountDue === 0;

      return {
        playerId: player._id,
        name: player.name,
        paid,
        amountPaid,
        amountDue,
      };
    });

    res.status(200).json({ paymentStatusList });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
