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

// Array of questions
const questions = [
    {
        question: "Hayse Yuuka is-",
        correctAnswer: "Treasurer of Seminar",
        options: ["Treasurer of Seminar", "100KG", "I do not know", "Strict financial girl", "Cute girl"]
    },
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
        question: "Yuuka is actually 100KG!",
        correctAnswer: "False",
        options: ["True", "False"]
    },
];

// Get modal elements
const modal = document.getElementById("quiz-modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const scoreContainer = document.getElementById("score-container");
const scoreText = document.getElementById("score");

// Open the modal when the user clicks the "Start Quiz" button
openModalBtn.onclick = function() {
    resetGame();  // Reset the game when the button is clicked
    modal.style.display = "block"; // Show the modal
    loadQuestion();  // Load the first question
};

// Close the modal when the user clicks the "X" button
closeModalBtn.onclick = function() {
    modal.style.display = "none"; // Hide the modal
};

// Close the modal if the user clicks anywhere outside of the modal content
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none"; // Hide the modal
    }
};

// Reset game state
function resetGame() {
    currentScore = 0;
    currentQuestionIndex = 0;
    scoreContainer.style.display = "block";  // Ensure the score container is visible
    scoreText.textContent = "Score: 0"; // Reset score display
    loadQuestion(); // Load the first question
}

// Load the current question
function loadQuestion() {
    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        document.getElementById("question").textContent = currentQuestion.question;
        
        const answersContainer = document.getElementById("answers-container");
        answersContainer.innerHTML = ""; // Clear previous answers

        // Create the answer buttons
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
    
    // Array of fun facts
    const funFacts = [
    "Yuuka is known for her strict financial habits!",
    "Did you know Yuuka has been a treasurer for 3 years?",
    "100KG? That's an interesting guess!",
    "Yuuka's nickname in the group is 'Budget Master'.",
    "She once balanced a seminar's budget perfectly without external help!"
];
    // Get sound elements
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    
    // Function to show a random fun fact
    function showFunFact() {
    const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
    alert(`Fun Fact: ${fact}`);
}
    // Display feedback and update score if correct
    if (selectedAnswer === currentQuestion.correctAnswer) {
        currentScore += 25; // Add 25 points for a correct answer
        correctSound.play(); // Play correct sound
        alert("Correct! You earned 25 points.");
        showFunFact(); // Show fun fact for correct answers
    } else {
        wrongSound.play(); // Play wrong sound
        alert("Incorrect! You earned no points.");
        showFunFact(); // Show fun fact for wrong answers
    }
    
    // Update the score display
    scoreText.textContent = "Score: " + currentScore;

    // Move to the next question
    currentQuestionIndex++;

    // Load the next question or end the game
    loadQuestion();
}

// End the game and display the final score with a message and image
function endGame() {
    let message = ""; // Initialize a message variable
    let imageSrc = ""; // Initialize a variable for the image source

    // Determine the message and image based on the final score
    if (currentScore === 0) {
        message = "Yuuka is angry because you failed!";
        imageSrc = "IMG_2432.GIF"; // Image for 0 points
    } else if (currentScore === 25) {
        message = "Yuuka is peeking and leaving because you almost failed!";
        imageSrc = "IMG_2490.GIF"; // Image for 25 points
    } else if (currentScore === 50) {
        message = "Wow you tried! As a reward, Yuuka will encourage you to make it to 100 points!";
        imageSrc = "IMG_2487.GIF"; // Image for 50 points
    } else if (currentScore === 75) {
        message = "You're so close! Yuuka is peeking at your progress!";
        imageSrc = "IMG_3624.GIF"; // Image for 75 points
    } else if (currentScore === 100) {
        message = "Amazing! You got a perfect score and Yuuka is happy!";
        imageSrc = "IMG_3442.GIF"; // Image for 100 points
    }

    // Update the score text
    scoreText.textContent = "Final Score: " + currentScore;

    // Create an img element to display the image
    const imageElement = document.createElement("img");
    imageElement.src = imageSrc; // Set the image source based on the score
    imageElement.alt = "Score Image"; // Set an alt attribute for accessibility
    imageElement.style.width = "100%"; // Make the image responsive on mobile
    imageElement.style.maxWidth = "500px"; // Limit the image width on larger screens
    imageElement.style.height = "auto"; // Maintain aspect ratio

    // Display the alert with the final score and the message
    setTimeout(() => {
        alert("Game Over! Your final score is: " + currentScore + "\n" + message);

        // Append the image and message to a specific container 
        const scoreMessageContainer = document.getElementById("score-message-container");

        // Make the message 25% smaller by reducing font size
        scoreMessageContainer.innerHTML = `<p style="text-align: center; font-size: 13.5px; padding: 10px;">${message}</p>`; // 25% smaller font size

        // Make the image 25% smaller by scaling width
        imageElement.style.width = '75%'; // Scale the image to 75% of its original size
        imageElement.style.height = 'auto'; // Maintain aspect ratio

        // Append the image to the container
       scoreMessageContainer.appendChild(imageElement); // Add the image

        // Set a timeout to hide the image and message after 10 seconds (10000 ms)
        setTimeout(() => {
            scoreMessageContainer.innerHTML = ""; // Clear the container
            // Optionally, add a message like "Proceeding to the next step..." or similar
            scoreMessageContainer.innerHTML = "<p>Thank you for playing the Yuuka quiz</p>";
        }, 10000); // 10000 ms = 10 seconds (this can be adjusted)

      // Close the modal after a short delay
       setTimeout(() => {
         modal.style.display = "none"; // Close the modal after the timeout
        }, 2500); // Wait for 2.5 seconds to give time for the image and message to be shown
      }, 500); // Wait for a moment before showing the final score
 }

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
