const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
const server = http.createServer(app);

const io = new Server(server);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let alerts = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'rr.html'));
});

app.get('/alerts', (req, res) => {
  res.json(alerts);
});

app.post('/sos', (req, res) => {
  const { type, location } = req.body;

  const newAlert = {
    id: Date.now(),
    type,
    location,
    time: new Date()
  };

  alerts.unshift(newAlert);

  io.emit('newSOS', newAlert);

  res.json({ message: "SOS sent" });
});

app.post('/chat', async (req, res) => {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: req.body.message }]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch {
    res.json({ reply: "AI not available" });
  }
});

io.on('connection', (socket) => {
  socket.emit('allAlerts', alerts);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running...");
});
