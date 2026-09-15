const socket = io('https://paulthebest1000-hayase-yuuka-website.onrender.com'); // Replace with your actual Render URL
const PUBLIC_VAPID_KEY = "BPLN0LnYfOWlxZZNZ3wFW_6JDae1hQqODw82IBUWQwUJAsKQdBrzOh_O8PA762v2Ju-oK_fpXLvR6Y_qLRsgSU4";const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const chatHistory = document.getElementById('chat-history');
const sendBtn = document.getElementById('send-btn');
const emojiBtn = document.getElementById('emoji-btn');
const toggleSafeBtn = document.getElementById("toggle-safe-btn");
const privateMsgToInput = document.getElementById('private-msg-to');
const privateMsgBtn = document.getElementById('private-msg-btn');
const onlineUsersList = document.getElementById('online-users');
const emojiMenu = document.getElementById("emoji-menu");
const emojiList = document.getElementById("emoji-list");
const emojiCategories = document.getElementById("emoji-categories");
const typingIndicator = document.getElementById('typing-indicator');
const chattoggleSafeBtn = document.getElementById('chat-toggle-btn');
const chatContainer = document.getElementById('chat-container');
const chatHeader = document.getElementById("chat-header");

const changeUsernameInput =
  document.getElementById('change-username-input');

const changeUsernameBtn =
  document.getElementById('change-username-btn');

// 💬 Mention dropdown
    const mentionDropdown = document.createElement('div');

    mentionDropdown.id = 'mention-dropdown';
    mentionDropdown.style.display = 'none';

    chatInput.parentElement.appendChild(mentionDropdown);

let typingTimeout;
let onlineUsers = [];

socket.on('onlineUsers', (users) => {
    onlineUsers = users;

    onlineUsersList.innerHTML = '';

    users.forEach(user => {
        const username =
            user.username?.trim() || 'User';

        const li = document.createElement('li');

        li.textContent =
            user.userId === userId
                ? `${username} (You)`
                : username;

        onlineUsersList.appendChild(li);
    });
});

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
emojiMenu.style.maxWidth = "350px";
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

// Store a persistent user ID for this browser
let userId = localStorage.getItem('chatUserId');

if (!userId) {
  userId =
    crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  localStorage.setItem('chatUserId', userId);
}

// Store the username
const DEFAULT_USERNAME = 'User';

const savedUsername =
  localStorage.getItem('playerName')?.trim();

const userName =
  savedUsername || DEFAULT_USERNAME;

// If no valid username was registered, use the default
if (!savedUsername) {
  localStorage.setItem('playerName', DEFAULT_USERNAME);
}

let currentUsername = userName;

