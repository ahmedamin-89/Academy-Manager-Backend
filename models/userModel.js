const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
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
  },
  academy: {
    type: Schema.Types.ObjectId,
    ref: "Academy",
  },
});

module.exports = mongoose.model("User", userSchema);
