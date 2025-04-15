// script.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
              console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
              console.log('Service Worker registration failed:', error);
          });
  });
}

// main.js (or your script.js file)

const startOfflineTime = new Date();
startOfflineTime.setHours(12, 0, 0, 0); // Set 12:00 PM

const endOfflineTime = new Date();
endOfflineTime.setHours(19, 30, 0, 0); // Set 7:30 PM

function checkOfflinePeriod() {
    const currentTime = new Date();

    // Check if the current time is between the offline start and end time
    if (currentTime >= startOfflineTime && currentTime <= endOfflineTime) {
        // Enable offline behavior
        enableOfflineMode();
    } else {
        // Disable offline behavior
        disableOfflineMode();
    }
}

function enableOfflineMode() {
    console.log("Website is in offline mode.");
    // Optionally, show a message or activate service worker's caching behavior
}

function disableOfflineMode() {
    console.log("Website is back online.");
    // Reset to normal behavior
}

// Check if the site should be offline immediately
checkOfflinePeriod();

// Optionally, check every minute
setInterval(checkOfflinePeriod, 60000);

// Function to update the time
function updateTime() {
    const timeElement = document.getElementById('time');
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    timeElement.innerHTML = `Current Time: ${hours}:${minutes}:${seconds}`;
}

// Function to update the calendar date
function updateCalendar() {
    const calendarElement = document.getElementById('calendar');
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // months are 0-indexed
    const year = now.getFullYear();
    const dayOfWeek = now.toLocaleString('default', { weekday: 'long' });

    calendarElement.innerHTML = `Today: ${dayOfWeek}, ${month}/${day}/${year}`;
}

setInterval(updateTime, 1000); // Keep updating time every second
setInterval(updateCalendar, 60000); // Update calendar every minute (60000 ms)

// Initialize the time and calendar display
updateTime();
updateCalendar();

// Initialize score and question index 
let currentScore = 0;
let currentQuestionIndex = 0;

// Set the duration of the quiz in seconds (e.g., 5 minutes = 300 seconds)
let quizDuration = 300; // You can change this to any number of seconds
let timer;
let timerElement = document.getElementById('quiz-timer');

// Function to format time into MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Start the countdown
function startCountdown() {
    clearInterval(timer); // Make sure no previous timer is running
    timer = setInterval(() => {
        if (quizDuration <= 0) {
            clearInterval(timer);
            timerElement.textContent = "Time's up!";
            endGame();
        } else {
            timerElement.textContent = `Time Left: ${formatTime(quizDuration)}`;
            quizDuration--;
        }
    }, 1000);
}

// Array of questions
const questions = [
    {
        question: "Why do we love Yuuka?",
        correctAnswer: "Because she's cute",
        options: ["Because she's a girl", "Because she's cute", "Because she's strict", "Because she's 100KG", "Because she's Yuuka"]
    },
    {
        question: "Do you love Yuuka too?",
        correctAnswer: "Yes",
        options: ["No", "Maybe", "Yes"]
    },
    {
        question: "Yuuka is #1!",
        correctAnswer: "I Agree",
        options: ["I Refuse", "I Agree"]
    },
    {
        question: "What is Yuuka’s personality like?",
        correctAnswer: "Strict and organized",
        options: ["Strict and organized", "Playful and silly", "Shy and quiet", "Wild and unpredictable", "Cool and aloof"]
    },
    {
        question: "What does Yuuka usually carry with her?",
        correctAnswer: "A calculator",
        options: ["A calculator", "A plushie", "A water bottle", "A phone", "A sandwich"]
    },
    {
        question: "How does Yuuka react to compliments?",
        correctAnswer: "Blushes and gets flustered",
        options: ["Blushes and gets flustered", "Says 'Thank you!' proudly", "Ignores them", "Denies them awkwardly", "Writes them down"]
    },
    {
        question: "What is Yuuka’s hair color?",
        correctAnswer: "Blue",
        options: ["Blue", "Pink", "Black", "White", "Red"]
    },
    {
        question: "What is Yuuka most likely to say?",
        correctAnswer: "That’s not in the plan!",
        options: ["I’m watching the budget.", "That’s not in the plan!", "Why is everyone like this…", "Stay focused!", "Cute things are a distraction!"]
    },
    {
        question: "How heavy is Yuuka according to memes?",
        correctAnswer: "100KG",
        options: ["45KG", "100KG", "69KG", "90KG", "0KG"]
    },
    {
        question: "Yuuka’s favorite way to relax is probably:",
        correctAnswer: "Organizing her things",
        options: ["Organizing her things", "Drinking tea quietly", "Playing mobile games", "Watching anime", "Cuddling a plushie"]
    },
    {
        question: "Yuuka secretly likes:",
        correctAnswer: "Cute stuff",
        options: ["Cute stuff", "Loud music", "Horror movies", "Being praised", "Oversleeping"]
    }
];

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

