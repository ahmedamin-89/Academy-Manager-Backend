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
    imageName: {
      type: String,
    },

    coaches: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    yearsOfBirth: {
      type: [Number],
      required: true,
    },
    imageUrl: {
      type: String,
    },

    trainings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Training",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
