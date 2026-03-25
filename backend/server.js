require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const path = require("path");
const applyRoutes = require("./routes/applyRoutes");

const schemesRoutes = require(path.join(__dirname, "routes", "schemesRoutes"));

const app = express();

app.use(cors());
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ Mongo error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/schemes", schemesRoutes);
app.use("/api/apply", applyRoutes);

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});

let visitorCount = 0;

// API to increase count
app.get("/api/visit", (req, res) => {
  visitorCount++;
  res.json({ count: visitorCount });
});