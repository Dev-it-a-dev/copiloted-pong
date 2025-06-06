const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PADDLE_MARGIN = 18;

let playerPaddle = {
  x: PADDLE_MARGIN,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT
};

let aiPaddle = {
  x: canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 4
};

let ball = {
  x: canvas.width / 2 - BALL_SIZE / 2,
  y: canvas.height / 2 - BALL_SIZE / 2,
  size: BALL_SIZE,
  speedX: Math.random() > 0.5 ? 5 : -5,
  speedY: (Math.random() - 0.5) * 7
};

function resetBall() {
  ball.x = canvas.width / 2 - BALL_SIZE / 2;
  ball.y = canvas.height / 2 - BALL_SIZE / 2;
  ball.speedX = Math.random() > 0.5 ? 5 : -5;
  ball.speedY = (Math.random() - 0.5) * 7;
}

function drawRect(obj) {
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x + BALL_SIZE/2, ball.y + BALL_SIZE/2, BALL_SIZE/2, 0, Math.PI * 2);
  ctx.fill();
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function moveAIPaddle() {
  // Simple AI: follow the ball, but not perfectly
  let targetY = ball.y + ball.size / 2 - aiPaddle.height / 2;
  if (aiPaddle.y < targetY) {
    aiPaddle.y += aiPaddle.speed;
    if (aiPaddle.y > targetY) aiPaddle.y = targetY;
  } else if (aiPaddle.y > targetY) {
    aiPaddle.y -= aiPaddle.speed;
    if (aiPaddle.y < targetY) aiPaddle.y = targetY;
  }
  // Clamp to canvas
  aiPaddle.y = Math.max(0, Math.min(canvas.height - aiPaddle.height, aiPaddle.y));
}

function updateBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Top and bottom wall collision
  if (ball.y < 0) {
    ball.y = 0;
    ball.speedY *= -1;
  } else if (ball.y + ball.size > canvas.height) {
    ball.y = canvas.height - ball.size;
    ball.speedY *= -1;
  }

  // Paddle collision (left/player)
  if (
    ball.x <= playerPaddle.x + playerPaddle.width &&
    ball.y + ball.size >= playerPaddle.y &&
    ball.y <= playerPaddle.y + playerPaddle.height &&
    ball.x > playerPaddle.x
  ) {
    ball.x = playerPaddle.x + playerPaddle.width;
    ball.speedX *= -1;
    // Add some vertical speed based on where it hit the paddle
    let hitPos = (ball.y + ball.size/2) - (playerPaddle.y + playerPaddle.height/2);
    ball.speedY = hitPos * 0.25;
  }

  // Paddle collision (right/AI)
  if (
    ball.x + ball.size >= aiPaddle.x &&
    ball.y + ball.size >= aiPaddle.y &&
    ball.y <= aiPaddle.y + aiPaddle.height &&
    ball.x < aiPaddle.x + aiPaddle.width
  ) {
    ball.x = aiPaddle.x - ball.size;
    ball.speedX *= -1;
    let hitPos = (ball.y + ball.size/2) - (aiPaddle.y + aiPaddle.height/2);
    ball.speedY = hitPos * 0.25;
  }

  // Left or right wall (score)
  if (ball.x < 0 || ball.x + ball.size > canvas.width) {
    resetBall();
  }
}

function draw() {
  clear();
  ctx.fillStyle = "#fff";
  drawRect(playerPaddle);
  drawRect(aiPaddle);
  drawBall();
}

function gameLoop() {
  moveAIPaddle();
  updateBall();
  draw();
  requestAnimationFrame(gameLoop);
}

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerPaddle.y = mouseY - playerPaddle.height / 2;
  // Clamp to canvas
  playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, playerPaddle.y));
});

// Start game
gameLoop();
