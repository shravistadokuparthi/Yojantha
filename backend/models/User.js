const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    default: ""
  },

  city: {
    type: String,
    default: ""
  },

  state: {
    type: String,
    default: ""
  },

  dob: {
    type: String,
    default: ""
  },

  gender: {
    type: String,
    default: ""
  },

  interestedSchemes: [
    {
      schemeId: { type: String, required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ],

appliedSchemes: {
  type: [String],
  default: []
}
});


module.exports = mongoose.model("User", userSchema);