changeUsernameBtn.addEventListener('click', () => {
  const newUsername =
    changeUsernameInput.value.trim();

  if (newUsername) {
    currentUsername = newUsername;

    localStorage.setItem(
      'playerName',
      currentUsername
    );

    alert(
      `Username changed to ${currentUsername}`
    );

    changeUsernameInput.value = '';

    // Tell the server about our user ID and username
    socket.emit('register', {
      userId,
      username: currentUsername
    });
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

// Detect @ symbol
chatInput.addEventListener('input', () => {
  const text = chatInput.value;

  // Find the @ currently being typed
  const match = text.match(/(^|\s)@([^\s]*)$/);

  if (!match) {
    mentionDropdown.style.display = 'none';
    return;
  }

  const search = match[2].toLowerCase();

  const matches = onlineUsers.filter(user => {
    const username =
      typeof user === 'string'
        ? user
        : user.username;

    return username
      .toLowerCase()
      .startsWith(search);
  });

  showMentionSuggestions(matches);
});

// Display username suggestions for mention
function showMentionSuggestions(users) {
  mentionDropdown.innerHTML = '';

  if (users.length === 0) {
    mentionDropdown.style.display = 'none';
    return;
  }

  users.forEach(user => {
    const username =
      typeof user === 'string'
        ? user
        : user.username;

    const item = document.createElement('div');

    item.className = 'mention-user';
    item.textContent = `@${username}`;

    item.addEventListener('click', () => {
      insertMention(username);
    });

    mentionDropdown.appendChild(item);
  });

  mentionDropdown.style.display = 'block';
}

// Insert selected username for mention
function insertMention(username) {
  const text = chatInput.value;

  const match = text.match(/(^|\s)@([^\s]*)$/);

  if (!match) {
    return;
  }

  const start =
    match.index + match[1].length;

  const before =
    text.slice(0, start);

  const after =
    text.slice(start + match[2].length + 1);

  chatInput.value =
    `${before}@${username} ${after}`;

  mentionDropdown.style.display = 'none';

  chatInput.focus();

  // Put cursor after the inserted mention
  chatInput.selectionStart =
    chatInput.selectionEnd =
      before.length +
      username.length +
      2;
}

chattoggleSafeBtn.addEventListener('click', () => {
  if (chatContainer.style.display === 'block') {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'block';
  }
});

let isDragging = false;
let offsetX = 0, offsetY = 0;

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
      toggleSafeBtn.textContent = "Safe Pings: ON";
      toggleSafeBtn.classList.remove("off");
      toggleSafeBtn.classList.add("on");
    } else {
      toggleSafeBtn.textContent = "Safe Pings: OFF";
      toggleSafeBtn.classList.remove("on");
      toggleSafeBtn.classList.add("off");
    }
  };

  // 🔘 Handle toggle click
  toggleSafeBtn.addEventListener("click", () => {
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

  async function requestNotificationPermission() {
  // If Notifications are NOT supported
  if (!("Notification" in window)) {
    alert("Notifications are not supported on this device.");
    return;
  }

  // If permission is already granted → done
  if (Notification.permission === "granted") {
    console.log("Notifications already enabled.");
    return;
  }

  // If permission is denied → nothing you can do
  if (Notification.permission === "denied") {
    alert("You blocked notifications earlier. Enable them in browser settings.");
    return;
  }

  // If permission is default → ask for permission
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    alert("Notifications enabled!");
  } else {
    alert("Notifications disabled or dismissed.");
  }
}

  window.addEventListener("load", () => {
  if (!localStorage.getItem("askedNotification")) {
    setTimeout(async () => {
      await requestNotificationPermission();
      localStorage.setItem("askedNotification", "yes");
    }, 800); // small delay so the page feels loaded
  }
});

// Socket status
socket.on('connect', () => {
  console.log('🟢 SOCKET CONNECTED');
  console.log('   Socket ID:', socket.id);
  console.log('   Transport:', socket.io.engine.transport.name);
});

socket.on('disconnect', (reason) => {
  console.log('🔴 SOCKET DISCONNECTED:', reason);
});

socket.on('connect_error', (err) => {
  console.error('💥 SOCKET CONNECTION ERROR:', err.message);
});

// Listen for messages from the server
socket.on('receiveMessage', (data) => {
    console.log('📨 RECEIVED MESSAGE:', data);

    // Safety check:
    // If somehow the server sends our own message back,
    // don't display it a second time.
    if (data.senderId === socket.id) {
        console.log('↩️ Ignoring own message:', data.messageId);
        return;
    }

    // Automatically open chat when a new message arrives
    if (data.senderId !== socket.id) {
      chatContainer.style.display = 'block';
    }

    const messageHTML = highlightMentions(
        parseMarkdown(data.message)
    );

    const msgElement = document.createElement('div');

    msgElement.classList.add('other-message');

    msgElement.style.fontFamily = currentFont;

    // Store the unique message ID on the DOM element.
    msgElement.dataset.messageId = data.messageId;
    msgElement.dataset.senderId = data.senderId;

    msgElement.innerHTML =
        `${data.username}: ${messageHTML}`;

    chatHistory.appendChild(msgElement);

    chatHistory.scrollTo({
        top: chatHistory.scrollHeight,
        behavior: 'smooth'
    });

    console.log('👀 Mention check:', {
      message: data.message,
      currentUsername,
      lookingFor: `@${currentUsername}`,
      mentioned: data.message.includes(`@${currentUsername}`)
    });

    const mentioned =
      data.message.includes(`@${currentUsername}`);

    playPing();

    sendMentionNotification(
      data.username,
      data.message
    );

    setTimeout(() => {
        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        });
    }, 50);
});

