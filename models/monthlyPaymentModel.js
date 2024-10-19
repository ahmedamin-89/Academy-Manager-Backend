// models/MonthlyPayment.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const monthlyPaymentSchema = new Schema(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: Date, // Optional, only set when paid
    dueDate: {
      type: Date,
      required: true,
    },
    academy: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
    },
    collectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    collectedByName: {
      type: String,
    },
    playerName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MonthlyPayment", monthlyPaymentSchema);
