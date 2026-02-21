# MedAI Nexus – Hackathon Edition

MedAI Nexus is an **AI-Powered, Interoperable, and Automated Healthcare Solution** designed for the **Ratan Tata Innovation Hub (RTIH) Hackathon**. It directly addresses the critical challenges hospitals face in patient safety, diagnostic delays, and fragmented IT device interoperability.

## 🏆 Hackathon Core Objectives Addressed
1. **AI-Powered Early Warning Systems (EWS)** - Real-time Sepsis prediction using ML.
2. **Automated Diagnostics & AI Reporting** - Instant analysis of uploads (X-Ray, Reports).
3. **Compliance Monitoring** - Real-time NABH/JCI readiness tracking.
4. **Interoperable Medical Devices** - IT network topography and sensor connection hub.

---

## 🏗 System Architecture
- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Chart.js (Modern UI/UX Dashboard).
- **Backend:** Node.js, Express, MongoDB (Digital Twin physiologic simulation loop).
- **AI Service:** Python, FastAPI, Scikit-Learn (ML inference, live Sepsis prediction).

---

## 🚀 Setup & Installation Instructions

This project requires **Node.js**, **Python**, and a **MongoDB** connection to run.

### 1. Database Setup
Ensure you have a MongoDB instance running. The backend connects via `MONGO_URI`.

### 2. Start the AI Microservice
The AI service provides the ML inference engine for the Digital Twin simulation.
```bash
cd ai-service
# Activate the python environment (assuming virtualenv is created)
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt (if applicable)
python main.py
```
*Runs on `http://localhost:8000`*

### 3. Start the Node.js Backend
The backend runs the simulated ICU vitals loop and links the frontend to the AI.
```bash
cd backend
npm install
# Create a .env file with MONGO_URI and PORT=5000
node server.js
```
*Runs on `http://localhost:5000`*

### 4. Start the React Frontend
```bash
cd frontend
npm install
npm start
```
*Runs on `http://localhost:3000`*

---

## 🎯 How to Demo the Solution
1. **Patient Nexus & Digital Twin:** Open the dashboard. Add a patient via the form. Watch the backend simulation drift their vitals over time and the AI Service dynamically update their Sepsis Risk Level. Click "LAUNCH AI ICU" to view the full animated Digital Twin.
2. **Device Interop Hub:** Navigate using the sidebar. View the simulated health of hospital network nodes, data ingestion rates, and device statuses.
3. **Compliance Monitor:** Navigate to the shield icon. View simulated Hand Hygiene, Equipment Calibration, and Audit readiness statuses.
4. **Automated Diagnostics:** Navigate to the brain icon. Click the simulated "Upload Medical Scan" to see an animated response of AI generating a contextual clinical diagnostic report.
