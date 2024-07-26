const requireAuth = require("../middlewear/requireAuth");
const User = require("../models/userModel");
const Academy = require("../models/academyModel");
const jwt = require("jsonwebtoken");

const createToken = (_id) =>
  jwt.sign({ _id }, process.env.USER_AUTH_KEY, { expiresIn: "180d" });

exports.createUser = async (req, res) => {
  const { name, phoneNumber, password, role } = req.body;

  try {
    const user = await User.createAccount(password, phoneNumber, name);

    if (role) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const user = await User.login(phoneNumber, password);

    const token = createToken(user._id);

    res.status(200).json({ token });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.fetchUser = async (req, res) => {
  const user_id = req.user._id;
  try {
    const user = await User.findById(user_id);
    const academy = await Academy.aggregate([
      {
        $match: {
          admins: user._id,
        },
      },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "academy",
          as: "teams",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          teams: 1,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          teams: 1,
          teams: {
            _id: 1,
            name: 1,
          },
        },
      },
    ])
      .exec()
      .then((results) => results[0]);

    console.log(academy);
    res.status(200).json({ user, academy });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};
