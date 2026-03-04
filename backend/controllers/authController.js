const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

  try {

    const { name, email, password, confirmPassword } = req.body;

    // check if all fields exist
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
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

//LOGIN

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password"
      });
    }

    // create token
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

//forgot password
exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    res.json({
      message: "Email found. You can now reset your password."
    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};

exports.resetPassword = async (req,res)=>{

  const { email, newPassword, confirmPassword } = req.body;

  if(newPassword !== confirmPassword){
    return res.status(400).json({message:"Passwords do not match"});
  }

  const user = await User.findOne({email});

  if(!user){
    return res.status(404).json({message:"User not found"});
  }

  const bcrypt = require("bcryptjs");

  const hashedPassword = await bcrypt.hash(newPassword,10);

  user.password = hashedPassword;

  await user.save();

  res.json({message:"Password updated successfully"});

};