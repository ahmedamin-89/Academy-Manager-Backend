const mongoose = require("mongoose");
const { Schema } = mongoose;

const academySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Academy", academySchema);
