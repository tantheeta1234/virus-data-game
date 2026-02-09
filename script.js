const gameArea = document.getElementById("game-area");
const startBtn = document.getElementById("start-btn");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timerDisplay = document.getElementById("timer");
const collectSound = document.getElementById("collectSound");
const hitSound = document.getElementById("hitSound");
const gameOverSound = document.getElementById("gameOverSound");

let player;
let score = 0;
let lives = 3;
let timeLeft = 60; // 1 minute game
let gameInterval;
let timerInterval;
let spawnInterval;
let isGameRunning = false;
let virusChance = 0.3;


 gameArea.addEventListener("mousemove", (e) => {
    if (!player ||!isGameRunning) return;
    const rect = gameArea.getBoundingClientRect();
    let x = e.clientX - rect.left - player.offsetWidth / 2;
   
    // Keep player inside game area
    if (x < 0) x = 0;
    if (x > rect.width - player.offsetWidth) {
      x=rect.width - player.offsetWidth;
    }
 player.style.left = x + "px";
});

function createPlayer() {
  player = document.createElement("img");
  player.src = "assets/player.png";
  player.id = "player";
  gameArea.appendChild(player);

    player.style.left = (gameArea.offsetWidth / 2 - player.offsetWidth / 2) + "px";
    player.style.bottom = "10px";
  };


startBtn.addEventListener("click", startGame);

function startGame() {
  if (isGameRunning) return;

  isGameRunning = true;
  score = 0;
  lives = 3;
  timeLeft = 60;
  scoreDisplay.textContent = "Data Collected: " + score;
  livesDisplay.textContent = "LIVES: " + lives;
  timerDisplay.textContent = "Time: " + timeLeft;
  gameArea.innerHTML = ""; // clear old objects
  createPlayer();
  startBtn.disabled = true;

  // Spawn objects every 800ms
  spawnInterval = setInterval(spawnObject, 800);

  // Game timer countdown
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = "Time: " + timeLeft;
    if (timeLeft <= 0) {
       endGame();
    }
  }, 1000);
}



// --------------------
// Spawn Data or Virus
// --------------------
// Increase virus chance as time passes
function spawnObject() {
  const obj = document.createElement("img");

  // Increase virus chance as time decreases
  const virusChance = Math.min(0.7, 0.3 + (1 - timeLeft / 60) * 0.4);

  // Randomly choose data or virus
  if (Math.random() < virusChance) {
    obj.src = "assets/virus.png";
    obj.className = "virus";
  } else {
    obj.src = "assets/data.png";
    obj.className = "data";
  }

  // Random horizontal position
  const x = Math.random() * (gameArea.offsetWidth - 40);
  obj.style.left = x + "px";
  obj.style.top = "0px";

  gameArea.appendChild(obj);
  moveObject(obj);
}

// --------------------
// Move falling object
// --------------------
function moveObject(obj) {
  let position = 0;
  const speed = 3 + Math.random() * 2;

  const fallInterval = setInterval(() => {

    // Stop everything if game is over
    if (!isGameRunning) {
      clearInterval(fallInterval);
      obj.remove();
      return;
    }

    position += speed;
    obj.style.top = position + "px";

    // Collision detection
    if (isColliding(obj, player)) {

      // DATA PACKET
      if (obj.className === "data") {
        score++;
        scoreDisplay.textContent = "Data Collected: " + score;
        collectSound.currentTime = 0;
        collectSound.play();
        const rect = obj.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();

        showFloatingScore(
        "+1",
        rect.left - gameRect.left,
        rect.top - gameRect.top,
        "plus"
        );
        

        obj.remove();
        clearInterval(fallInterval);
        return;
      }

      // VIRUS
      if (obj.className === "virus") {
        lives--;
        livesDisplay.textContent = "Firewall: " + lives;
        hitSound.currentTime = 0;
        hitSound.play();
        const rect = obj.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();

        showFloatingScore(
        "-1",
        rect.left - gameRect.left,
        rect.top - gameRect.top,
        "minus"
        );
        if (typeof hitSound !== "undefined") {
          hitSound.currentTime = 0;
          hitSound.play();
        }

        obj.remove();
        clearInterval(fallInterval);

        if (lives <= 0) {
          endGame();
        }

        return;
      }
    }

    // Remove if it falls out of game area
    if (position > gameArea.offsetHeight) {
      obj.remove();
      clearInterval(fallInterval);
    }

  }, 20);
}



// --------------------
// Collision Detection
// --------------------
function isColliding(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  
  return !(
    aRect.top > bRect.bottom ||
    aRect.bottom < bRect.top ||
    aRect.left > bRect.right ||
    aRect.right < bRect.left
  );
}

// --------------------
// End Game
// --------------------
function endGame() {
  isGameRunning = false;
  gameOverSound.currentTime = 0;
  gameOverSound.play();
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  startBtn.disabled = false;

  // Remove all falling objects
  const objects = document.querySelectorAll(".data, .virus");
  objects.forEach((obj) => obj.remove());

  alert("Game Over! Your score: " + score);
}

function showFloatingScore(text, x, y, type) {
  const scoreEl = document.createElement("div");
  scoreEl.textContent = text;
  scoreEl.className = `floating-score ${type}`;

  scoreEl.style.left = x + "px";
  scoreEl.style.top = y + "px";

  gameArea.appendChild(scoreEl);

  setTimeout(() => {
    scoreEl.remove();
  }, 1000);
}
