const Team = require("../models/teamModel");
const Academy = require("../models/academyModel");
const User = require("../models/userModel");
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

    const { teams } = await Academy.findById(user.academy).populate("teams");

    for (const team of teams) {
      if (!team.imageName) {
        continue;
      }
      const getObjectParams = {
        Bucket: bucketName,
        Key: team.imageName,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      team.imageUrl = url;
    }

    res.status(200).json({ teams });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.changeTeamPhoto = async (req, res) => {
  const { photo, teamId } = req.body;
  try {
    const params = {
      Bucket: bucketName,
      Key: randomImageName(),
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const team = await Team.findById(teamId);

    team.imageName = params.Key;

    await team.save();

    res.status(200).json({ message: "Photo changed" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};
