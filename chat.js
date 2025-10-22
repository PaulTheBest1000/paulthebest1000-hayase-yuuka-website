const socket = io('https://paulthebest1000-hayase-yuuka-website.onrender.com'); // Replace with your actual Render URL
const typingIndicator = document.getElementById('typing-indicator');
let typingTimeout;
const chatInput = document.getElementById('chat-input');
const chatHistory = document.getElementById('chat-history');
const sendBtn = document.getElementById('send-btn');
const emojiBtn = document.getElementById('emoji-btn');
const privateMsgToInput = document.getElementById('private-msg-to');
const privateMsgBtn = document.getElementById('private-msg-btn');
const onlineUsersList = document.getElementById('online-users');
const toggleSafeBtn = document.getElementById("toggle-safe-btn");
const emojiMenu = document.getElementById("emoji-menu");
const emojiList = document.getElementById("emoji-list");
const emojiPicker = {
  smileys: ["😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😍","😘","😜","🤪"],
  gestures: ["👍","👎","✌️","🤞","🤟","🤘","👏","🙌","🙏","💪","🤝"],
  hearts: ["❤️","💛","💚","💙","💜","🖤","💔","❣️","💕","💞"],
  animals: ["🐶","🐱","🐼","🦊","🦁","🐸","🐵","🐤","🦄","🐝"],
  food: ["🍕","🍔","🍟","🌭","🍣","🍩","🍫","🍪","🍦","☕","🥤"],
  symbols: ["🔥","✨","⭐","⚡","✅","❌","💯","💥","🎯","🏆"]
};

// Show menu button (you can place it anywhere)
emojiBtn.addEventListener("click", () => {
  emojiMenu.style.display = emojiMenu.style.display === "block" ? "none" : "block";
});

let currentCategory = null; // track which category is open

// Fill emoji list based on category
document.getElementById("emoji-categories").addEventListener("click", (e) => {
  const category = e.target.dataset.category;
  if (!category) return;

  if (currentCategory === category) {
    // Clicking the same category toggles hide
    emojiList.innerHTML = "";
    currentCategory = null;
  } else {
    // Show new category
    emojiList.innerHTML = ""; // clear previous emojis
    emojiPicker[category].forEach(emoji => {
        const span = document.createElement("span");
        span.textContent = emoji;
        span.addEventListener("click", () => {
            chatInput.value += emoji; // insert emoji into input
            chatInput.focus();
        });
        emojiList.appendChild(span);
    });
    currentCategory = category;
  }
});


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

// Default font
let currentFont = "Arial, sans-serif"; // or whatever default you want

// --- Markdown parser ---
function parseMarkdown(text) {
  // ***bold+italic***
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, "<b><i>$1</i></b>");
  // **bold**
  text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  // *italic*
  text = text.replace(/\*(.*?)\*/g, "<i>$1</i>");
  // __underline__
  text = text.replace(/__(.*?)__/g, "<u>$1</u>");
  // ~~strikethrough~~
  text = text.replace(/~~(.*?)~~/g, "<s>$1</s>");
  // `inline code`
  text = text.replace(/`(.*?)`/g, "<code>$1</code>");
  // [text](url)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  return text;
}

// --- Updated displayMessage ---
function displayMessage(message, sender, username) {
  const msgElement = document.createElement('div');
  msgElement.classList.add(sender === 'user' ? 'user-message' : 'other-message');
  msgElement.style.fontFamily = currentFont; // your font toggle still works
  msgElement.innerHTML = `${username}: ${parseMarkdown(message)}`; // parse full markdown
  chatHistory.appendChild(msgElement);
  chatHistory.scrollTop = chatHistory.scrollHeight; // auto-scroll
}

// Ensure the current username is sent with the message
function sendChatMessage() {
  const message = chatInput.value.trim();
  if (message) {
      // Display the message locally (only for the sender)
      displayMessage(message, 'user', currentUsername);

      // Emit the message to the server
      socket.emit('sendMessage', { message, sender: 'user', username: currentUsername });

      chatInput.value = ''; // Clear input field
  }
}

// Send button click
sendBtn.addEventListener('click', sendChatMessage);

// Enter key press
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { // Enter sends message
      e.preventDefault(); // Prevent newline
      sendChatMessage();
  }
  // Shift+Enter allows newline
});

// --- Safe Ping Sound System with Password Access ---
function initSafePingSystem() {
  let safeMode = true; // Default: only safe pings
  let unsafeUnlocked = false; // Tracks if password was entered
  const toggleBtn = document.getElementById("toggle-safe-btn"); // button in HTML

  const sounds = {
    ping001: { src: "ping-001.mp3", safe: true },
    ping002: { src: "ping-002.mp3", safe: false },
    ping003: { src: "ping-003.mp3", safe: false }
  };

  const password = "HayaseYuukaMemberOfTheYLF"; // change this to your secret password

      // Function to pick a sound based on safeMode & password unlock
      const pickPing = () => {
        const available = Object.values(sounds).filter(s => s.safe || unsafeUnlocked);
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    };

    // Function to play a ping
    const playPing = () => {
        const sound = pickPing();
        if (!sound) return;
        const audio = new Audio(sound.src);
        audio.volume = sound.safe ? 1 : 0.5; // 50% volume for unsafe sounds
        audio.play().catch(err => console.log("Audio failed:", err));
    };

    // Update button UI
    const updateToggleUI = () => {
        if (safeMode) {
            toggleBtn.textContent = "Safe Pings: ON";
            toggleBtn.classList.remove("off");
            toggleBtn.classList.add("on");
        } else {
            toggleBtn.textContent = "Safe Pings: OFF";
            toggleBtn.classList.remove("on");
            toggleBtn.classList.add("off");

            // Only allow unsafe pings if password unlocked
            if (!unsafeUnlocked) {
                const userPass = prompt("Enter password to enable unsafe pings:");
                if (userPass === password) {
                    unsafeUnlocked = true;
                    alert("✅ Safe Pings Offline!");
                } else {
                    safeMode = true; // force back to safe mode
                    alert("❌ Safe Pings Online!");
                }
            }

            if (unsafeUnlocked) {
                alert("⚠️ Warning: Safe Pings Filter is compromised!");
            }
        }
    };

    // Initial UI update
    updateToggleUI();

    // Toggle button click
    toggleBtn.addEventListener("click", () => {
        safeMode = !safeMode;
        updateToggleUI();
    });

    // Return function to be used in chat
    return playPing;
}

// Initialize
const playPing = initSafePingSystem();

// Listen for messages from the server
socket.on('receiveMessage', (data) => {
  if (data.username !== currentUsername) { // Only show for other users
      displayMessage(data.message, data.sender, data.username); // Show in chat

      if (Notification.permission === "granted") {
          playPing(); // safe/unsafe logic applied automatically
          new Notification(`${data.username} says:`, {
              body: data.message,
              icon: "IMG_6281.ico" // optional icon
          });
      } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                  playPing();
                  const notification = new Notification(`${data.username} says:`, {
                      body: data.message,            // the main text
                      icon: "IMG_6281.ico",          // icon for the notification
                      tag: `chat-${data.username}`,  // group similar notifications
                      renotify: true,                // alert again if a notification with the same tag exists                  
                      requireInteraction: false      // true: keeps notification until user clicks/dismisses
                  });
                  notification.onclick = () => {
                    window.focus();                 // brings browser to front
                    chatInput.focus();              // focuses chat input
                    notification.close();           // optional
                };
              }
          });
      }
    
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
