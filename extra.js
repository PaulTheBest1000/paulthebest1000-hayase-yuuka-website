document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const menu = document.querySelector(".menu");

    // Toggle menu visibility on mobile
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            menu.classList.toggle("active");
            console.log("Menu toggled");
        });
    } else {
        console.log("Elements not found!");
    }

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
});

const cells = document.querySelectorAll('.cell');
const scoreBoard = document.getElementById('score');
const easyBtn = document.getElementById('easy-btn');
const normalBtn = document.getElementById('normal-btn');
const hardBtn = document.getElementById('hard-btn');
const timerDisplay = document.getElementById('timer');
const playerNameInput = document.getElementById('player-name');
const gameResultSection = document.getElementById('game-result');
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
let timeLeft = 150;

const images = [
  "IMG_2432.GIF", // low score
  "IMG_2490.GIF", // mid-low score
  "IMG_2487.GIF", // mid-high score
  "IMG_3422.GIF"  // high score
];

function getRandomCell() {
  return Math.floor(Math.random() * cells.length);
}

function showWeasel() {
    // Clear previous moles
    cells.forEach(cell => cell.classList.remove('mole', 'bad-mole'));
    currentCellIndex = null;

    // Decide if good mole appears (e.g., 20% chance)
    const goodAppears = Math.random() < 0.2;

    // Decide if bad mole appears (e.g., 15% chance)
    const badAppears = Math.random() < 0.15;

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
  timeLeft = 150;
  gameResultSection.style.display = 'none';

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

  const playerName = playerNameInput.value || "Anonymous";
  let resultImageSrc = images[0]; // Default to low score

  if (score >= 30) {
      resultImageSrc = images[3]; // High score
  } else if (score >= 20) {
      resultImageSrc = images[2]; // Mid-high
  } else if (score >= 10) {
      resultImageSrc = images[1]; // Mid-low
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

  let results = JSON.parse(localStorage.getItem('gameResults')) || [];
  results.push(resultData);
  localStorage.setItem('gameResults', JSON.stringify(results));

  displayResults();
}

function setDifficulty(difficulty) {
  switch (difficulty) {
    case 'easy': timeInterval = 1000; break;
    case 'normal': timeInterval = 750; break;
    case 'hard': timeInterval = 500; break;
    default: timeInterval = 1000;
  }

  if (gameStarted) {
    clearInterval(moleTimer);
    moleTimer = setInterval(showWeasel, timeInterval);
  }
}

function displayResults() {
  const results = JSON.parse(localStorage.getItem('gameResults')) || [];
  resultsContainer.innerHTML = '';
  results.forEach(result => {
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('result-item');
    resultDiv.innerHTML = `
      <p><strong>${result.name}</strong> scored ${result.score} points</p>
      <img src="${result.image}" alt="${result.name}'s Result">
      <p>${new Date(result.timestamp).toLocaleString()}</p>
    `;
    resultsContainer.appendChild(resultDiv);
  });
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

cells.forEach(cell => {
    cell.addEventListener('click', event => {
        if (event.target.classList.contains('mole')) {
            score++;
            scoreBoard.textContent = score;
            event.target.classList.remove('mole');
            happySound.currentTime = 0;
            happySound.play();
        } else if (event.target.classList.contains('bad-mole')) {
            score = Math.max(0, score - 1);
            scoreBoard.textContent = score;
            event.target.classList.remove('bad-mole');
            angrySound.currentTime = 0;
            angrySound.play();
        }
    });
});


downloadBtn.addEventListener('click', downloadResult);
