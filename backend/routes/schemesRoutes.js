const express = require("express");
const router = express.Router();

const Scheme = require("../models/Schemes");

// ✅ Filter by category from query
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;

    let query = {};

    if (type) {
      query.schemeCategory = { $regex: type, $options: "i" }; // case-insensitive
    }

    const data = await Scheme.find(query).limit(50); // 🔥 LIMIT for speed

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;