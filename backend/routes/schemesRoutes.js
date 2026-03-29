const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Scheme = require("../models/Schemes");

//  FILTER SCHEMES
router.get("/", async (req, res) => {
  try {
    const { type, level } = req.query;

    let query = {};

    if (type) {
      query.schemeCategory = { $regex: type, $options: "i" };
    }

    if (level) {
      query.level = { $regex: level, $options: "i" };
    }

    const data = await Scheme.find(query);
    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// FETCH BY IDS 
router.post("/byIds", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.json([]);
    }

    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    const schemes = await Scheme.find({
      _id: { $in: objectIds }
    });

    res.json(schemes);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
