const User = require("../models/User");

exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};

exports.updateProfile = async (req, res) => {

  try {

    const { mobile, city, dob, gender } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { mobile, city, dob, gender },
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};

//password update
const bcrypt = require("bcryptjs");

exports.updatePassword = async (req, res) => {

  try {

    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user.id);

    // check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};