const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.static(__dirname));
// Store SOS alerts in memory
let alerts = [];

// ✅ Test route
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'rr.html'));
});
// ✅ Get all alerts
app.get('/alerts', (req, res) => {
  res.json(alerts);
});

// ✅ SOS API
app.post('/sos', (req, res) => {
  const { type, location } = req.body;

  const newAlert = {
    id: Date.now(),
    type,
    location,
    time: new Date()
  };

  alerts.unshift(newAlert);

  console.log("🚨 SOS:", newAlert);

  // 🔥 Send to all connected users (real-time)
  io.emit('newSOS', newAlert);

  res.json({ message: "SOS sent successfully 🚨" });
});

// 🔌 Socket.io connection
io.on('connection', (socket) => {
  console.log("User connected:", socket.id);

  // Send existing alerts
  socket.emit('allAlerts', alerts);

  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
  });
});

// 🚀 Start server
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});