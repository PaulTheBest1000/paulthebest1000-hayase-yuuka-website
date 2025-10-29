// Extra.js
const cells = document.querySelectorAll('.cell');
const scoreBoard = document.getElementById('score');
const easyBtn = document.getElementById('easy-btn');
const normalBtn = document.getElementById('normal-btn');
const hardBtn = document.getElementById('hard-btn');
const timerDisplay = document.getElementById('timer');
const bootSection = document.getElementById('boot-section');
const playerNameInput = document.getElementById('player-name');
const gameResultSection = document.getElementById('yuukaResults');
const gameSection = document.getElementById('game-grid');
const finalMessage = document.getElementById('final-message');
const resultImage = document.getElementById('result-image');
const downloadBtn = document.getElementById('download-btn');
const resultsContainer = document.getElementById('results');

let score = 0;
let currentCellIndex = null;
let moleTimer = null;
let countdownTimer = null;
let timeInterval = 1000; // Default to easy
let gameStarted = false;
let timeLeft = 75;

const images = [
  "IMG_2432.GIF", // low score
  "IMG_2490.GIF", // mid-low score
  "IMG_2487.GIF", // mid-high score
  "IMG_3442.GIF"  // high score
];

function getRandomCell() {
  return Math.floor(Math.random() * cells.length);
}

function showWeasel() {
    // Clear previous moles
    cells.forEach(cell => cell.classList.remove('mole', 'bad-mole'));
    currentCellIndex = null;

    // Decide if good mole appears (e.g., 50% chance)
    const goodAppears = Math.random() < 0.5;

    // Decide if bad mole appears (e.g., 25% chance)
    const badAppears = Math.random() < 0.25;

    const availableIndexes = [...Array(cells.length).keys()];

    if (goodAppears) {
        const goodIndex = availableIndexes.splice(Math.floor(Math.random() * availableIndexes.length), 1)[0];
        cells[goodIndex].classList.add('mole');
    }

    if (badAppears && availableIndexes.length > 0) {
        const badIndex = availableIndexes.splice(Math.floor(Math.random() * availableIndexes.length), 1)[0];
        cells[badIndex].classList.add('bad-mole');
    }

    // If nothing appears, nothing to track
}

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  score = 0;
  scoreBoard.textContent = score;
  timeLeft = 75;
  bootSection.style.display = 'none';
  gameResultSection.style.display = 'none';
  gameSection.style.display = 'grid';

  countdownTimer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      stopGame();
    }
  }, 1000);

  moleTimer = setInterval(showWeasel, timeInterval);
}

function stopGame() {
  clearInterval(moleTimer);
  clearInterval(countdownTimer);
  gameStarted = false;

  if (currentCellIndex !== null) {
    cells[currentCellIndex].classList.remove('mole');
  }

  // Stop all music when the game ends
  const musicElements = document.querySelectorAll('audio');
  musicElements.forEach(music => {
    music.pause();
    music.currentTime = 0; // Reset to the start
  });

  // Stop background music after it's done
  const bgMusic = document.querySelector('audio'); // Assuming background music is the first audio element
  if (bgMusic) {
    bgMusic.onended = function() {
      bgMusic.pause();
      bgMusic.currentTime = 0; // Reset the background music
    };
  }

  const playerName = playerNameInput.value || "Anonymous";
  let resultImageSrc = images[0]; // Default to low score

  if (score >= 100) {
      resultImageSrc = images[4]; // High score
  } else if (score >= 50) {
      resultImageSrc = images[3]; // Mid-high
  } else if (score >= 25) {
      resultImageSrc = images[2]; // Mid-low
  } else {
    resultImageSrc = images[1]; // Low score
  }
  finalMessage.textContent = `${playerName}, your score is ${score}!`;
  resultImage.src = resultImageSrc;
  gameResultSection.style.display = 'block';

  const resultData = {
    name: playerName,
    score: score,
    image: resultImageSrc,
    timestamp: new Date().toISOString(),
  };

  let results = JSON.parse(localStorage.getItem('yuukaResults')) || [];
  results.push(resultData);
  localStorage.setItem('yuukaResults', JSON.stringify(results));

  displayResults();
}

