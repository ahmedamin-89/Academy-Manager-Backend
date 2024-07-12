const mongoose = require("mongoose");
const { Schema } = mongoose;

const academySchema = new Schema(
  {
    name: {
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

academySchema.statics.createAcademy = async function (name) {
  if (!name) {
    throw Error("All fields must be filled");
  }

  const academyExists = await this.findOne({ name });

  if (academyExists) {
    throw Error("Academy already exists");
  }

  try {
    const academy = await this.create({
      name,
    });

    return academy;
  } catch (err) {
    throw Error(err);
  }
};

module.exports = mongoose.model("Academy", academySchema);