questions.forEach(question => shuffleArray(question.options));

let leaderboard = [];

function checkAnswers(userAnswers) {
    let score = 0;
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            score++;
        }
    });
    return score;
}

function updateLeaderboard(name, score) {
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);
    displayLeaderboard();
}

function displayLeaderboard() {
    console.log("Leaderboard:");
    leaderboard.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.name}: ${entry.score} points`);
    });
}

function runQuiz(userName, userAnswers) {
    const userScore = checkAnswers(userAnswers);
    updateLeaderboard(userName, userScore);
    alert(`${userName}, your score is: ${userScore} out of ${questions.length}`);
}

// Get modal elements
const modal = document.getElementById("quiz-modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const scoreContainer = document.getElementById("score-container");
const scoreText = document.getElementById("score");

// Open the modal when the user clicks the "Start Quiz" button
openModalBtn.onclick = function () {
    resetGame();
    modal.style.display = "block";
    startCountdown();
    loadQuestion();
};

// Close the modal when the user clicks the "X" button
closeModalBtn.onclick = function () {
    modal.style.display = "none";
    clearInterval(timer);
};

// Close the modal if the user clicks anywhere outside of the modal content
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
        clearInterval(timer);
    }
};

// Reset game state
function resetGame() {
    currentScore = 0;
    currentQuestionIndex = 0;
    quizDuration = 300; // Reset the timer
    scoreContainer.style.display = "block";
    scoreText.textContent = "Score: 0";
    document.getElementById("quiz-timer").textContent = `Time Left: ${formatTime(quizDuration)}`;
    const scoreMessageContainer = document.getElementById("score-message-container");
    scoreMessageContainer.innerHTML = "";
}

// Load the current question
function loadQuestion() {
    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        document.getElementById("question").textContent = currentQuestion.question;

        const answersContainer = document.getElementById("answers-container");
        answersContainer.innerHTML = "";

        currentQuestion.options.forEach(option => {
            const button = document.createElement("button");
            button.classList.add("answer");
            button.textContent = option;
            button.onclick = () => checkAnswer(option);
            answersContainer.appendChild(button);
        });
    } else {
        endGame();
    }
}

// Check if the selected answer is correct
function checkAnswer(selectedAnswer) {
    const currentQuestion = questions[currentQuestionIndex];
    const funFacts = [
        "Yuuka is known for her strict financial habits!",
        "Did you know Yuuka has been a treasurer for 3 years?",
        "100KG? That's an interesting guess!",
        "Yuuka's nickname in the group is 'Budget Master'.",
        "She once balanced a seminar's budget perfectly without external help!"
    ];

    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    function showFunFact() {
        const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
        alert(`Fun Fact: ${fact}`);
    }

    if (selectedAnswer === currentQuestion.correctAnswer) {
        currentScore += 150;
        correctSound.play();
        alert("Correct! You earned 150 points.");
        showFunFact();
    } else {
        wrongSound.play();
        alert("Incorrect! You earned no points.");
        showFunFact();
    }

    scoreText.textContent = "Score: " + currentScore;
    currentQuestionIndex++;
    loadQuestion();
}

// End the game and display the final score with a message and image
function endGame() {
    clearInterval(timer);

    let message = "";
    let imageSrc = "";

    if (currentScore === 0) {
        message = "Yuuka is angry because you failed!";
        imageSrc = "IMG_2432.GIF";
    } else if (currentScore === 150) {
        message = "Yuuka is peeking and leaving because you almost failed!";
        imageSrc = "IMG_2490.GIF";
    } else if (currentScore === 300) {
        message = "Wow you tried! As a reward, Yuuka will encourage you to make it to 450 points!";
        imageSrc = "IMG_2487.GIF";
    } else if (currentScore === 450) {
        message = "You're getting there! Yuuka is peeking at your progress!";
        imageSrc = "IMG_3624.GIF";
    } else if (currentScore === 600) {
        message = "You're halfway there! Yuuka is starting to notice you!";
        imageSrc = "IMG_3611.GIF";
    } else if (currentScore === 750) {
        message = "Yuuka is impressed! Keep going!";
        imageSrc = "IMG_3615.GIF";
    } else if (currentScore === 900) {
        message = "So close! Yuuka is cheering you on now!";
        imageSrc = "IMG_3588.GIF";
    } else if (currentScore === 1050) {
        message = "You're doing great! Yuuka is quietly smiling!";
        imageSrc = "IMG_3560.GIF";
    } else if (currentScore === 1200) {
        message = "Wow! Yuuka is really proud of you now!";
        imageSrc = "IMG_3543.GIF";
    } else if (currentScore === 1350) {
        message = "Almost perfect! Yuuka is blushing with joy!";
        imageSrc = "IMG_3522.GIF";
    } else if (currentScore === 1500) {
        message = "Incredible! One question away from perfection!";
        imageSrc = "IMG_3466.GIF";
    } else if (currentScore === 1650) {
        message = "Amazing! You got a perfect score and Yuuka is happy!";
        imageSrc = "IMG_3442.GIF";
    }

    console.log(`Message: ${message}, GIF: ${imageSrc}`);

    scoreText.textContent = "Final Score: " + currentScore;

    setTimeout(() => {
        alert("Game Over! Your final score is: " + currentScore + "\n" + message);

        const scoreMessageContainer = document.getElementById("score-message-container");
        scoreMessageContainer.innerHTML = "";

        const messageElement = document.createElement("p");
        messageElement.textContent = message;

        const imageElement = document.createElement("img");
        imageElement.src = imageSrc;
        imageElement.alt = "Score Image";

        scoreMessageContainer.appendChild(messageElement);
        scoreMessageContainer.appendChild(imageElement);

        // Create an input field for the player's name
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Enter your name";
        scoreMessageContainer.appendChild(nameInput);

        // Create a submit button for the name
        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit";
        scoreMessageContainer.appendChild(submitButton);

// Handle the submit button click
submitButton.onclick = function () {
    const playerName = nameInput.value.trim();
    if (playerName) {
        // Disable input and button to prevent resubmission
        nameInput.disabled = true;
        submitButton.disabled = true;
        submitButton.textContent = "Submitted";

        // Update the leaderboard
        updateLeaderboard(playerName, currentScore);
        alert(`Thank you for playing, ${playerName}! Your score has been saved.`);
        displayLeaderboard(); // Optional - if you have this function

        // Optional: Show thank-you message and close modal
        setTimeout(() => {
            scoreMessageContainer.innerHTML = "<p>Thank you for playing the Yuuka quiz!</p>";
        }, 5000);

        setTimeout(() => {
            modal.style.display = "none";
        }, 10000);

        // Optional: Redirect to leaderboard page after 3 seconds
        setTimeout(() => {
            window.location.href = "leaderboard.html";
        }, 3000);
    } else {
        alert("Please enter a name.");
    }
};        
        
    }, 500);
}

// Function to update the leaderboard and save scores
function updateLeaderboard(name, score) {
    let storedData = JSON.parse(localStorage.getItem("yuukaLeaderboard")) || [];
    storedData.push({ name, score });
    storedData.sort((a, b) => b.score - a.score);
    storedData = storedData.slice(0, 10); // Keep top 10
    localStorage.setItem("yuukaLeaderboard", JSON.stringify(storedData));
}

// Function to display the leaderboard
function displayLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = ''; // Clear existing entries

    leaderboard.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(listItem);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith("leaderboard.html")) {
        displayLeaderboard();
    }
});

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const music = document.getElementById('bg-music');
    const toggleButton = document.getElementById('music-toggle-btn');
    const progressBar = document.getElementById('progress-bar');
    const timeDisplay = document.getElementById('time-display');
    const message = document.getElementById('message');
    
    // Toggle the play/pause state of the music
    function toggleMusic() {
        if (music.paused) {
            music.play();
            toggleButton.textContent = "Pause Music";
            message.innerHTML = `
                Music is now playing. Enjoy the melody! <br>
                Blue Archive OST 17. Irasshaimase 
                <div class="music-animation">
                    <span></span><span></span><span></span>
                </div>`;
        } else {
            music.pause();
            toggleButton.textContent = "Play Music";
            message.innerHTML = `Music is paused. Take a break! <br> 
                <a href="(https://www.youtube.com/watch?v=jHSozMn7GgA&pp=ygUMaXJhc3NoYWltYXNl)" target="_blank" style="color: blue; text-decoration: underline;">
                    [Original Blue Archive OST 17. Irasshaimase YouTube Video]
                </a>`;
        }
    }

    // Update progress bar and time display as music plays
    music.addEventListener('timeupdate', () => {
        const progress = (music.currentTime / music.duration) * 100;
        progressBar.value = progress || 0;

        const currentTime = formatTime(music.currentTime);
        const duration = formatTime(music.duration);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
    });

    // Seek music position when user moves the progress bar
    progressBar.addEventListener('input', () => {
        const seekTime = (progressBar.value / 100) * music.duration;
        music.currentTime = seekTime;
    });

    // Format time in minutes and seconds
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Attach the toggleMusic function to the button click event
    toggleButton.addEventListener('click', toggleMusic);
});

function showMessage() {
    alert('WE LOVE HAYASE YUUKA!!!'); // Show alert with the message

    // Display the GIF
    const gifContainer = document.getElementById('gif-container');
    gifContainer.style.display = 'block';  // Show the GIF container

    // Hide the GIF after 5 seconds (5000 ms)
    setTimeout(() => {
        gifContainer.style.display = 'none';  // Hide the GIF container
    }, 5000); // 5000ms = 5 seconds
}

// Example: Highlight the active menu item on click
document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.menu a.active')?.classList.remove('active');
        link.classList.add('active');
    });
});

document.querySelectorAll('.menu li').forEach(item => {
    item.addEventListener('click', () => {
        const dropdown = item.querySelector('.dropdown');
        if (dropdown) {
            dropdown.classList.toggle('open');
        }
    });
});

// Toggle menu visibility on mobile
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
});


// Handle Dropdown in Mobile
document.querySelectorAll('.menu li').forEach(item => {
    item.addEventListener('click', () => {
        const dropdown = item.querySelector('.dropdown');
        if (dropdown) {
            dropdown.classList.toggle('open');
            item.classList.toggle('active');
        }
    });
});

function setGridView() {
    const container = document.querySelector('.media-container');
    container.classList.remove('list-view');
    container.classList.add('grid-view');
  }

  function setListView() {
    const container = document.querySelector('.media-container');
    container.classList.remove('grid-view');
    container.classList.add('list-view');
  }
  
  const leaderboardDiv = document.getElementById("leaderboard");
  const storedData = JSON.parse(localStorage.getItem("yuukaLeaderboard")) || [];

  if (storedData.length === 0) {
    leaderboardDiv.innerHTML = "<p>No scores yet. Play the quiz first!</p>";
  } else {
    storedData.forEach((entry, index) => {
      const div = document.createElement("div");
      div.className = "entry";
      div.textContent = `${index + 1}. ${entry.name} - ${entry.score} pts`;
      leaderboardDiv.appendChild(div);
    });
  }