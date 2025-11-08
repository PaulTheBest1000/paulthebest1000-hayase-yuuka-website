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
  smileys: [
    "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😍","😘","😗","😙","😚",
    "🙂","🤗","🤩","🤭","🤫","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯",
    "😪","😫","🥱","😴","😌","😛","😜","🤪","😝","🤤","😒","😓","😔","😕","🙃","😖","😞",
    "😟","😢","😭","😦","😧","😨","😩","🤯","😬","😰","😱","🥶","🥵","🥴","😳","🤪","🤢",
    "🤮","🤧","😷","🤒","🤕","😇","🥳","🥺","🤠","🤓","🧐","😈","👿","💀","☠️","🤡","👻",
    "👽","👾","🤖"
  ],
  gestures: [
    "👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🙏","💪","👌","🤏","✌️","🤞",
    "🤟","🤘","🤙","🖖","👋","🤚","✋","🖐️","🤝","✍️","👏","🤜","🤛","💅","👈","👉",
    "👆","👇","☝️","✊","🤚","🤞","🤲","🖕","✋","🤳","🖋️","✏️","💅"
  ],
  hearts: [
    "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗",
    "💖","💘","💝","💟","💌","💑","💏","💋","♥️","💒","💌","💘","💗","💓","💞",
    "💖","💟","❣️","❤️‍🔥","❤️‍🩹"
  ],
  animals: [
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵",
    "🐔","🐧","🐦","🐤","🐣","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛",
    "🦋","🐌","🐞","🐜","🦂","🕷️","🕸️","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐",
    "🦞","🐠","🐟","🐡","🐬","🦈","🐳","🐋","🐊","🐅","🐆","🦓","🦍","🦧","🐘",
    "🦛","🦏","🐪","🐫","🦒","🦘","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐",
    "🦌","🐕","🐩","🐈","🐓","🦃","🕊️","🐇","🐁","🐀","🐿️","🦔"
  ],  
  food: [
    "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍈","🍒","🍑","🥭","🍍",
    "🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🌽","🥕","🧄","🧅","🥔",
    "🍠","🥐","🍞","🥖","🥨","🥯","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩",
    "🍗","🍖","🌭","🍔","🍟","🍕","🥪","🥙","🧆","🌮","🌯","🥗","🥘","🥫",
    "🍝","🍜","🍲","🍛","🍣","🍱","🥟","🍤","🍙","🍚","🍘","🍢","🍡","🍧",
    "🍨","🍦","🥧","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🧃","🥤","☕","🍵",
    "🍺","🍻","🍷","🥂","🍸","🍹","🍾","🥄","🍴","🍽️","🥢"
  ],  
  symbols: ["💯","♻️","⚠️","🚫","✅","❌","⭐","🌟","✨","💥","🔥","⚡","💫","❇️",
  "❗","❕","❓","❔","💤","💢","💬","🗯️","💭","💡","🔔","🔕","🎵","🎶","💰","💎","🔒",
  "🔓","🔑","❤️‍🔥","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","♈","♉",
  "♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆘","🆗","🆙","🆒","🆕","🆓",
  "🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","⬛","⬜","🔶","🔷","🔸","🔹","🔺","🔻",
  "💠","🔘","🔳","🔲","⏺️","⏹️","⏯️","⏩","⏪","⏫","⏬","⏸️","⏭️","⏮️","⏰","⏱️",
  "⏲️","⏳","⌛","⌚","♾️","⚙️","⚖️","⚔️","⚒️","⚗️","⚰️","⚱️","⚛️","⚕️","⚜️","⚓",
  "⛵","✈️","☂️","☁️","⚡","❄️","☃️","⛄","☄️","🔥","💧","🌊","🌈","🌍","🌎","🌏",
  "⭐","🌟","💫","✨","⚜️","🔰","♻️","💮","🏧","🚮","🚰","♿","🚹","🚺","🚻",
  "🚼","🚾","🅿️","🚸","⛔","🚫","🚳","🚭","🚯","🚱","🚷","📵","🔞","☢️",
  "☣️","⚠️","🚸","🔆","🔅","🔱","⚜️"]
};

// 🎨 Emoji Picker Layout — fully contained inside #chat-container

// Toggle menu visibility
emojiBtn.addEventListener("click", () => {
  emojiMenu.style.display = emojiMenu.style.display === "block" ? "none" : "block";
});

let currentCategory = null;

// 💫 Emoji Menu Container — keeps everything locked inside
emojiMenu.style.width = "100%";
emojiMenu.style.boxSizing = "border-box";
emojiMenu.style.maxWidth = "270px";
emojiMenu.style.overflow = "hidden";
emojiMenu.style.borderRadius = "8px";
emojiMenu.style.marginTop = "8px";
emojiMenu.style.background = "rgba(0,0,0,0.25)";
emojiMenu.style.backdropFilter = "blur(8px)";
emojiMenu.style.border = "1px solid rgba(255,255,255,0.2)";
emojiMenu.style.padding = "6px";
emojiMenu.style.display = "none";
emojiMenu.style.flexDirection = "column";

