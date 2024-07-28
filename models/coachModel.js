const mongoose = require("mongoose");
const { Schema } = mongoose;

const coachSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    academy: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coach", coachSchema);
