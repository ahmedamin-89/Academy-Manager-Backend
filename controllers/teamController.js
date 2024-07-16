const Team = require("../models/teamModel");
const Academy = require("../models/academyModel");
const User = require("../models/userModel");

exports.createTeam = async (req, res) => {
  const { teamName, yearsOfBirth } = req.body;
  const user_id = req.user._id;
  try {
    const user = await User.findById(user_id);

    const academy = await Academy.findById(user.academy);

    const team = new Team({
      name: teamName,
      yearsOfBirth,
      academy: academy._id,
    });

    academy.teams.push(team._id);

    await academy.save();
    await team.save();

    res.status(200).json({ team });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.fetchTeams = async (req, res) => {
  const user_id = req.user._id;
  try {
    const user = await User.findById(user_id);

    const academy = await Academy.findById(user.academy).populate("teams");

    res.status(200).json({ teams: academy.teams });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};
