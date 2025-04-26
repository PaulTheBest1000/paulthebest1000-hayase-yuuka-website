const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Define allowed origins
const allowedOrigins = [
  'https://paulthebest1000.github.io', // Production domain
  'http://127.0.0.1:5500', // Local development domain
  'http://localhost:5500'
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
      callback(null, true); // Allow this origin
    } else {
      callback(new Error('Not allowed by CORS')); // Reject other origins
    }
  }
}));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// When a user connects
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('typing', (username) => {
    socket.broadcast.emit('userTyping', username); // Notify others
  });
  
  socket.on('stopTyping', (username) => {
    socket.broadcast.emit('userStopTyping', username); // Stop message
  });
  
// Handle message sending
socket.on('sendMessage', (data) => {
    console.log(`${data.username}: ${data.message}`);
    
    // Broadcast the message to everyone except the sender
    socket.broadcast.emit('receiveMessage', {
        message: data.message,
        sender: 'user',
        username: data.username
    });

    // Optionally, send the message back to the sender if you want them to see their own message
    socket.emit('receiveMessage', {
        message: data.message,
        sender: 'user',
        username: data.username
    });
});

  // Handle private message sending
  socket.on('sendPrivateMessage', (data) => {
    console.log(`Private message from ${data.username} to ${data.recipient}: ${data.message}`);
    const recipientSocketId = Object.keys(clients).find((id) => clients[id] === data.recipient);
    if (recipientSocketId) {
      const logEntry = {
        type: 'private',
        from: data.username,
        to: data.recipient,
        message: data.message,
        timestamp: new Date().toISOString()
      };
      chatLog.push(logEntry);
      io.to(recipientSocketId).emit('receivePrivateMessage', {
        message: data.message,
        sender: 'user',
        username: data.username,
      });
    }
  });  

  // Register username when a user connects
  socket.on('register', (username) => {
    clients[socket.id] = username;
    console.log(`${username} connected`);
  
    // Send updated list to all clients
    io.emit('onlineUsers', Object.values(clients));
  });  

  // Handle disconnections
  socket.on('disconnect', () => {
    delete clients[socket.id];
    console.log('A user disconnected');
  
    // Send updated list to all clients
    io.emit('onlineUsers', Object.values(clients));
  });  
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
