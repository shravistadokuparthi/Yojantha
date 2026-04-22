const express = require("express");
const router = express.Router();

const { register, login, forgotPassword, resetPassword, checkEmail, sendOTP } = require("../controllers/authController");

router.post("/register", register);
router.post("/send-otp", sendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/check-email", checkEmail);

router.put("/reset-password", resetPassword);

module.exports = router;
