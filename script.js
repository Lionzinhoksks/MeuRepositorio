const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const player = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: 15,
  speed: 3.50,
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
const enemy1Speed = 0.75;
const enemy2Speed = 1.25;
const enemy3Speed = 2.25;
const items = [];
const shieldRadius = 50;

let keys = {};
let gameOver = false;
let score = 0;
let animationId = null;
let spawnIntervalId = null;
let shieldActive = false;
let shieldDuration = 0;
let shieldMaxDuration = 300; // 5 segundos (300 frames a 60fps)

function criaInimigo() {
  let side = Math.floor(Math.random() * 4);
  let x, y;
  switch (side) {
    case 0: x = Math.random() * WIDTH; y = -enemy1Radius; break; 
    case 1: x = WIDTH + enemy1Radius; y = Math.random() * HEIGHT; break; 
    case 2: x = Math.random() * WIDTH; y = HEIGHT + enemy1Radius; break; 
    case 3: x = -enemy1Radius; y = Math.random() * HEIGHT; break; 
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
    type, 
    vx: 0,
    vy: 0,
    points: Math.floor(Math.random() * 10) + 1,
    frameTick: 0,
    animFrame: 0,
    spriteFrame: 0
  });
}

function atualizaInimigos() {
  enemies1.forEach(enemy => {
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
  });
}

function atualizaTiros() {
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

function criaItem(x, y, type = 'shield') {
  items.push({
    x,
    y,
    radius: 10,
    type,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  });
}

function atualizaItems() {
  for (let i = items.length - 1; i >= 0; i--) {
    let item = items[i];
    item.x += item.vx;
    item.y += item.vy;
    
    // Verifica colisão com o player
    const dx = player.x - item.x;
    const dy = player.y - item.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < player.radius + item.radius) {
      if (item.type === 'shield') {
        shieldActive = true;
        shieldDuration = shieldMaxDuration;
      }
      items.splice(i, 1);
      continue;
    }
    
    // Remove items que saem da tela
    if (item.x < -20 || item.x > WIDTH + 20 || item.y < -20 || item.y > HEIGHT + 20) {
      items.splice(i, 1);
    }
  }
}

function atualizaEscudo() {
  if (shieldActive) {
    shieldDuration--;
    if (shieldDuration <= 0) {
      shieldActive = false;
    }
  }
}

function checkColisãodoPlayer() {
  for (let enemy of enemies1) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.radius + enemy.radius) {
      if (shieldActive) {
        // Escudo absorve o dano
        shieldActive = false;
        // Remove o inimigo que colidiu com o escudo
        const index = enemies1.indexOf(enemy);
        if (index > -1) enemies1.splice(index, 1);
      } else {
        gameOver = true;
        document.querySelector('.gameoverContainer').style.display = 'flex';
        document.getElementById('finalScore').textContent = `Score: ${score}`;
        document.getElementById('game').style.display = 'none';
        document.querySelector('.score').style.display = 'none';
      }
    }
  }
}

function movimentaPlayer() {
  if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
  if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
  if (player.x < player.radius) player.x = player.radius;
  if (player.x > WIDTH - player.radius) player.x = WIDTH - player.radius;
  if (player.y < player.radius) player.y = player.radius;
  if (player.y > HEIGHT - player.radius) player.y = HEIGHT - player.radius;
}

function criaCirculos(x, y, r, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function cria() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  // Desenha o escudo se ativo
  if (shieldActive) {
    const alpha = shieldDuration / shieldMaxDuration;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.6})`;
    ctx.lineWidth = 3;
    ctx.arc(player.x, player.y, shieldRadius, 0, Math.PI * 2);
    ctx.stroke();
    
  }
  
  criaCirculos(player.x, player.y, player.radius, 'cyan');
  
  shots.forEach(shot => {
    criaCirculos(shot.x, shot.y, shot.radius, 'yellow');
  });
  
  items.forEach(item => {
    if (item.type === 'shield') {
      // Desenha o item de escudo com animação
      const pulse = Math.sin(Date.now() / 200) * 3;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.arc(item.x, item.y, item.radius + pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Desenha um quadrado interno
      ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
      ctx.fillRect(item.x - item.radius / 2, item.y - item.radius / 2, item.radius, item.radius);
    }
  });
  
  enemies1.forEach(enemy => {
    let color = 'red';
    if (enemy.type === 2) color = 'red';
    if (enemy.type === 3) color = 'red';
    criaCirculos(enemy.x, enemy.y, enemy.radius, color);
  });
}

function shoot() {
  shots.push({
    x: player.x,
    y: player.y - player.radius,
    vx: 0,
    vy: -shotSpeed,
    radius: shotRadius
  });
}

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

function startSpawnInterval() {
  if (spawnIntervalId) clearInterval(spawnIntervalId);
  spawnIntervalId = setInterval(() => {
    if (!gameOver) {
      criaInimigo();
      // 30% de chance de criar um item de escudo
      if (Math.random() < 0.3) {
        const x = Math.random() * WIDTH;
        const y = Math.random() * HEIGHT;
        criaItem(x, y, 'shield');
      }
    }
    if (enemies1.length < 5) criaInimigo();
  }, 2650);
}

function começarJogo() {
    document.querySelector('.startContainer').classList.remove('active')
    document.querySelector('.gameoverContainer').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.querySelector('.score').style.display = 'block';
    score = 0;
    enemies1.length = 0;
    shots.length = 0;
    items.length = 0;
    player.x = WIDTH / 2;
    player.y = HEIGHT / 2;
    gameOver = false;
    shieldActive = false;
    shieldDuration = 0;
    document.querySelector('.score').textContent = `Score: ${score}`;
    startSpawnInterval();
    jogoLoop();
}

function resetaJogo() {
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
    items.length = 0;
    gameOver = false;
    shieldActive = false;
    shieldDuration = 0;
    document.querySelector('.score').textContent = `Score: ${score}`;
    document.querySelector('.gameoverContainer').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.querySelector('.score').style.display = 'block';
    startSpawnInterval();
    jogoLoop();
}

function jogoLoop() {
    if (gameOver) return;
    movimentaPlayer();
    atualizaInimigos();
    atualizaTiros();
    atualizaItems();
    atualizaEscudo();
    checkColisãodoPlayer();
    cria();
    animationId = requestAnimationFrame(jogoLoop);
}
window.onload = () => {
    document.querySelector('.startContainer').classList.add('active');
    document.getElementById('game').style.display = 'none';
    document.querySelector('.score').style.display = 'none';
    document.querySelector('.titleContainer').style.display = 'block';
};
