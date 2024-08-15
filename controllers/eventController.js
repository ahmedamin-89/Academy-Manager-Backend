const Event = require("../models/eventModel");
const User = require("../models/userModel");

exports.fetchDateTrainingEvents = async (req, res) => {
  const user_id = req.user._id;
  const { date } = req.params;
  try {
    console.log("Fetching events for date:", date);
    const user = await User.findById(user_id);
    const events = await Event.find({
      academy: user.academy,
      date: date,
    });
    console.log("Events fetched:", events.length);
    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error });
  }
};

exports.addPlayerAttendance = async (req, res) => {
  // const user_id = req.user._id;
  const { eventId } = req.params;
  const { players } = req.body;
  console.log("Adding player attendance:", players);
  try {
    const event = await Event.findById(eventId);
    event.attendees = players;
    await event.save();
    res.status(200).json({ message: "Player attendance added" });
  } catch (error) {
    console.error("Error adding player attendance:", error);
    res.status(500).json({ message: "Error adding player attendance", error });
  }
};
