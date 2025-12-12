const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config({ path: './vapid-keys.env' });
const webpush = require("web-push");

// Set up Express app and HTTP server
const app = express();
const server = http.createServer(app);

app.use(express.json());

// Define allowed origins
const allowedOrigins = [
  'https://paulthebest1000.github.io',
  'http://127.0.0.1:5501',
  'http://localhost:5501'
];

// Allow origins
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// Set up Socket.IO with CORS settings
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// CORS Middleware for Express
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.get("/", (req, res) => {
  res.send("Yuuka server alive 💙");
});

// Load VAPID keys from environment variables
const PUBLIC_VAPID_KEY = process.env.VAPID_PUBLIC_KEY;
const PRIVATE_VAPID_KEY = process.env.VAPID_PRIVATE_KEY;

// Make sure they exist
if (!PUBLIC_VAPID_KEY || !PRIVATE_VAPID_KEY) {
  throw new Error("VAPID keys are not set in environment variables!");
}

// Set up web-push
webpush.setVapidDetails(
  "mailto:paulandsam1000@gmail.com",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

console.log("VAPID public key:", PUBLIC_VAPID_KEY ? "✅ Set" : "❌ Missing");
console.log("VAPID private key:", PRIVATE_VAPID_KEY ? "✅ Set" : "❌ Missing");

// Store subscriptions
const subscriptions = [];

// Store clients
const clients = {};

// Endpoint to handle push subscription
app.post('/save-subscription', (req, res) => {
  const sub = req.body;

  if (!subscriptions.find(s => s.endpoint === sub.endpoint)) {
    subscriptions.push(sub);
  }

  res.status(201).json({ message: "Subscription saved!" });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Typing events
  socket.on('typing', (username) => {
    socket.broadcast.emit('userTyping', username);
  });

  socket.on('stopTyping', (username) => {
    socket.broadcast.emit('userStopTyping', username);
  });

  // Handle message sending
  socket.on('sendMessage', (data) => {
    console.log(`${data.username}: ${data.message}`);

  const payload = JSON.stringify({
    title: `New message from ${data.username}`,
    body: data.message
  });

  (subscriptions || []).forEach(sub => {
  try {
    webpush.sendNotification(sub, payload);
  } catch (err) {
    console.error("Push error:", err);
  }
});
    // Broadcast the message to everyone including sender
    io.emit('receiveMessage', {
      message: data.message,
      sender: 'user',
      username: data.username
    });
  });

  // Register username
  socket.on('register', (username) => {
    clients[socket.id] = username;
    console.log(`${username} connected`);

    io.emit('onlineUsers', Object.values(clients));
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const username = clients[socket.id]; // grab username before deleting
    delete clients[socket.id];
    console.log(`${username || 'A user'} disconnected`);

    io.emit('onlineUsers', Object.values(clients));
  });
});

// Start the server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
