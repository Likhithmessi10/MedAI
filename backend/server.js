const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const patientRoutes = require('./routes/patientRoutes');
const diagnosticRoutes = require('./routes/diagnosticRoutes');
const Patient = require('./models/Patient');
const http = require('http');
const { Server } = require('socket.io');
const { runICUSimulation } = require('./icuSimulator');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Expose io everywhere if needed, or just pass it to the simulation
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/diagnostics', diagnosticRoutes);

// Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Start the Digital Twin Simulation Loop
    // This runs every 5 seconds to update all patient states
    console.log('Starting Digital Twin ICU Simulation loop...');
    setInterval(() => {
      runICUSimulation(Patient, axios, AI_SERVICE_URL, io);
    }, 5000);
  })
  .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log('New client connected to Twin ICU:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});