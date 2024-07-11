const mongoose = require("mongoose");
const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    academy: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
    },
    coach: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    yearOfBirth: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
