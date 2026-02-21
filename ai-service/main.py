from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import pandas as pd
import numpy as np
import joblib
app = FastAPI(title="MedAI Sepsis Predictor")

try:
    model = joblib.load("sepsis_model.pkl")
    model_features = joblib.load("model_features.pkl")
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")
    model = None

class PatientVitals(BaseModel):
    HR: float
    O2Sat: float
    Temp: float
    SBP: float
    MAP: float
    Resp: float
    Age: float

@app.get("/")
def read_root():
    return {"status": "AI Service Online", "model_loaded": model is not None}

@app.post("/predict")
def predict_sepsis(data: PatientVitals):
    # If model is None, it means the loading failed above
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded on server. Check server logs.")

    try:
        # Convert incoming JSON to DataFrame for the model
        input_df = pd.DataFrame([data.dict()])
        
        # Ensure feature order matches the training set
        input_df = input_df.reindex(columns=model_features, fill_value=0)

        # Get probability instead of just a 0 or 1
        probability = model.predict_proba(input_df)[0][1]

        return {
            "sepsis_risk": round(float(probability), 4),
            "status": "success"
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return {"sepsis_risk": 0, "status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)