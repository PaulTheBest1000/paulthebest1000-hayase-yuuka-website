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
  
// Function to shuffle an array using the Fisher-Yates (Knuth) algorithm
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements at i and j
    }
}

// Shuffle the options for each question
questions.forEach(question => {
    shuffleArray(question.options); // Shuffle the options array for each question
});
  
  function checkAnswers(userAnswers) {
      let score = 0;
      questions.forEach((question, index) => {
          if (userAnswers[index] === question.correctAnswer) {
              score++;
          }
      });
      return score;
  }
  
  function runQuiz(userName, userAnswers) {
      shuffleArray(questions);
  
      const userScore = checkAnswers(userAnswers);
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
      
      // Ensure elements exist before modifying
      if (scoreContainer) {
          scoreContainer.style.display = "block";
      } else {
          console.error("scoreContainer element not found!");
      }
  
      if (scoreText) {
          scoreText.textContent = "Score: 0";
      } else {
          console.error("scoreText element not found!");
      }
  
      const quizTimerElement = document.getElementById("quiz-timer"); // Move this declaration here
      if (quizTimerElement) {
          quizTimerElement.textContent = `Time Left: ${formatTime(quizDuration)}`;
      } else {
          console.error("quiz-timer element not found!");
      }
  
      const scoreMessageContainer = document.getElementById("score-message-container");
      if (scoreMessageContainer) {
          scoreMessageContainer.innerHTML = "";
      } else {
          console.error("score-message-container element not found!");
      }
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
          message = "Oh no! Yuuka is really upset because you failed! Better luck next time!";
          imageSrc = "IMG_2432.GIF";
      } else if (currentScore <= 549) {
          message = "Yuuka's peeking at you, but she's not impressed. You were *this* close to failing!";
          imageSrc = "IMG_2490.GIF";
      } else if (currentScore <= 1099) {
          message = "Yuuka’s impressed! You’re starting to make progress, but there’s still work to do!";
          imageSrc = "IMG_2487.GIF";
      } else if (currentScore <= 1650) {
          message = "Wow! Yuuka is super proud of you! Your hard work is paying off, keep it up!";
          imageSrc = "IMG_3422.GIF";
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
  
          const playerName = prompt("Enter your name to save your result:");
          if (playerName) {
              generateResultImage(playerName, currentScore, imageSrc);
          }
      }, 1000); // 1 second delay before showing the message
  }
  
  function generateResultImage(name, score, imageSrc) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;
  
      const img = new Image();
      img.crossOrigin = "anonymous"; // In case of cross-origin issues
  
      img.onload = function () {
          ctx.drawImage(img, 0, 0, 800, 400); // Draw image at the top
  
          // Background for text
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(0, 400, 800, 200);
  
          // Draw text
          ctx.fillStyle = "#ffffff";
          ctx.font = "28px Arial";
          ctx.fillText(`Player: ${name}`, 50, 450);
          ctx.fillText(`Score: ${score}`, 50, 500);
          ctx.fillText("Thank you for playing the Yuuka Quiz!", 50, 550);
  
          // Convert to image data URL
          const imageDataURL = canvas.toDataURL('image/png');
  
          // Save to gallery
          saveResultImageToGallery(imageDataURL, name, score); // 👈 Add this line
  
          // Create download link
          const downloadLink = document.createElement('a');
          downloadLink.download = `Yuuka_Quiz_Result_${name}.png`;
          downloadLink.href = imageDataURL;
          downloadLink.textContent = "Download Your Result";
          downloadLink.classList.add("download-btn");
  
          document.getElementById("score-message-container").appendChild(downloadLink);
      };
  
      img.src = imageSrc;
  }

    // Function to show a message and display a GIF
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
  
    function saveResultImageToGallery(imageDataURL, playerName, score) {
      const timestamp = new Date().toLocaleString();
      const result = {
          name: playerName,
          score: score,
          image: imageDataURL,
          timestamp: timestamp
      };
  
      const gallery = JSON.parse(localStorage.getItem("yuukaResultGallery")) || [];
      gallery.push(result);
      localStorage.setItem("yuukaResultGallery", JSON.stringify(gallery));
  }
