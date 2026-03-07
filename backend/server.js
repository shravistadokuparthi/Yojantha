require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error:", err));


app.use("/api/auth", authRoutes);


app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const profileRoutes = require("./routes/profileRoutes");

app.use("/api/user", profileRoutes);