const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "coach", "player", "parent"],
      default: "admin",
    },
    academy: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
    },
  },
  { timestamps: true }
);

userSchema.statics.createAccount = async function (
  password,
  phoneNumber,
  name
) {
  if (!password || !phoneNumber) {
    throw Error("All fields must be filled");
  }

  const phoneExists = await this.findOne({ phoneNumber });

  if (phoneExists) {
    throw Error("Phone number already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  try {
    const user = await this.create({
      password: hash,
      phoneNumber,
      name,
    });

    return user;
  } catch (err) {
    throw err;
  }
};

userSchema.statics.login = async function (phoneNumber, password) {
  if (!phoneNumber || !password) {
    throw Error("All fields must be filled!");
  }

  const user = await this.findOne({ phoneNumber });

  if (!user) {
    throw Error("Phone number not found!");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password!");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
