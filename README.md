# MedAI Nexus – Fully Local AI Healthcare Platform

MedAI Nexus is an **AI-Powered, Interoperable, and Automated Healthcare Solution**. It is designed to tackle critical challenges hospitals face including patient safety, diagnostic delays, and IT monitoring.

MedAI Nexus is a **Privacy-First, Local AI Application**. It runs zero external APIs and ensures all sensitive patient data remains strictly on-premises using **Ollama Llama 3.2**.

---

## ✨ Key Features & Business Logic

### 1. AI-Powered Early Warning Systems (EWS) & Digital Twin ICU 
- **Logic:** The Node.js backend features a physiologic simulator (`icuSimulator.js`) that mimics real-time patient vital drift (Heart Rate, Blood Pressure, SpO2). 
- **AI Processing:** Every time a patient's vitals update, the system emits a real-time **WebSocket (`socket.io`)** event to the frontend Dashboard to instantly show the shifting metrics. 
- **AI Engine:** Simultaneously, the numbers are funneled through a local **Llama 3.2 Engine** via a Python FastAPI service. Llama acts as an expert physician, analyzing the multi-variable data to predict a float (`0.0 - 1.0`) representing the **Probability of Sepsis**.

### 2. Automated Diagnostic Extraction (OCR to Llama)
- **Logic:** The platform allows doctors to upload X-Rays, MRI scans, or PDF Lab Reports. 
- **AI Processing:** The Node backend uses `pdf-parse` and `tesseract.js` (OCR) to extract the text data out of the images/documents. 
- **AI Engine:** The extracted clinical text is then routed to the Python **Llama 3.2** engine. Llama digests the medical text, provides an assessment of the anomalous findings, and drafts a structured JSON risk-assessment and recommendation for the frontend UI.

### 3. Hospital Compliance & Network Monitoring
- **Logic:** The platform features dynamic, simulated real-time dashboards mapping the overall Topography of Hospital IT structures. It simulates Live Device connection downtimes, Hand Hygiene reporting, and JCI Audit readiness.

---

## 🏗 System Architecture

The architecture utilizes a triad of independent but interacting services:
1. **Frontend:** React.js, Tailwind CSS, Lucide Icons, Socket.IO Client (Dynamic, real-time UI/UX).
2. **Backend Engine:** Node.js, Express, MongoDB, Socket.IO, Tesseract.JS (Handles routing, OCR, live WebSocket simulation loops).
3. **AI Inference Layer:** Python, FastAPI, Ollama (Houses the local Llama 3.2 models for clinical prediction).

---

## 🚀 Setup & Installation Instructions

This project requires **Node.js**, **Python**, **MongoDB**, and **Ollama**.

### Step 1: Install Ollama & Llama 3.2
Because this app is privacy-focused, you must host your own LLM locally.
1. Download Ollama from `https://ollama.com/`
2. Open a terminal and run:
   ```bash
   ollama run llama3.2
   ```
   *Keep the Ollama service running in the background for the application to interact with it.*

### Step 2: Database Setup
Ensure you have a MongoDB instance running. Create a standard `.env` file inside the `backend/` directory:
```env
MONGO_URI=mongodb://localhost:27017/medai-nexus
PORT=5000
AI_SERVICE_URL=http://localhost:8000
```

### Step 3: Start the Python AI Microservice
The Python service translates your Node backend requests into Llama Prompts and parses the AI's JSON outputs.
```bash
cd ai-service
# Activate your Python virtual environment
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*Runs on `http://localhost:8000`*

### Step 4: Start the Node.js Backend & WebSockets
The backend streams real-time data to your UI and handles Optical Character Recognition.
```bash
cd backend
npm install
node server.js
```
*Runs on `http://localhost:5000`*

### Step 5: Start the React Frontend
```bash
cd frontend
npm install
npm start
```
*The app will automatically open at `http://localhost:3000`*

---