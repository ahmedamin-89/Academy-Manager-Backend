const User = require("../models/userModel");
const Player = require("../models/playerModel");
const Academy = require("../models/academyModel");
const Team = require("../models/teamModel");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require("dotenv");
const crypto = require("crypto");

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

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

    res
      .status(200)
      .json({ message: "Player created successfully", playerId: player._id });
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
    res.status(200).json({ players });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.changePlayerPhoto = async (req, res) => {
  const { playerId } = req.params;
  try {
    const params = {
      Bucket: bucketName,
      Key: randomImageName(),
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const player = await Player.findById(playerId);
    player.imageName = params.Key;

    await player.save();
    res.status(200).json({ message: "Player photo updated successfully" });
  } catch (error) {
    console.error("Error updating player photo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deletePlayer = async (req, res) => {
  const { playerId } = req.params;
  try {
    const player = await Player.findById(playerId);
    const team = await Team.findById(player.team);
    team.players = team.players.filter((player) => player !== playerId);
    await team.save();

    const academy = await Academy.findById(player.academy);
    academy.players = academy.players.filter((player) => player !== playerId);
    await academy.save();

    await Player.findByIdAndDelete(playerId);

    res.status(200).json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.modifyAttendanceCount = async (req, res) => {
  const { playerId } = req.params;
  const { increment } = req.body;
  try {
    const player = await Player.findById(playerId);
    if (increment) {
      player.attendanceCount += 1;
    } else {
      player.attendanceCount -= 1;
    }
    await player.save();

    res.status(200).json({ message: "Player attendance count updated" });
  } catch (error) {
    console.error("Error updating player attendance count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
