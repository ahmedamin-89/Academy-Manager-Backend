const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const trainingSchema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
      enum: [
        "New Cairo",
        "Heliopolis",
        "Nasr City",
        "Sheikh Zayed",
        "Al Shorouk",
        "Al Rehab",
        "Maadi",
        "Mokattam",
        "Downtown",
        "6th of October",
      ],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    dayNames: [
      {
        type: String,
        required: true,
      },
    ],
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    academy: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
    },
  },
  {}
);

module.exports = mongoose.model("Training", trainingSchema);
