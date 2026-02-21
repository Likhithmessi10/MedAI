const Patient = require("./models/Patient");

function startICUSimulation(io) {

  setInterval(async ()=>{

    const patients = await Patient.find();

    for (let patient of patients) {

      // random vitals fluctuation
      patient.vitals.HR += Math.floor(Math.random()*10 - 5);
      patient.vitals.O2Sat += Math.floor(Math.random()*4 - 2);
      patient.vitals.Temp += (Math.random()*0.5 - 0.2);
      patient.vitals.Resp += Math.floor(Math.random()*4 - 2);

      // clinical scoring
      let score = 0;

      if (patient.vitals.HR >= 130 || patient.vitals.HR <= 40) score += 3;
      else if (patient.vitals.HR >= 110) score += 2;
      else if (patient.vitals.HR >= 100) score += 1;

      if (patient.vitals.O2Sat <= 85) score += 3;
      else if (patient.vitals.O2Sat <= 90) score += 2;
      else if (patient.vitals.O2Sat <= 94) score += 1;

      if (patient.vitals.Temp >= 39.5 || patient.vitals.Temp <= 35) score += 2;
      else if (patient.vitals.Temp >= 38) score += 1;

      if (patient.vitals.Resp >= 30) score += 3;
      else if (patient.vitals.Resp >= 22) score += 2;
      else if (patient.vitals.Resp >= 18) score += 1;

      if (patient.age >= 65) score += 1;

      patient.risk_score = score;

      if (score >= 8) patient.risk_level = "HIGH";
      else if (score >= 4) patient.risk_level = "MEDIUM";
      else patient.risk_level = "LOW";

      await patient.save();

      io.emit("icuUpdate", patient);
    }

  },5000);
}

module.exports = startICUSimulation;