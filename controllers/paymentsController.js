// controllers/paymentController.js

const Payment = require("../models/paymentModel");
const MonthlyPayment = require("../models/monthlyPaymentModel");
const Player = require("../models/playerModel");
const Academy = require("../models/academyModel");
const User = require("../models/userModel");

exports.recordPayment = async (req, res) => {
  try {
    const user_id = req.user._id;

    const user = await User.findById(user_id);

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
      collectedBy: user_id,
      collectedByName: user.name,
      playerName: player.name,
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
        collectedBy: user_id,
        collectedByName: user.name,
        playerName: player.name,
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

    // Extract query parameters for filtering
    const teamId = req.query.teamId || null;
    const search = req.query.search || "";
    const status = req.query.status || null; // "Paid" or "Unpaid"

    // Build the player query
    const playerQuery = { academy: academyId };
    if (teamId) {
      playerQuery.team = teamId;
    }
    if (search) {
      playerQuery.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Fetch all players based on the query
    const players = await Player.find(playerQuery).populate("team");

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

    // Prepare the payment status list
    let paymentStatusList = players.map((player) => {
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
        teamId: player.team ? player.team._id : null,
        teamName: player.team ? player.team.name : null,
        paid,
        amountPaid,
        amountDue,
      };
    });

    // Filter by payment status if 'status' query parameter is provided
    if (status) {
      if (status === "Paid") {
        paymentStatusList = paymentStatusList.filter((item) => item.paid);
      } else if (status === "Unpaid") {
        paymentStatusList = paymentStatusList.filter((item) => !item.paid);
      }
    }

    res.status(200).json({ paymentStatusList });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.fetchPlayerPayments = async (req, res) => {
  try {
    const { playerId } = req.params;

    const player = await Player.findById(playerId).populate("payments");
    if (!player) {
      return res.status(404).json({ error: "Player not found." });
    }

    res.status(200).json({ payments: player.payments });
  } catch (error) {
    console.error("Error fetching player payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