// 💫 Category bar — fits exactly within menu width
const emojiCategories = document.getElementById("emoji-categories");
emojiCategories.style.display = "flex";
emojiCategories.style.overflowX = "auto";
emojiCategories.style.whiteSpace = "nowrap";
emojiCategories.style.gap = "5px";
emojiCategories.style.padding = "4px";
emojiCategories.style.maxWidth = "100%";
emojiCategories.style.scrollBehavior = "smooth";
emojiCategories.style.borderBottom = "1px solid rgba(255,255,255,0.2)";
emojiCategories.style.background = "rgba(255,255,255,0.08)";
emojiCategories.style.borderRadius = "6px";
emojiCategories.style.msOverflowStyle = "none";
emojiCategories.style.scrollbarWidth = "none";
emojiCategories.style.overflowY = "hidden";
emojiCategories.style.flexShrink = "0";

// 🔧 Prevent horizontal scroll from shifting layout
emojiCategories.addEventListener("wheel", (e) => {
  if (e.deltaY !== 0) {
    emojiCategories.scrollLeft += e.deltaY;
    e.preventDefault();
  }
});

// 💫 Emoji list — 5 per row, scrollable inside menu
emojiList.style.maxHeight = "160px";
emojiList.style.overflowY = "auto";
emojiList.style.display = "grid";
emojiList.style.gridTemplateColumns = "repeat(5, 1fr)";
emojiList.style.gap = "6px";
emojiList.style.padding = "5px";
emojiList.style.textAlign = "center";
emojiList.style.justifyItems = "center";
emojiList.style.alignItems = "center";
emojiList.style.background = "rgba(255,255,255,0.08)";
emojiList.style.borderRadius = "6px";
emojiList.style.marginTop = "5px";
emojiList.style.boxSizing = "border-box";
emojiList.style.width = "100%";

