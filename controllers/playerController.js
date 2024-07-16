const Player = require("./models/Player");
const User = require("./models/User"); // Assuming you have a User model

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
