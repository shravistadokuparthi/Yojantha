const express = require("express");
const router = express.Router();

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

//MARK AS INTERESTED
router.post("/interested", auth, async (req, res) => {
  try {
    const { schemeId } = req.body;

    console.log("Interested clicked:", schemeId);

    const user = await User.findById(req.user.id);

    if (!user.interestedSchemes.includes(schemeId)) {
      user.interestedSchemes.push(schemeId);
      await user.save();
    }

    res.json({
      message: "Added to interested",
      interested: user.interestedSchemes
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// APPLY
router.post("/apply", auth, async (req, res) => {
  try {
    const { schemeId } = req.body;

    console.log("Applied clicked:", schemeId);

    const user = await User.findById(req.user.id);

    if (!user.appliedSchemes.includes(schemeId)) {
      user.appliedSchemes.push(schemeId);
    }

    // remove from interested
    user.interestedSchemes = user.interestedSchemes.filter(
      id => id !== schemeId
    );

    await user.save();

    res.json({
      message: "Applied successfully",
      applied: user.appliedSchemes
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
