const Team = require("../models/teamModel");
const Academy = require("../models/academyModel");
const User = require("../models/userModel");
const Training = require("../models/trainingModel");
const Event = require("../models/eventModel");
const Player = require("../models/playerModel");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require("dotenv");

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});

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
    startTime,
    endTime,
    location,
    dayNames,
    startDate,
    endDate,
    area,
  } = req.body;
  const user_id = req.user._id;
  const user = await User.findById(user_id);

  const trainingDates = getDaysBetweenDates(
    new Date(startDate),
    new Date(endDate),
    dayNames
  );

  try {
    const training = await Training.create({
      team,
      startTime,
      endTime,
      location,
      area,
      dayNames,
      academy: user.academy,
    });

    const academyTeam = await Team.findById(team);
    academyTeam.trainings.push(training._id);
    await academyTeam.save();

    const academy = await Academy.findById(user.academy);
    academy.trainings.push(training._id);
    await academy.save();

    const events = [];
    for (const date of trainingDates) {
      const event = await Event.create({
        title: `Training - ${academyTeam.name}`,
        date,
        location,
        type: "training",
        startTime,
        endTime,
        teams: [academyTeam._id],
        academy: user.academy,
      });
      events.push(event._id);
      await event.save();
    }
    console.log("events", events);
    training.events = events;
    await training.save();

    res.status(200).json({ message: "Training created successfully" });
  } catch (error) {
    console.error("Error creating training:", error);
    res.status(500).json({ message: "Error creating training", error });
  }
};

exports.fetchTeamTrainings = async (req, res) => {
  const { teamId } = req.params;

  try {
    const trainings = (await Team.findById(teamId).populate("trainings"))
      .trainings;
    console.log(trainings);

    res.status(200).json({ trainings });
  } catch (error) {
    console.error("Error fetching trainings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.fetchTrainingEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await Event.findById(eventId);
    const players = (await Team.findById(event.teams[0]).populate("players"))
      .players;
    for (const player of players) {
      if (!player.imageName) {
        continue;
      }
      const getObjectParams = {
        Bucket: bucketName,
        Key: player.imageName,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      player.imageUrl = url;
    }

    res.status(200).json({ event, players });
  } catch (error) {
    console.error("Error fetching training event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
