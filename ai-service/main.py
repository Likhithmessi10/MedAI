from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()

print("Loading trained model...")
model = joblib.load("sepsis_model.pkl")
print("Model loaded")

@app.get("/")
def home():
    return {"message": "MedAI Nexus AI running"}

@app.post("/predict")
def predict(data: dict):
    try:
        # Expecting vitals
        features = np.array([[
            data["HR"],
            data["O2Sat"],
            data["Temp"],
            data["SBP"],
            data["MAP"],
            data["Resp"],
            data["Age"]
        ]])

        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]

        risk = "LOW"
        if probability > 0.7:
            risk = "HIGH"
        elif probability > 0.4:
            risk = "MEDIUM"

        return {
            "prediction": int(prediction),
            "risk_score": float(probability),
            "risk_level": risk
        }

    except Exception as e:
        return {"error": str(e)}