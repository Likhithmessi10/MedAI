from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import json

app = FastAPI(title="MedAI Sepsis Predictor (Llama 3.2 Powered)")

class PatientVitals(BaseModel):
    HR: float
    O2Sat: float
    Temp: float
    SBP: float
    MAP: float
    Resp: float
    Age: float

class ReportData(BaseModel):
    text: str
    filename: str = "Unknown Document"

@app.get("/")
def read_root():
    return {"status": "AI Service Online", "engine": "Ollama Llama 3.2"}

@app.post("/predict")
def predict_sepsis(data: PatientVitals):
    try:
        # Construct prompt for Llama 3.2
        prompt = f"""
You are an expert Intensive Care Unit AI assistant. 
Analyze the following real-time patient vitals and predict the probability of sepsis.

Patient Vitals:
- Heart Rate (HR): {data.HR} bpm
- Oxygen Saturation (O2Sat): {data.O2Sat}%
- Temperature: {data.Temp} C
- Systolic Blood Pressure (SBP): {data.SBP} mmHg
- Mean Arterial Pressure (MAP): {data.MAP} mmHg
- Respiration Rate (Resp): {data.Resp} breaths/min
- Age: {data.Age} years

Provide ONLY a single JSON object with a single key "sepsis_risk" containing a float between 0.0 and 1.0 representing the probability of sepsis. Do not include any other text, markdown formatting, or explanation.
Example Output:
{{"sepsis_risk": 0.85}}
"""
        
        # Send request to local Ollama API
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False,
                "format": "json"
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Ollama API returned status {response.status_code}")
            
        ollama_data = response.json()
        result_text = ollama_data.get("response", "{}")
        
        import re
        
        # Try to extract JSON if it was wrapped in markdown
        match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if match:
            result_text = match.group(0)
            
        try:
            result_json = json.loads(result_text)
            risk = float(result_json.get("sepsis_risk", 0.0))
        except (json.JSONDecodeError, ValueError):
            # Fallback: parse raw float from text if JSON failed entirely
            risk_match = re.search(r'(0\.[0-9]+|1\.0|0)', result_text)
            risk = float(risk_match.group(0)) if risk_match else 0.5
        
        # Ensure bounds
        risk = max(0.0, min(1.0, risk))
        
        return {
            "sepsis_risk": round(risk, 4),
            "status": "success",
            "engine": "llama3.2"
        }
        
    except requests.exceptions.ConnectionError:
        print("Prediction error: Failed to connect to Ollama. Is it running?")
        return {"sepsis_risk": 0, "status": "error", "message": "Failed to connect to local Ollama Llama 3.2 engine."}
    except Exception as e:
        print(f"Prediction error: {e}")
        return {"sepsis_risk": 0, "status": "error", "message": str(e)}

@app.post("/analyze-report")
def analyze_medical_report(data: ReportData):
    try:
        prompt = f"""
You are MedAI Core, an expert medical diagnostic AI system running locally. 
Analyze the following text extracted from a medical document or scan (Filename: {data.filename}).
Identify the type of document. Extract medical findings, conditions, and anomalies.
Provide a concise clinical recommendation based on the text.
Assess the risk level (Low, Medium, High, Critical).

Document Text:
{data.text}

RESPOND ONLY WITH VALID JSON exactly matching the schema below. No markdown blocks or extra text:
{{
    "patient": "Extracted Patient Name/ID (or 'Unknown' if none)",
    "scanType": "Type of Document based on text",
    "findings": "Concise paragraph of key observations",
    "confidence": "Estimated confidence percentage (e.g. '95.2%')",
    "recommendation": "Concise medical recommendation",
    "riskLevel": "Low | Medium | High | Critical"
}}
"""
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False,
                "format": "json"
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Ollama returned {response.status_code}")
            
        ollama_data = response.json()
        result_text = ollama_data.get("response", "{}")
        
        # Parse JSON
        import re
        match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if match:
            result_text = match.group(0)
            
        try:
            return json.loads(result_text)
        except json.JSONDecodeError:
            # Fallback if Llama completely fails to output JSON formatting
            return {
                "patient": "Unknown",
                "scanType": data.filename,
                "findings": str(result_text)[:200] + "...",
                "confidence": "Unknown",
                "recommendation": "Unable to parse proper JSON from AI engine.",
                "riskLevel": "Medium"
            }
            
    except requests.exceptions.ConnectionError:
        print("Analysis error: Failed to connect to Ollama.")
        raise HTTPException(status_code=503, detail="Local Ollama engine is offline.")
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)