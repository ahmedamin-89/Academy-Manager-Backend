const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema({
  player: {
    type: Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paymentType: {
    type: String,
    required: true,
    enum: ["monthly", "quarterly", "half-yearly", "yearly"],
    default: "monthly",
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "paid", "overdue"],
    default: "pending",
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
