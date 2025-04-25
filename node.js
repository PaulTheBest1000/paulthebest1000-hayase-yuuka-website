const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: 'http://127.0.0.1:5500', // or '*', if you want it open to all
      methods: ['GET', 'POST']
    }
  });  

// Serve static files (frontend)
const cors = require('cors');
app.use(cors());
const chatLog = []; // In-memory chat log

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
