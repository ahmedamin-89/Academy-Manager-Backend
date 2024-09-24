const Team = require("../models/teamModel");
const Academy = require("../models/academyModel");
const User = require("../models/userModel");
const Event = require("../models/eventModel");
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
  const { teamId } = req.body;
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

exports.changeTeamInfo = async (req, res) => {
  const { yearsOfBirth, name, teamId } = req.body;
  try {
    const team = await Team.findById(teamId);
    team.name = name;
    team.yearsOfBirth = yearsOfBirth;
    await team.save();
    res.status(200).json({ message: "Team Info changed" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.deleteTeam = async (req, res) => {
  const { teamId } = req.params;
  try {
    const team = await Team.findById(teamId);
    const academy = await Academy.findById(team.academy);
    academy.teams = academy.teams.filter((id) => id.toString() !== teamId);
    await academy.save();
    await Team.findByIdAndDelete(teamId);
    res.status(200).json({ message: "Team deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.fetchTeam = async (req, res) => {
  const { teamId } = req.params;
  try {
    const team = await Team.findById(teamId)
      .populate("players")
      .populate("trainings");

    for (const player of team.players) {
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

    res.status(200).json({ team });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.teamAttendaceStats = async (req, res) => {
  const { teamId } = req.params;

  try {
    const startDate = new Date("2021-01-01");
    const endDate = new Date();

    // Fetch the team and populate players with their details
    const team = await Team.findById(teamId).populate({
      path: "players",
      select: "_id name parentPhoneNumber createdAt",
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const players = team.players;
    const playerIds = players.map((player) => player._id);

    // Build a map of player IDs to their data
    const playerDataMap = {};
    players.forEach((player) => {
      playerDataMap[player._id.toString()] = {
        name: player.name,
        parentPhoneNumber: player.parentPhoneNumber,
        createdAt: player.createdAt,
      };
    });

    // Use aggregation pipeline to calculate attendance
    const attendanceData = await Event.aggregate([
      {
        $match: {
          academy: team.academy,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $facet: {
          // Total session dates
          totalSessions: [
            {
              $group: {
                _id: null,
                dates: { $addToSet: "$date" },
              },
            },
          ],
          // Sessions attended by each player
          attendedSessions: [
            {
              $unwind: "$attendees",
            },
            {
              $match: {
                attendees: { $in: playerIds },
              },
            },
            {
              $group: {
                _id: "$attendees",
                attendedDates: { $addToSet: "$date" },
              },
            },
          ],
        },
      },
    ]);

    // Process the aggregation result
    const totalSessionDates = attendanceData[0].totalSessions[0]?.dates || [];

    // Initialize variables for team statistics
    let totalAttendanceRate = 0;
    let totalPossibleAttendances = 0;
    let totalActualAttendances = 0;
    let highestAttendanceRate = -1;
    let lowestAttendanceRate = 101;
    let bestAttendancePlayerStats = [];
    let worstAttendancePlayerStats = [];

    const playerStats = players.map((player) => {
      const playerIdStr = player._id.toString();
      const playerData = playerDataMap[playerIdStr];
      const joiningDate = playerData.createdAt;

      // Filter total sessions after the player's joining date
      const possibleSessionsDates = totalSessionDates.filter(
        (date) => date >= joiningDate
      );
      const possibleSessionsCount = possibleSessionsDates.length;

      // Find attended sessions count
      const attendedData = attendanceData[0].attendedSessions.find(
        (data) => data._id.toString() === playerIdStr
      );

      const attendedSessionsDates = attendedData
        ? attendedData.attendedDates.filter((date) => date >= joiningDate)
        : [];

      const attendedSessionsCount = attendedSessionsDates.length;

      // Calculate attendance rate
      const attendanceRate =
        possibleSessionsCount > 0
          ? (attendedSessionsCount / possibleSessionsCount) * 100
          : 0;

      // Update team statistics
      totalAttendanceRate += attendanceRate;
      totalPossibleAttendances += possibleSessionsCount;
      totalActualAttendances += attendedSessionsCount;

      // Prepare player's stats object
      const playerStat = {
        playerId: player._id,
        name: playerData.name,
        parentPhoneNumber: playerData.parentPhoneNumber,
        possibleSessionsCount,
        attendedSessionsCount,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)), // Store as number
      };

      // Update best attendance
      if (attendanceRate > highestAttendanceRate) {
        highestAttendanceRate = attendanceRate;
        bestAttendancePlayerStats = [playerStat];
      } else if (attendanceRate === highestAttendanceRate) {
        bestAttendancePlayerStats.push(playerStat);
      }

      // Update worst attendance
      if (attendanceRate < lowestAttendanceRate) {
        lowestAttendanceRate = attendanceRate;
        worstAttendancePlayerStats = [playerStat];
      } else if (attendanceRate === lowestAttendanceRate) {
        worstAttendancePlayerStats.push(playerStat);
      }

      return playerStat;
    });

    // Sort the playerStats array based on attendanceRate in descending order
    playerStats.sort((a, b) => b.attendanceRate - a.attendanceRate);

    // Calculate average attendance rate per team
    const averageAttendanceRate =
      players.length > 0
        ? parseFloat((totalAttendanceRate / players.length).toFixed(2))
        : "N/A";

    // Calculate team attendance percentage
    const teamAttendancePercentage =
      totalPossibleAttendances > 0
        ? parseFloat(
            ((totalActualAttendances / totalPossibleAttendances) * 100).toFixed(
              2
            )
          )
        : "N/A";

    res.status(200).json({
      playerStats, // Now sorted by attendance rate
      averageAttendanceRate,
      bestAttendancePlayers: bestAttendancePlayerStats,
      worstAttendancePlayers: worstAttendancePlayerStats,
      teamAttendancePercentage,
    });
  } catch (error) {
    console.error("Error fetching team attendance stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
