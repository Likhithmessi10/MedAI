/**
 * Realistic Physiological Simulation Model
 * Replaces simple Math.random() with interconnected vital signs.
 */

const simulatePhysiology = (currentVitals) => {
  // Destructure current values with clinical defaults if missing
  let { 
    hr = 80, 
    sbp = 120, 
    dbp = 80, 
    spo2 = 98, 
    temp = 37.0 
  } = currentVitals;

  // --- 1. Sepsis/Shock Simulation Logic ---
  // We simulate a "drift" towards instability. 
  // If SpO2 drops, SBP usually follows, and HR spikes to compensate.
  
  // A small downward bias (0.52 instead of 0.5) makes the patient gradually 
  // prone to "crashing" unless the simulation reset logic is triggered elsewhere.
  const spo2Drift = (Math.random() - 0.52) * 0.8;
  spo2 = Math.min(100, Math.max(70, spo2 + spo2Drift));

  // --- 2. Heart Rate (HR) Reaction ---
  // If SpO2 < 90% (Hypoxia), Heart Rate targets 110-120 bpm (Tachycardia).
  // Otherwise, it tries to return to a resting state of 80 bpm.
  const hrTarget = spo2 < 90 ? 115 : 80;
  hr += (hrTarget - hr) * 0.15 + (Math.random() - 0.5) * 3;

  // --- 3. Blood Pressure (SBP/DBP) Reaction ---
  // If SpO2 is critically low (< 85%), simulate Septic Shock (BP drop).
  const bpShockFactor = spo2 < 85 ? -0.8 : 0.05;
  sbp += bpShockFactor + (Math.random() - 0.5) * 2;
  
  // Diastolic BP usually maintains a roughly 2/3 ratio to Systolic
  dbp = sbp * 0.66 + (Math.random() - 0.5);

  // --- 4. Temperature ---
  // Slow metabolic drift
  temp += (Math.random() - 0.5) * 0.05;

  // --- 5. Bounds and Formatting ---
  return {
    hr: Math.round(Math.min(220, Math.max(40, hr))),
    sbp: Math.round(Math.min(200, Math.max(60, sbp))),
    dbp: Math.round(Math.min(120, Math.max(30, dbp))),
    spo2: parseFloat(Math.min(100, Math.max(0, spo2)).toFixed(1)),
    temp: parseFloat(Math.min(42, Math.max(34, temp)).toFixed(1)),
    timestamp: new Date()
  };
};

/**
 * Updates all patients in the database using the physiological model
 * and triggers AI sepsis prediction.
 */
const runICUSimulation = async (PatientModel, axios, AI_SERVICE_URL) => {
  try {
    const patients = await PatientModel.find();

    for (let patient of patients) {
      // 1. Generate next physiological state based on current state
      const nextVitals = simulatePhysiology(patient.vitals || {});

      // 2. Prepare data for AI Sepsis Prediction
      // Ensure the keys match what your Python ai-service expects
      const aiPayload = {
        HR: nextVitals.hr,
        O2Sat: nextVitals.spo2,
        Temp: nextVitals.temp,
        SBP: nextVitals.sbp,
        MAP: (nextVitals.sbp + 2 * nextVitals.dbp) / 3, // Calculated Mean Arterial Pressure
        Resp: 20, // Static for now or add to simulation
        Age: patient.age
      };

      let riskScore = patient.sepsisRisk;
      try {
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, aiPayload, { timeout: 1000 });
        riskScore = aiResponse.data.sepsis_risk || 0;
      } catch (aiErr) {
        console.error(`AI Service unreachable for patient ${patient._id}:`, aiErr.message);
      }

      // 3. Persist the "Digital Twin" state to MongoDB
      await PatientModel.findByIdAndUpdate(patient._id, {
        vitals: nextVitals,
        sepsisRisk: riskScore,
        lastUpdated: new Date()
      });
    }
  } catch (err) {
    console.error("Simulation Loop Error:", err);
  }
};

module.exports = { simulatePhysiology, runICUSimulation };