const Academy = require("../models/academyModel");
const User = require("../models/userModel");

exports.createAcademy = async (req, res) => {
  const { name, adminName, adminPassword, adminPhoneNumber } = req.body;

  try {
    const academy = await Academy.createAcademy(name);
    const admin = await User.createAccount(
      adminPassword,
      adminPhoneNumber,
      adminName
    );
    admin.role = "admin";
    admin.academy = academy._id;

    academy.admins.push(admin._id);

    await admin.save();
    await academy.save();

    res.status(200).json({ academy });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};
