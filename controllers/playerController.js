const User = require("../models/userModel");
const Player = require("../models/playerModel");

exports.createPlayer = async (req, res) => {
  const {
    playerName,
    parentName,
    parentPhone,
    playerPhone,
    DOB,
    position,
    team,
    rating,
  } = req.body;
  const user_id = req.user._id;
  const user = await User.findById(user_id);

  try {
    const player = await Player.create({
      name: playerName,
      dateOfBirth: new Date(DOB),
      position,
      academy: user.academy,
      parentName,
      parentPhoneNumber: parentPhone,
      phoneNumber: playerPhone,
    });

    res.status(200).json({ player });
  } catch (error) {
    console.error("Error creating player:", error);
  }
};
