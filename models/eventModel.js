const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["training", "birthday", "match", "camp"],
    },

    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    academy: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],

    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
