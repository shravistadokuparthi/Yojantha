const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* Password regex */
const passwordRegex =
/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

/* REGISTER */

exports.register = async (req, res) => {

  try {

    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    /* password should not contain username */
    if (password.toLowerCase().includes(name.toLowerCase())) {
      return res.status(400).json({
        message: "Password cannot contain username"
      });
    }

    /* regex validation */
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
        "Password must contain at least 8 characters including letters, numbers and special symbols"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful"
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};


/* LOGIN */

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};


/* FORGOT PASSWORD */

exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email"
      });
    }

    res.json({
      message: "Email found. You can now reset your password."
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};


/* RESET PASSWORD */

exports.resetPassword = async (req, res) => {

  try {

    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    /* extract username from email */
    const username = email.split("@")[0].toLowerCase();

    /* password cannot contain username */
    if (newPassword.toLowerCase().includes(username)) {
      return res.status(400).json({
        message: "Password cannot contain username"
      });
    }

    /* regex validation */
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
        "Password must contain at least 8 characters including letters, numbers and special symbols"
      });
    }

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