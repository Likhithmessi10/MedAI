const express = require("express");
const router = express.Router();
const axios = require("axios");
const Patient = require("../models/Patient");

router.post("/add", async (req, res) => {
  try {
    const { name, age, gender } = req.body;

    const HR = Number(req.body.HR);
    const O2Sat = Number(req.body.O2Sat);
    const Temp = Number(req.body.Temp);
    const SBP = Number(req.body.SBP);
    const MAP = Number(req.body.MAP);
    const Resp = Number(req.body.Resp);
    const Age = Number(age);

    // 🔵 AI prediction
    const aiRes = await axios.post("http://127.0.0.1:8000/predict", {
      HR, O2Sat, Temp, SBP, MAP, Resp, Age
    });

    let ai_score = Number(aiRes.data.risk_score || 0);

    // 🧠 CLINICAL EARLY WARNING SCORE (REAL MEDICAL LOGIC)
    let score = 0;

    // Heart rate
    if (HR >= 130 || HR <= 40) score += 3;
    else if (HR >= 110) score += 2;
    else if (HR >= 100) score += 1;

    // Oxygen
    if (O2Sat <= 85) score += 3;
    else if (O2Sat <= 90) score += 2;
    else if (O2Sat <= 94) score += 1;

    // Temperature
    if (Temp >= 39.5 || Temp <= 35) score += 2;
    else if (Temp >= 38) score += 1;

    // BP
    if (SBP <= 90) score += 3;
    else if (SBP <= 100) score += 2;

    // Respiration
    if (Resp >= 30) score += 3;
    else if (Resp >= 22) score += 2;
    else if (Resp >= 18) score += 1;

    // Age risk
    if (Age >= 65) score += 1;

    // combine AI + clinical
    let combined = ai_score * 5 + score;

    let risk_level = "LOW";

    if (combined >= 8) risk_level = "HIGH";
    else if (combined >= 4) risk_level = "MEDIUM";
    else risk_level = "LOW";

    const patient = new Patient({
      name,
      age,
      gender,
      vitals: { HR, O2Sat, Temp, SBP, MAP, Resp },
      risk_score: combined,
      risk_level
    });

    await patient.save();

    res.json({
      message: "Patient analyzed successfully",
      risk_level,
      risk_score: combined,
      patient
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/all", async (req, res) => {
  const patients = await Patient.find().sort({ createdAt: -1 });
  res.json(patients);
});

router.post("/predictLive", async (req,res)=>{
 try{
  const {HR,O2Sat,Temp,SBP,MAP,Resp,Age}=req.body;

  const aiRes = await axios.post("http://127.0.0.1:8000/predict", {
    HR,O2Sat,Temp,SBP,MAP,Resp,Age
  });

  let ai_score = Number(aiRes.data.risk_score||0);

  let score=0;

  if(HR>=130) score+=3;
  else if(HR>=110) score+=2;
  else if(HR>=100) score+=1;

  if(O2Sat<=85) score+=3;
  else if(O2Sat<=90) score+=2;
  else if(O2Sat<=94) score+=1;

  if(Temp>=39.5) score+=2;
  else if(Temp>=38) score+=1;

  if(Resp>=30) score+=3;
  else if(Resp>=22) score+=2;

  if(Age>=65) score+=1;

  let combined = score + ai_score*5;

  let risk="LOW";
  if(combined>=8) risk="HIGH";
  else if(combined>=4) risk="MEDIUM";

  res.json({
    risk_level:risk,
    risk_score:combined
  });

 }catch(e){
  console.log(e);
 }
});
module.exports = router;