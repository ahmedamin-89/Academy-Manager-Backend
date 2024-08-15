const mongoose = require("mongoose");
const { Schema } = mongoose;

const positions = [
  "ST",
  "LW/LM",
  "RW/RM",
  "CM/CDM",
  "LB",
  "CB",
  "RB",
  "GK",
  "CAM",
];

const playerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    parentName: {
      type: String,
      required: true,
    },
    parentPhoneNumber: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },
    position: {
      type: [String],
      required: true,
      enum: positions,
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
    parent: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      default: 0,
    },
    yearOfBirth: {
      type: Number,
    },
    imageName: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Player", playerSchema);
