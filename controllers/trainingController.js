const Team = require("../models/teamModel");
const Academy = require("../models/academyModel");
const User = require("../models/userModel");
const Training = require("../models/trainingModel");
const Event = require("../models/eventModel");
const getDaysBetweenDates = (startDate, endDate, dayNames) => {
  const days = [];
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    if (dayNames.includes(getDayName(date))) {
      days.push(new Date(date)); // Create a new Date object before pushing
    }
  }
  return days;
};
const getDayName = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};

exports.createTraining = async (req, res) => {
  const {
    team,
    date,
    startTime,
    endTime,
    location,
    dayNames,
    description,
    startDate,
    endDate,
  } = req.body;
  const user_id = req.user._id;
  const user = await User.findById(user_id);

  const trainingDates = getDaysBetweenDates(
    new Date(startDate),
    new Date(endDate),
    dayNames
  );

  try {
    //     const training = await Training.create({
    //       team,
    //       date,
    //       startTime,
    //       endTime,
    //       location,
    //       description,
    //       academy: user.academy,
    //     });

    //     const academyTeam = await Team.findById(team);
    //     academyTeam.trainings.push(training._id);
    //     await academyTeam.save();
    //     const academy = await Academy.findById(user.academy);
    //     academy.trainings.push(training._id);
    //     await academy.save();

    res.status(200).json({ message: "Training created successfully" });
  } catch (error) {
    console.error("Error creating training:", error);
    res.status(500).json({ message: "Error creating training", error });
  }
};