function setDifficulty(difficulty) { 
  // Stop any currently playing music
  const musicElements = document.querySelectorAll('audio');
  musicElements.forEach(music => music.pause());

  let bgMusic;

  switch (difficulty) {
    case 'easy': 
      timeInterval = 1000;
      bgMusic = document.getElementById('easy-music');
      break;
    case 'normal': 
      timeInterval = 750;
      bgMusic = document.getElementById('normal-music');
      break;
    case 'hard': 
      timeInterval = 500;
      bgMusic = document.getElementById('hard-music');
      break;
  }

  // Lower the volume to 40%
  bgMusic.volume = 0.4;

  // Play the background music
  bgMusic.play();

  // Add an event listener to stop the music once it's done
  bgMusic.onended = function() {
    // Stop the music once it finishes
    bgMusic.pause();
    bgMusic.currentTime = 0; // Reset to the start
  };

  if (gameStarted) {
    clearInterval(moleTimer);
    moleTimer = setInterval(showWeasel, timeInterval);
  }
}

function displayResults() {  
  const results = JSON.parse(localStorage.getItem('yuukaResults')) || [];
  
  // Save the results to localStorage before navigating
  localStorage.setItem('yuukaResults', JSON.stringify(results));

  // Redirect to the results page (results.html)
  setTimeout(() => {
    window.location.href = "game-results.html";
  }, 10000);
}

function downloadResult() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 500;
  canvas.height = 300;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#000';
  context.font = '30px Arial';
  context.fillText(finalMessage.textContent, 20, 50);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = resultImage.src;
  img.onload = () => {
    context.drawImage(img, 20, 80, 100, 100);
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'game_result.png';
    link.click();
  };
}

// Event Listeners
easyBtn.addEventListener('click', () => {
  setDifficulty('easy');
  startGame();
});

normalBtn.addEventListener('click', () => {
  setDifficulty('normal');
  startGame();
});

hardBtn.addEventListener('click', () => {
  setDifficulty('hard');
  startGame();
});

const happySound = document.getElementById('happy-sound');
const angrySound = document.getElementById('angry-sound');

let soundQueue = [];
let isPlaying = false;
let lastPlayedAudio = null;  // To track the last played audio

// Function to play the next sound in the queue
function playNextSound() {
    if (soundQueue.length === 0 || isPlaying) return;

    const sound = soundQueue.shift();
    isPlaying = true;
    lastPlayedAudio = sound;  // Track the last played audio

    sound.currentTime = 0;
    sound.play();

    sound.onended = () => {
        isPlaying = false;
        lastPlayedAudio = null;  // Reset after sound ends
        playNextSound();
    };
}

// Function to add a sound to the queue based on conditions
function queueSound(sound) {
    if (lastPlayedAudio === null || lastPlayedAudio !== sound) {
        // If no sound is playing or the current sound is not the same as the last one, queue it
        soundQueue.push(sound);
        playNextSound();
    }
}

// Function to change the color of the cell when it's clicked
function changeCellColor(cell, color) {
    cell.style.backgroundColor = color;  // Change the background color
    setTimeout(() => {
        cell.style.backgroundColor = '';  // Reset the color after a short delay
    }, 500);  // You can adjust this delay to how long you want the color change to last
}

cells.forEach(cell => {
  cell.addEventListener('click', event => {
      // Check if the clicked cell contains a mole (good or bad)
      if (event.target.classList.contains('mole')) {
          score++;
          scoreBoard.textContent = score;
          event.target.classList.remove('mole');

          // Change the cell color to green after it's clicked
          changeCellColor(event.target, 'green');  // Green for good mole

          // Queue the happy sound if not already playing
          queueSound(happySound);

      } else if (event.target.classList.contains('bad-mole')) {
          // Allow the score to go negative if the score is 0
          score -= 1;
          scoreBoard.textContent = score;
          event.target.classList.remove('bad-mole');

          // Change the cell color to red after it's clicked
          changeCellColor(event.target, 'red');  // Red for bad mole

          // Queue the angry sound if not already playing
          queueSound(angrySound);

      } else {
          // If it's an empty cell, change its color to yellow
          changeCellColor(event.target, 'yellow');  // Yellow for empty cell
      }
  });
});


downloadBtn.addEventListener('click', downloadResult);
