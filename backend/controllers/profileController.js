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


/* PASSWORD REGEX */
const passwordRegex =
/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

exports.updatePassword = async (req, res) => {

  try {

    const { oldPassword, newPassword, confirmPassword } = req.body;

    /* Check all fields */
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required"
      });
    }

    const user = await User.findById(req.user.id);

    /* Check old password */
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password incorrect"
      });
    }

    /* Password cannot equal username */
    if (newPassword.toLowerCase() === user.name.toLowerCase()) {
      return res.status(400).json({
        message: "Password cannot be same as username"
      });
    }

    /* Regex validation */
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
        "Password must contain at least 8 characters including letters, numbers and special symbols"
      });
    }

    /* Confirm password check */
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    /* Hash new password */
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "Password updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};