const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const { 
  getProfile, 
  updateProfile, 
  updatePassword,
  addInterestedScheme,
  addAppliedScheme
} = require("../controllers/profileController");

router.get("/profile", auth, getProfile);

router.put("/profile", auth, updateProfile);

router.put("/update-password", auth, updatePassword);

router.post("/add-interested", auth, addInterestedScheme);

router.post("/add-applied", auth, addAppliedScheme);

module.exports = router;