const express = require("express");
const router = express.Router();

const Scheme = require("../models/Schemes");

// GET all schemes
router.get("/", async (req, res) => {
  try {
    const data = await Scheme.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;