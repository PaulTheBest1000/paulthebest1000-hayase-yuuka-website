const socket = io('https://paulthebest1000-hayase-yuuka-website.onrender.com'); // Replace with your actual Render URL
const typingIndicator = document.getElementById('typing-indicator');
let typingTimeout;
const chatInput = document.getElementById('chat-input');
const chatHistory = document.getElementById('chat-history');
const sendBtn = document.getElementById('send-btn');
const emojiBtn = document.getElementById('emoji-btn');
const privateMsgToInput = document.getElementById('private-msg-to');
const privateMsgBtn = document.getElementById('private-msg-btn');
const emojiPicker = ["😊", "😂", "😢", "😍", "😎", "😜"]; // Example emoji set
const onlineUsersList = document.getElementById('online-users');

// Store the username (can be fetched from localStorage or set on user login)
const userName = localStorage.getItem('playerName') || 'Player'; // Default to 'Player' if no name is found

// Display message in the chat window
function displayMessage(message, sender, username) {
    const msgElement = document.createElement('div');
    msgElement.classList.add(sender === 'user' ? 'user-message' : 'other-message');
    msgElement.innerHTML = `${username}: ${message}`; // Display message with username
    chatHistory.appendChild(msgElement);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to the bottom
}

// Ensure the username is sent with the message
sendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        // Display the message locally (only for the sender)
        displayMessage(message, 'user', userName);

        // Emit the message to the server
        socket.emit('sendMessage', { message, sender: 'user', username: userName });

        chatInput.value = ''; // Clear input field
    }
});

// Send private message
privateMsgBtn.addEventListener('click', () => {
  const recipient = privateMsgToInput.value.trim();
  const message = chatInput.value.trim();
  if (message && recipient) {
    // Emit private message with username and recipient
    socket.emit('sendPrivateMessage', { message, sender: 'user', username: userName, recipient });
    chatInput.value = ''; // Clear input field
    privateMsgToInput.value = ''; // Clear recipient input
    displayMessage(`To ${recipient}: ${message}`, 'user');
  }
});

// Emoji Picker Button
emojiBtn.addEventListener('click', () => {
  const randomEmoji = emojiPicker[Math.floor(Math.random() * emojiPicker.length)];
  chatInput.value += randomEmoji; // Add selected emoji to input field
});

// Listen for messages from the server
socket.on('receiveMessage', (data) => {
    if (data.username !== userName) { // Prevent showing the sender's own message
        displayMessage(data.message, data.sender, data.username); // Display message from other users
    }
});
  
  // Listen for private messages
  socket.on('receivePrivateMessage', (data) => {
    // Same check for private messages
    if (data.username) {
      displayMessage(`[Private] ${data.username}: ${data.message}`, data.sender);
    }
  });  

socket.on('onlineUsers', (users) => {
    onlineUsersList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user;
      onlineUsersList.appendChild(li);
    });
  });
  
  // Register username with the server
  socket.emit('register', userName);

  chatInput.addEventListener('input', () => {
    socket.emit('typing', userName); // Notify server you're typing
  
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stopTyping', userName); // Stop typing after 2s of no input
    }, 2000);
  });

  socket.on('userTyping', (username) => {
    typingIndicator.textContent = `${username} is typing...`;
  });
  
  socket.on('userStopTyping', () => {
    typingIndicator.textContent = '';
  });
  