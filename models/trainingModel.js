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
      enum: ["New Cairo"],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    days: [
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
  },
  {}
);

module.exports = mongoose.model("Training", trainingSchema);
