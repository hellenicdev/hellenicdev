let paused = false;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const bgImage = new Image();
bgImage.src = 'background.jpg';

const playerImage = new Image();
playerImage.src = 'player.png';

const enemyImage = new Image();
enemyImage.src = 'enemy.png';

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Load sounds
const bgMusic = document.getElementById('bg-music');
const hitSound = document.getElementById('hit-sound');
const spawnSound = document.getElementById('spawn-sound');

// Game objects
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 5,
  moveLeft: false,
  moveRight: false,
  bullets: []
};

let enemies = [];
let score = 0;
let lives = 3;
let gameOver = false;
let started = false;

// Draw functions
function drawBackground() {
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawEnemies() {
  enemies.forEach(e => ctx.drawImage(enemyImage, e.x, e.y, e.width, e.height));
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  player.bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
}

function drawUI() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 30);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '36px Arial';
  ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 20);
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width / 2 - 40, canvas.height / 2 + 20);
  ctx.fillText('Press R to Restart', canvas.width / 2 - 90, canvas.height / 2 + 60);
}

function drawStartScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '28px Arial';
  ctx.fillText('Dodge & Survive', canvas.width / 2 - 100, canvas.height / 2 - 30);
  ctx.font = '20px Arial';
  ctx.fillText('Press Enter or Click to Start', canvas.width / 2 - 110, canvas.height / 2 + 10);
}

// Game logic
function updateEnemies() {
  enemies.forEach(e => e.y += 2);
  enemies = enemies.filter(e => e.y < canvas.height);
}

function updateBullets() {
  player.bullets.forEach(b => b.y -= 8);
  player.bullets = player.bullets.filter(b => b.y > 0);
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + (a.width || 4) > b.x &&
    a.y < b.y + b.height &&
    a.y + (a.height || 10) > b.y
  );
}

function handleCollisions() {
  // Bullet hits enemy
  for (let i = enemies.length - 1; i >= 0; i--) {
    for (let j = player.bullets.length - 1; j >= 0; j--) {
      if (checkCollision(player.bullets[j], enemies[i])) {
        enemies.splice(i, 1);
        player.bullets.splice(j, 1);
        score += 1;
        hitSound.currentTime = 0;
        hitSound.play();
        break;
      }
    }
  }

  // Enemy hits player
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (checkCollision(enemies[i], player)) {
      enemies.splice(i, 1);
      lives -= 1;
      hitSound.currentTime = 0;
      hitSound.play();
      if (lives <= 0) {
        gameOver = true;
        bgMusic.pause();
        bgMusic.currentTime = 0;
      }
    }
  }
}

function shoot() {
  player.bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
  });
}

function createEnemy() {
  const x = Math.random() * (canvas.width - 40);
  enemies.push({ x, y: -40, width: 40, height: 40 });
  spawnSound.currentTime = 0;
  spawnSound.play();
}

function resetGame() {
  enemies = [];
  player.bullets = [];
  score = 0;
  lives = 3;
  gameOver = false;
  player.x = canvas.width / 2 - 20;
  bgMusic.currentTime = 0;
  bgMusic.play();
}

// Game loop
function gameLoop() {
  drawBackground();

  if (!started) {
    drawStartScreen();
    requestAnimationFrame(gameLoop);
    return;
  }

  if (!gameOver) {
    if (player.moveLeft && player.x > 0) player.x -= player.speed;
    if (player.moveRight && player.x + player.width < canvas.width)
      player.x += player.speed;

    updateEnemies();
    updateBullets();
    handleCollisions();

    drawPlayer();
    drawEnemies();
    drawBullets();
    drawUI();
  } else {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') player.moveLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd') player.moveRight = true;
  if (e.key === ' ' && started && !gameOver) shoot();
  if ((e.key === 'Enter' || e.key === ' ') && !started) {
    started = true;
    bgMusic.play();
  }
  if (e.key === 'r' && gameOver) resetGame();
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') player.moveLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd') player.moveRight = false;
});

canvas.addEventListener('click', () => {
  if (!started) {
    started = true;
    bgMusic.play();
  }
});

// Start enemy spawning
setInterval(() => {
  if (started && !gameOver) createEnemy();
}, 1000);

window.onload = gameLoop;
