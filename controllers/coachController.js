const Coach = require("../models/coachModel");
const Team = require("../models/teamModel");
const User = require("../models/userModel");
const Academy = require("../models/academyModel"); // Ensure you import the Academy model
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

exports.createCoach = async (req, res) => {
  const { name, phoneNumber, teams } = req.body;
  const user_id = req.user._id;

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const coach = await Coach.create({
      name,
      phoneNumber,
      academy: user.academy,
      teams: teams.map((team) => new ObjectId(team)),
    });

    for (const teamId of teams) {
      const academyTeam = await Team.findById(teamId);
      if (!academyTeam) {
        console.error(`Team with ID ${teamId} not found`);
        continue;
      }
      academyTeam.coaches.push(coach._id);
      await academyTeam.save();
    }

    const academy = await Academy.findById(user.academy);
    if (!academy) {
      return res.status(404).json({ message: "Academy not found" });
    }
    academy.coaches.push(coach._id);
    await academy.save();

    res.status(200).json({ message: "Coach created successfully" });
  } catch (error) {
    console.error("Error creating coach:", error);
    res.status(500).json({ message: "Error creating coach", error });
  }
};

exports.fetchCoaches = async (req, res) => {
  const user_id = req.user._id;
  const user = await User.findById(user_id);

  try {
    const coaches = await Coach.find({ academy: user.academy });

    res.status(200).json({ coaches });
  } catch (error) {
    console.error("Error fetching coaches:", error);
    res.status(500).json({ message: "Error fetching coaches", error });
  }
};
