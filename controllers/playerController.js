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
  try {
    const player = await Player.create({
      playerName,
      parentName,
      parentPhone,
      playerPhone,
      DOB,
      position,
      team,
      rating,
    });

    res.status(200).json({ player });
  } catch (error) {
    console.error("Error creating player:", error);
  }
};
