const mongoose = require("mongoose");
const { schema } = require("./User");

const schemeSchema = new mongoose.Schema({


  scheme_name: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  benefits: {
    type: String
  },
  eligibility: {
    type: String
  },
  schemeCategory: {
    type: String
  },
  state: {
    type: String
  },
  application: {
    type: String
  },
  documents: {
    type: String
  },
  tags: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Scheme",schemeSchema, "Govt_Schemes");