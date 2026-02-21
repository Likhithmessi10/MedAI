const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,

  vitals: {
    HR: Number,
    O2Sat: Number,
    Temp: Number,
    SBP: Number,
    MAP: Number,
    Resp: Number
  },

  risk_score: Number,
  risk_level: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Patient", patientSchema);