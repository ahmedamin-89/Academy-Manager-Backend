const mongoose = require("mongoose");
const { Schema } = mongoose;

const playerSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  position: {
    type: String,
    required: true,
    enum: ["goalkeeper", "defender", "midfielder", "forward"],
  },
  academy: {
    type: Schema.Types.ObjectId,
    ref: "Academy",
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: "Team",
  },
  payments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
});

module.exports = mongoose.model("Player", playerSchema);
