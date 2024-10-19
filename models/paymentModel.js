const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    playerName: {
      type: String,
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
    monthlyPayments: [
      {
        type: Schema.Types.ObjectId,
        ref: "MonthlyPayment",
      },
    ],

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
