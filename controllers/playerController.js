const User = require("../models/userModel");
const Player = require("../models/playerModel");
const Team = require("../models/teamModel");

exports.createPlayer = async (req, res) => {
  const {
    playerName,
    parentName,
    parentPhone,
    playerPhone,
    DOB,
    position,
    rating,
    team,
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
      team: team,
      rating,
      yearOfBirth: new Date(DOB).getFullYear(),
    });

    const academyTeam = await Team.findById(player.team);
    academyTeam.players.push(player._id);
    await academyTeam.save();

    const academy = await Academy.findById(user.academy);
    academy.players.push(player._id);
    await academy.save();

    res.status(200).json({ player });
  } catch (error) {
    console.error("Error creating player:", error);
  }
};
