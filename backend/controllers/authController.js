const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/emailService");
const dns = require("dns");
const util = require("util");
const resolveMx = util.promisify(dns.resolveMx);


/* Password regex */
const passwordRegex =
/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

/* REGISTER */

exports.register = async (req, res) => {

  try {

    const { name, email, password, confirmPassword, otp } = req.body;

    if (!name || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({
        message: "All fields including OTP are required"
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

    /* Verify OTP */
    const validOTP = await OTP.findOne({ email, code: otp });
    if (!validOTP) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Please request a new one."
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    /* Delete OTP after success */
    await OTP.deleteOne({ _id: validOTP._id });


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

/* CHECK EMAIL EXISTS */
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ exists: false, message: "Email required" });
    }
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ exists: false, message: "Server error" });
  }
};

/* SEND OTP */
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // 2. Quick DNS Check for Domain Existence
    const domain = email.split("@")[1];
    try {
      const addresses = await resolveMx(domain);
      if (!addresses || addresses.length === 0) {
        return res.status(400).json({ message: "Email domain does not exist or cannot receive emails" });
      }
    } catch (e) {
      return res.status(400).json({ message: "Invalid email domain" });
    }

    // 3. Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Save to DB (overwrite existing for same email)
    await OTP.findOneAndUpdate(
      { email },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // 5. Send Email
    try {
      await sendEmail({
        to: email,
        subject: "Yojanta - Email Verification Code",
        title: "Verify Your Email Address",
        body: `
          <p>Thank you for joining Yojanta. To complete your registration, please use the following verification code:</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h2>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        `
      });
    } catch (emailErr) {
      console.error("Nodemailer Error:", emailErr);
      return res.status(500).json({ message: "Email service error. Check your .env configuration." });
    }

    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error("General OTP Error:", error);
    res.status(500).json({ message: "An unexpected error occurred while sending OTP" });
  }
};
