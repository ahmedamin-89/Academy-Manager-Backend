const User = require("../models/userModel");
const Player = require("../models/playerModel");
const Academy = require("../models/academyModel");
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

    res.status(200).json({ message: "Player created successfully" });
  } catch (error) {
    console.error("Error creating player:", error);
  }
};

exports.fetchPlayers = async (req, res) => {
  const user_id = req.user._id;
  const { teamId } = req.params;
  const user = await User.findById(user_id);

  try {
    let players;
    if (teamId) {
      // Fetch only players from the specified team
      const team = await Team.findById(teamId).populate("players");
      players = team.players;
    } else {
      // Fetch all players from the user's academy
      const academy = await Academy.findById(user.academy).populate("players");
      players = academy.players;
    }
    res.status(200).json({ players });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
