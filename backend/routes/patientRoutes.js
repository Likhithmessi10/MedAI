const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

router.post('/', async (req, res) => {
  // DEBUG: Check if data is arriving
  console.log("Data received at backend:", req.body);

  try {
    const { name, age, gender, condition, hr, sbp, dbp, o2, temp, respRate } = req.body;

    const newPatient = new Patient({
      name,
      age: Number(age),
      gender,
      condition,
      respRate: Number(respRate) || 18,
      vitals: {
        hr: Number(hr) || 80,
        sbp: Number(sbp) || 120,
        dbp: Number(dbp) || 80,
        spo2: Number(o2) || 98,
        temp: Number(temp) || 37.0
      }
    });

    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (err) {
    console.error("Validation Error:", err.message);
    res.status(400).json({ message: err.message });
  }
});
// GET: Fetch all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;