// 🔔 Notification mode
// "mentions" = only @mentions
// "all" = every chat message
const mentionsBtn =
    document.getElementById('notifications-mentions');

const allMessagesBtn =
    document.getElementById('notifications-all');

let notificationMode = 'mentions';

function updateNotificationButtons() {
    mentionsBtn.disabled =
        notificationMode === 'mentions';

    allMessagesBtn.disabled =
        notificationMode === 'all';

    console.log(
        '🔔 Notification mode:',
        notificationMode
    );
}

mentionsBtn.addEventListener('click', () => {
    notificationMode = 'mentions';

    console.log(
        '🔔 Notifications set to: Mentions Only'
    );

    updateNotificationButtons();
});

allMessagesBtn.addEventListener('click', () => {
    notificationMode = 'all';

    console.log(
        '🔔 Notifications set to: All Messages'
    );

    updateNotificationButtons();
});

/* Initial state */
updateNotificationButtons();

async function sendMentionNotification(username, message) {
  console.log('🔔 Notification requested');
  console.log('   Username:', username);
  console.log('   Message:', message);
  console.log('   Notification mode:', notificationMode);

  // Mentions Only mode
  if (notificationMode === 'mentions') {
    console.log('👀 Mentions-only mode enabled');

    const mentioned =
      message.includes(`@${currentUsername}`);

    if (!mentioned) {
      console.log(
        '⏭️ Message does not mention you — notification skipped'
      );
      return;
    }
  }

  if (!('Notification' in window)) {
    console.error(
      '❌ Notifications API is not supported'
    );
    return;
  }

  console.log(
    '   Notification permission:',
    Notification.permission
  );

  if (Notification.permission !== 'granted') {
    console.warn(
      '⚠️ Notifications not allowed:',
      Notification.permission
    );
    return;
  }

  // Different title depending on notification mode
  const title =
    notificationMode === 'all'
      ? `New message from ${username}`
      : `You were mentioned by ${username}!`;

  const options = {
    body: message,
    icon: 'IMG_6281.ico',
    badge: 'IMG_6281.ico',

    tag:
      notificationMode === 'all'
        ? `message-${username}`
        : `mention-${username}`,

    renotify: true,
    requireInteraction: false,

    data: {
      type:
        notificationMode === 'all'
          ? 'message'
          : 'mention',

      username,
      message,
      url: window.location.href
    }
  };

  console.log(
    '📱 Service Worker support:',
    'serviceWorker' in navigator
  );

  // 📱 Mobile/Desktop Service Worker notification
  if ('serviceWorker' in navigator) {
    try {
      const registration =
        await navigator.serviceWorker.ready;

      console.log(
        '📡 Service Worker ready:',
        registration
      );

      await registration.showNotification(
        title,
        options
      );

      console.log(
        '✅ Mobile/Desktop Service Worker notification shown'
      );

      return;

    } catch (error) {
      console.error(
        '❌ Service Worker notification failed:',
        error
      );
    }
  }

  // 🖥️ Desktop/browser fallback
  console.log(
    '🖥️ Using browser notification fallback'
  );

  try {
    const notif =
      new Notification(title, options);

    console.log(
      '✅ Browser notification created'
    );

    notif.onclick = () => {
      window.focus();

      const chatInput =
        document.querySelector('#chat-input');

      if (chatInput) {
        chatInput.focus();
      }

      notif.close();
    };

  } catch (error) {
    console.error(
      '❌ Failed to create notification:',
      error
    );
  }
}

  // Register current username with the server
  socket.emit('register', {
    userId,
    username: currentUsername
  });

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
