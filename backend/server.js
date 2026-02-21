const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected"))
.catch(err=> console.log(err));

const patientRoutes = require("./routes/patientRoutes");
app.use("/api/patients", patientRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET","POST"]
  }
});

app.set("io", io);

io.on("connection", (socket)=>{
  console.log("ICU monitor connected");
});
const startICUSimulation = require("./icuSimulator");
startICUSimulation(io);

server.listen(5000, ()=> console.log("Server running on 5000"));