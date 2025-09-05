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
const userName = localStorage.getItem('playerName') || 'User'; // Default to 'Player' if no name is found

let currentUsername = userName; // start with the initial username

const changeUsernameInput = document.getElementById('change-username-input');
const changeUsernameBtn = document.getElementById('change-username-btn');

changeUsernameBtn.addEventListener('click', () => {
  const newUsername = changeUsernameInput.value.trim();
  if (newUsername) {
    currentUsername = newUsername;
    localStorage.setItem('playerName', currentUsername); // optional: save for refresh
    alert(`Username changed to ${currentUsername}`);
    changeUsernameInput.value = '';

    // Notify server of new username
    socket.emit('register', currentUsername);
  } else {
    alert('Please enter a valid username.');
  }
});

// Display message in the chat window
function displayMessage(message, sender, username) {
    const msgElement = document.createElement('div');
    msgElement.classList.add(sender === 'user' ? 'user-message' : 'other-message');
    msgElement.innerHTML = `${username}: ${message}`; // Display message with username
    chatHistory.appendChild(msgElement);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to the bottom
}

// Ensure the current username is sent with the message
sendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        // Display the message locally (only for the sender)
        displayMessage(message, 'user', currentUsername);

        // Emit the message to the server
        socket.emit('sendMessage', { message, sender: 'user', username: currentUsername });

        chatInput.value = ''; // Clear input field
    }
});

// Emoji Picker Button
emojiBtn.addEventListener('click', () => {
  const randomEmoji = emojiPicker[Math.floor(Math.random() * emojiPicker.length)];
  chatInput.value += randomEmoji; // Add selected emoji to input field
});

// Listen for messages from the server
socket.on('receiveMessage', (data) => {
    if (data.username !== currentUsername) { // Prevent showing the sender's own message
        displayMessage(data.message, data.sender, data.username); // Display message from other users

// auto-scroll
const chatBox = document.getElementById("chat-box");
  chatBox.scrollTop = chatBox.scrollHeight;
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
  
  // Register current username with the server
  socket.emit('register', currentUsername);

  chatInput.addEventListener('input', () => {
    socket.emit('typing', currentUsername); // Notify server you're typing

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stopTyping', currentUsername); // Stop typing after 2s of no input
    }, 2000);
  });

  socket.on('userTyping', (username) => {
    typingIndicator.textContent = `${username} is typing...`;
  });
  
  socket.on('userStopTyping', () => {
    typingIndicator.textContent = '';
  });
  
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatContainer = document.getElementById('chat-container');
const chatHeader = document.getElementById("chat-header");

chatToggleBtn.addEventListener('click', () => {
  if (chatContainer.style.display === 'block') {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'block';
  }
});

let isDragging = false;
let offsetX = 0, offsetY = 0;

// Mouse events
chatHeader.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - chatContainer.offsetLeft;
  offsetY = e.clientY - chatContainer.offsetTop;
  chatHeader.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    // Clamp values so the box stays in the window
    const maxLeft = window.innerWidth - chatContainer.offsetWidth;
    const maxTop = window.innerHeight - chatContainer.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    chatContainer.style.left = (e.clientX - offsetX) + "px";
    chatContainer.style.top = (e.clientY - offsetY) + "px";
    chatContainer.style.bottom = "auto"; // prevent infinite stretching
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  chatHeader.style.cursor = "grab";
});

// Touch events (mobile)
chatHeader.addEventListener("touchstart", (e) => {
  isDragging = true;
  const touch = e.touches[0];
  offsetX = touch.clientX - chatContainer.offsetLeft;
  offsetY = touch.clientY - chatContainer.offsetTop;
});

// 👇 Added preventDefault + passive: false here
document.addEventListener("touchmove", (e) => {
  if (isDragging) {
    e.preventDefault(); // 🚨 Prevent page scrolling while dragging
    const touch = e.touches[0];
    let newLeft = touch.clientX - offsetX;
    let newTop = touch.clientY - offsetY;

    // Clamp for mobile too
    const maxLeft = window.innerWidth - chatContainer.offsetWidth;
    const maxTop = window.innerHeight - chatContainer.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    chatContainer.style.left = (touch.clientX - offsetX) + "px";
    chatContainer.style.top = (touch.clientY - offsetY) + "px";
    chatContainer.style.bottom = "auto"; // same fix for touch
  }
}, { passive: false }); // 👈 Important so preventDefault works

document.addEventListener("touchend", () => {
  isDragging = false;
});
