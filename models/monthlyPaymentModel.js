// models/MonthlyPayment.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const monthlyPaymentSchema = new Schema({
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
});

module.exports = mongoose.model("MonthlyPayment", monthlyPaymentSchema);
