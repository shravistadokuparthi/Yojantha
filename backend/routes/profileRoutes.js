const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const { 
  getProfile, 
  updateProfile, 
  updatePassword 
} = require("../controllers/profileController");

router.get("/profile", auth, getProfile);

router.put("/profile", auth, updateProfile);

router.put("/update-password", auth, updatePassword);

module.exports = router;