// 🧠 Fill emoji list when category clicked
emojiCategories.addEventListener("click", (e) => {
  const category = e.target.dataset.category;
  if (!category) return;

  if (currentCategory === category) {
    emojiList.innerHTML = "";
    currentCategory = null;
  } else {
    emojiList.innerHTML = "";
    emojiPicker[category].forEach(emoji => {
      const span = document.createElement("span");
      span.textContent = emoji;
      span.style.cursor = "pointer";
      span.style.fontSize = "22px";
      span.style.transition = "transform 0.1s";
      span.addEventListener("mouseenter", () => (span.style.transform = "scale(1.3)"));
      span.addEventListener("mouseleave", () => (span.style.transform = "scale(1)"));
      span.addEventListener("click", () => {
        chatInput.value += emoji;
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

// 🎨 Default font
let currentFont = "Arial, sans-serif"; // can be toggled later

// 🧠 Markdown parser — supports bold, italic, underline, links, etc.
function parseMarkdown(text) {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "<b><i>$1</i></b>")   // ***bold+italic***
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")              // **bold**
    .replace(/\*(.*?)\*/g, "<i>$1</i>")                  // *italic*
    .replace(/__(.*?)__/g, "<u>$1</u>")                  // __underline__
    .replace(/~~(.*?)~~/g, "<s>$1</s>")                  // ~~strikethrough~~
    .replace(/`(.*?)`/g, "<code>$1</code>")              // `inline code`
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>'); // [text](url)
}

// ✨ Highlight @mentions in chat
function highlightMentions(text) {
  return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
}

// 💬 Display a message in the chat box
function displayMessage(message, sender, username) {
  const msgElement = document.createElement('div');
  msgElement.classList.add(sender === 'user' ? 'user-message' : 'other-message');
  msgElement.style.fontFamily = currentFont;
  msgElement.innerHTML = `${username}: ${highlightMentions(parseMarkdown(message))}`;

  chatHistory.appendChild(msgElement);

  // 🚀 Smooth auto-scroll to bottom after render
  requestAnimationFrame(() => {
    chatHistory.scrollTo({
      top: chatHistory.scrollHeight,
      behavior: 'smooth'
    });
  });
}

let deleting = false;
let deleteTimeout;

// ⚡ Detect fast deletion mode
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace') {
    if (!deleting) {
      deleting = true;

      // Enable turbo mode (less lag)
      chatInput.style.transition = 'none';
      chatInput.style.overflowY = 'auto';
    }

    // Reset timer every time you press or hold Backspace
    clearTimeout(deleteTimeout);
    deleteTimeout = setTimeout(() => {
      // 🧘 Stop turbo mode after no Backspace for 300ms
      deleting = false;
      chatInput.style.transition = '';
      chatInput.style.overflowY = '';
    }, 300);
  }
});

// 📤 Send message
function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  // ✅ Simple URL regex
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  // Escape HTML to prevent injection
  const escapeHTML = (str) => str.replace(/[&<>"']/g, (m) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });

  // Replace URLs with clickable links safely
  const safeMessage = escapeHTML(message).replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

  // Display in chat
  displayMessage(safeMessage, 'user', currentUsername);

  // Emit original message (optional: send raw text)
  socket.emit('sendMessage', {
    message, // raw message without <a> tags
    sender: 'user',
    username: currentUsername
  });

  // Reset input
  chatInput.value = '';
  chatInput.style.transition = 'none';
  chatInput.style.height = '';

  // Scroll to bottom
  requestAnimationFrame(() => {
    chatHistory.scrollTo({
      top: chatHistory.scrollHeight,
      behavior: 'smooth'
    });
  });
}

// 🖱️ Send button
sendBtn.addEventListener('click', sendChatMessage);

// ⌨️ Enter key sends, Shift+Enter = newline
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

// --- Safe Ping Sound System with Password Access ---
function initSafePingSystem() {
  let safeMode = true; // Default: only safe pings
  let unsafeUnlocked = false; // Tracks if password was entered
  const toggleBtn = document.getElementById("toggle-safe-btn");

  const sounds = {
    ping001: { src: "ping-001.mp3", safe: true },
    ping002: { src: "ping-002.mp3", safe: false },
    ping003: { src: "ping-003.mp3", safe: false }
  };

  const password = "HayaseYuukaMemberOfTheYLF"; // secret passphrase

  // 🔊 Pick a sound
  const pickPing = () => {
    const available = Object.values(sounds).filter(s => s.safe || unsafeUnlocked);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  // 🔊 Play sound
  const playPing = () => {
    const sound = pickPing();
    if (!sound) return;
    const audio = new Audio(sound.src);
    audio.volume = sound.safe ? 1 : 0.5;
    audio.play().catch(err => console.log("Audio failed:", err));
  };

  // 🎨 Update button UI
  const updateToggleUI = () => {
    if (safeMode) {
      toggleBtn.textContent = "Safe Pings: ON";
      toggleBtn.classList.remove("off");
      toggleBtn.classList.add("on");
    } else {
      toggleBtn.textContent = "Safe Pings: OFF";
      toggleBtn.classList.remove("on");
      toggleBtn.classList.add("off");
    }
  };

  // 🔘 Handle toggle click
  toggleBtn.addEventListener("click", () => {
    // If switching from ON → OFF
    if (safeMode) {
      // Ask for password BEFORE changing mode
      const userPass = prompt("Are you sure bro? Don't say i didn't warn you!");
      if (userPass === null) return;
      if (userPass === password) {
        unsafeUnlocked = true;
        safeMode = false;
        alert("✅ Success Safe Pings Offline!");
        alert("⚠️ Warning: Safe Pings Filter is compromised!");
      } else {
        alert("❌ Error!");
        safeMode = true;
      }
    } else {
      // Turning back ON doesn’t need password
      safeMode = true;
      alert("🟢 Success Safe Pings Online!");
    }

    // Always update button after decision
    updateToggleUI();
  });

  // Initial UI update
  updateToggleUI();

  // Return for use in chat
  return playPing;
}

// Initialize
const playPing = initSafePingSystem();

// Listen for messages from the server
socket.on('receiveMessage', (data) => {
  if (data.username !== currentUsername) {
    // 💬 Display in chat with mention highlights
    const messageHTML = highlightMentions(parseMarkdown(data.message));
    const msgElement = document.createElement('div');
    msgElement.classList.add('other-message');
    msgElement.style.fontFamily = currentFont;
    msgElement.innerHTML = `${data.username}: ${messageHTML}`;
    chatHistory.appendChild(msgElement);

    // 🚀 Smooth scroll to bottom
    chatHistory.scrollTo({
      top: chatHistory.scrollHeight,
      behavior: 'smooth'
    });

    // 🧠 Check for mention
    const mentioned = data.message.includes(`@${currentUsername}`);

    if (mentioned) {
      // 🔔 Play ping sound
      playPing();

      // 🌟 Add glow animation for mentions
      msgElement.querySelectorAll('.mention').forEach(m => {
        if (m.textContent === `@${currentUsername}`) {
          m.classList.add('mention-me');
          setTimeout(() => m.classList.remove('mention-me'), 1500);
        }
      });

      // 🖥️ Desktop/mobile notification
      if (Notification.permission === "granted") {
        const title = `You were mentioned by ${data.username}!`;
        const options = {
          body: data.message,
          icon: "IMG_6281.ico",
          tag: `mention-${data.username}`,
          renotify: true,
          requireInteraction: false
        };

        // ✅ Use service worker if available (better for mobile/PWA)
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            if (reg && reg.showNotification) {
              reg.showNotification(title, options);
            } else {
              console.warn('No active service worker registration found.');
              // fallback to Notification API
              const fallback = new Notification(title, options);
              fallback.onclick = () => {
                window.focus();
                chatInput.focus();
                fallback.close();
              };
            }
          });
        } else {
          // 💻 Fallback for desktop/tab use
          const mentionNotification = new Notification(title, options);
          mentionNotification.onclick = () => {
            window.focus();
            chatInput.focus();
            mentionNotification.close();
          };
        }
      }
    }

    // 🎨 Auto-scroll smoothly to bottom
    const chatBox = document.getElementById("chat-box");
    setTimeout(() => {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
      });
    }, 50);
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
