const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require("web-push");

// Define allowed origins
const allowedOrigins = [
  'https://paulthebest1000-hayase-yuuka-website.onrender.com',
  'http://127.0.0.1:5501',
  'http://localhost:5501'
];

// Set up Express app and HTTP server
const app = express();
const server = http.createServer(app);

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

webpush.setVapidDetails(
  "mailto:paulandsam1000@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

console.log("Public key:", process.env.VAPID_PUBLIC_KEY);
console.log("Private key:", process.env.VAPID_PRIVATE_KEY);

// Parse JSON bodies
app.use(express.json());

// Store subscriptions
const subscriptions = []; // simple in-memory storage (use DB for production)

app.post('/save-subscription', (req, res) => {
  const subscription = req.body;
  if (!subscriptions.find(sub => sub.endpoint === subscription.endpoint)) {
    subscriptions.push(subscription);
  }
  console.log("New subscription saved:", subscription.endpoint);
  res.status(201).json({ message: 'Subscription saved!' });
});

app.post('/test-push', async (req, res) => {
  const payload = JSON.stringify({
    title: "Test Notification",
    body: "If you see this, your PWA push works!",
    icon: "/icon-192.png"
  });

  try {
    for (const sub of subscriptions) {
      await webpush.sendNotification(sub, payload);
    }

    res.json({ message: "Push sent!" });
  } catch (err) {
    console.error("Push error:", err);
    res.status(500).json({ message: "Failed to send push." });
  }
});

// Store clients
const clients = {};

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

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => {
      console.error("Push error:", err);
    });
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
