const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Sprite dos inimigos
const enemySprite = new Image();
enemySprite.src = 'Images/MongSprite.png'; // Caminho relativo ao index.html

const ENEMY_FRAMES = 12;
const ENEMY_WIDTH = 640;
const ENEMY_HEIGHT = 640;

// Player
const player = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: 15,
  speed: 4,
  color: 'cyan',
  vx: 0,
  vy: 0,
};

const shots = [];
const shotSpeed = 8;
const shotRadius = 5;
const enemies1 = [];
const enemy1Radius = 15;
const enemy2Radius = 25;
const enemy3Radius = 40;
const enemy1Speed = 1.5;
const enemy2Speed = 2.5;
const enemy3Speed = 3.5;

let keys = {};
let gameOver = false;
let score = 0;
let animationId = null;
let spawnIntervalId = null;

// Cria inimigos com tamanho e tipo aleatório
function spawnEnemy() {
  let side = Math.floor(Math.random() * 4);
  let x, y;
  switch (side) {
    case 0: x = Math.random() * WIDTH; y = -enemy1Radius; break; // topo
    case 1: x = WIDTH + enemy1Radius; y = Math.random() * HEIGHT; break; // direita
    case 2: x = Math.random() * WIDTH; y = HEIGHT + enemy1Radius; break; // baixo
    case 3: x = -enemy1Radius; y = Math.random() * HEIGHT; break; // esquerda
  }

  let radius = enemy1Radius, type = 1;
  if (Math.random() < 0.3) {
    radius = enemy2Radius; type = 2;
  } else if (Math.random() < 0.5) {
    radius = enemy3Radius; type = 3;
  }

  enemies1.push({
    x,
    y,
    radius,
    type, // 1, 2 ou 3
    vx: 0,
    vy: 0,
    points: Math.floor(Math.random() * 10) + 1,
    frameTick: 0,
    animFrame: 0,
    spriteFrame: 0
  });
}

// Atualiza posição e animação dos inimigos
function updateEnemies() {
  enemies1.forEach(enemy => {
    // Movimento em direção ao player
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let speed = enemy1Speed;
    if (enemy.type === 2) speed = enemy2Speed;
    if (enemy.type === 3) speed = enemy3Speed;
    enemy.vx = (dx / dist) * speed;
    enemy.vy = (dy / dist) * speed;
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    // Direção do sprite
    let direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }
    let baseFrame = 0;
    switch (direction) {
      case 'down': baseFrame = 0; break;
      case 'left': baseFrame = 3; break;
      case 'right': baseFrame = 6; break;
      case 'up': baseFrame = 9; break;
    }
    enemy.frameTick++;
    if (enemy.frameTick > 7) {
      enemy.animFrame = (enemy.animFrame + 1) % 3;
      enemy.frameTick = 0;
    }
    enemy.spriteFrame = baseFrame + enemy.animFrame;
  });
}

// Atualiza tiros e verifica colisão com inimigos
function updateShots() {
  for (let i = shots.length - 1; i >= 0; i--) {
    let shot = shots[i];
    shot.x += shot.vx;
    shot.y += shot.vy;
    if (shot.x < 0 || shot.x > WIDTH || shot.y < 0 || shot.y > HEIGHT) {
      shots.splice(i, 1);
      continue;
    }
    for (let j = enemies1.length - 1; j >= 0; j--) {
      let enemy = enemies1[j];
      const dx = shot.x - enemy.x;
      const dy = shot.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < shot.radius + enemy.radius) {
        score += enemy.points;
        document.querySelector('.score').textContent = `Score: ${score}`;
        enemies1.splice(j, 1);
        shots.splice(i, 1);
        break;
      }
    }
  }
}

// Verifica colisão do player com inimigos
function checkPlayerCollision() {
  for (let enemy of enemies1) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.radius + enemy.radius) {
      gameOver = true;
      document.getElementById('gameOverPopup').style.display = 'flex';
      document.getElementById('finalScore').textContent = `Score: ${score}`;
      document.getElementById('game').style.display = 'none';
      document.querySelector('.score').style.display = 'none';
      document.querySelector('h1').style.display = 'none';
      break;
    }
  }
}

// Atualiza posição do player
function updatePlayer() {
  if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
  if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
  if (player.x < player.radius) player.x = player.radius;
  if (player.x > WIDTH - player.radius) player.x = WIDTH - player.radius;
  if (player.y < player.radius) player.y = player.radius;
  if (player.y > HEIGHT - player.radius) player.y = HEIGHT - player.radius;
}

// Desenha um círculo (player e tiros)
function drawCircle(x, y, r, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Desenha tudo na tela
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawCircle(player.x, player.y, player.radius, 'cyan');
  shots.forEach(shot => {
    drawCircle(shot.x, shot.y, shot.radius, 'yellow');
  });
  enemies1.forEach(enemy => {
    ctx.drawImage(
      enemySprite,
      enemy.spriteFrame * ENEMY_WIDTH, 0, ENEMY_WIDTH, ENEMY_HEIGHT,
      enemy.x - enemy.radius, enemy.y - enemy.radius, enemy.radius * 2, enemy.radius * 2
    );
  });
}

// Cria um tiro
function shoot() {
  shots.push({
    x: player.x,
    y: player.y - player.radius,
    vx: 0,
    vy: -shotSpeed,
    radius: shotRadius
  });
}

// Controles do teclado
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === 'Space' && !gameOver) {
    shoot();
    e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Intervalo para spawnar inimigos
function startSpawnInterval() {
  if (spawnIntervalId) clearInterval(spawnIntervalId);
  spawnIntervalId = setInterval(() => {
    if (!gameOver) spawnEnemy();
    if (enemies1.length < 5) spawnEnemy();
  }, 3000);
}

// Reinicia o jogo
function restartGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (spawnIntervalId) {
    clearInterval(spawnIntervalId);
    spawnIntervalId = null;
  }
  player.x = WIDTH / 2;
  player.y = HEIGHT / 2;
  score = 0;
  enemies1.length = 0;
  shots.length = 0;
  gameOver = false;
  document.querySelector('.score').textContent = `Score: ${score}`;
  document.getElementById('gameOverPopup').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.querySelector('.score').style.display = 'block';
  document.querySelector('h1').style.display = 'block';
  startSpawnInterval();
  gameLoop();
}

// Loop principal do jogo
function gameLoop() {
  if (gameOver) return;
  updatePlayer();
  updateEnemies();
  updateShots();
  checkPlayerCollision();
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

// Inicia o jogo após carregar o sprite
enemySprite.onload = () => {
  startSpawnInterval();
  gameLoop();
};
