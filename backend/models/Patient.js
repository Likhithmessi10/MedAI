const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true }, // Added field
  condition: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  vitals: {
    hr: { type: Number, default: 80 },
    sbp: { type: Number, default: 120 },
    dbp: { type: Number, default: 80 },
    spo2: { type: Number, default: 98 },
    temp: { type: Number, default: 37.0 }
  },
  respRate: { type: Number, default: 18 }, // Added field
  sepsisRisk: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);