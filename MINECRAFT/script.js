  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  // Jogador
  const player = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: 15,
    speed: 4,
    color: 'cyan',
    vx: 0,
    vy: 0,
  };
  // Tiros do jogador
  const shots = [];
  const shotSpeed = 8;
  const shotRadius = 5;
  // Inimigos
  const enemies = [];
  const enemyRadius = 15;
  const enemySpeed = 1.5;

  let keys = {};
  let gameOver = false;

  function spawnEnemy() {
    // Spawnar inimigos nas bordas da tela
    let side = Math.floor(Math.random() * 4);
    let x, y;
    switch(side) {
      case 0: // topo
        x = Math.random() * WIDTH;
        y = -enemyRadius;
        break;
      case 1: // direita
        x = WIDTH + enemyRadius;
        y = Math.random() * HEIGHT;
        break;
      case 2: // baixo
        x = Math.random() * WIDTH;
        y = HEIGHT + enemyRadius;
        break;
      case 3: // esquerda
        x = -enemyRadius;
        y = Math.random() * HEIGHT;
        break;
    }

    enemies.push({
      x,
      y,
      radius: enemyRadius,
      color: 'red',
      vx: 0,
      vy: 0,
    });
  }

  function updateEnemies() {
    enemies.forEach(enemy => {
      // Movimentar inimigos em direção ao jogador
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      enemy.vx = (dx / dist) * enemySpeed;
      enemy.vy = (dy / dist) * enemySpeed;

      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
    });
  }

  function updateShots() {
    for (let i = shots.length -1; i >= 0; i--) {
      let shot = shots[i];
      shot.x += shot.vx;
      shot.y += shot.vy;

      // Tirar tiros que saem da tela
      if(shot.x < 0 || shot.x > WIDTH || shot.y < 0 || shot.y > HEIGHT) {
        shots.splice(i, 1);
        continue;
      }

      // Verificar colisão com inimigos
      for(let j = enemies.length -1; j >=0; j--) {
        let enemy = enemies[j];
        const dx = shot.x - enemy.x;
        const dy = shot.y - enemy.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < shot.radius + enemy.radius) {
          // Tiro acerta inimigo, removemos ambos
          enemies.splice(j, 1);
          shots.splice(i, 1);
          break;
        }
      }
    }
  }

  function checkPlayerCollision() {
    for(let enemy of enemies) {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if(dist < player.radius + enemy.radius) {
        // Game over!
        gameOver = true;
        document.getElementById('game-over').style.display = 'block';
      }
    }
  }

  function updatePlayer() {
    if(keys['ArrowUp'] || keys['w']) player.y -= player.speed;
    if(keys['ArrowDown'] || keys['s']) player.y += player.speed;
    if(keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if(keys['ArrowRight'] || keys['d']) player.x += player.speed;

    // Limitar dentro da tela
    if(player.x < player.radius) player.x = player.radius;
    if(player.x > WIDTH - player.radius) player.x = WIDTH - player.radius;
    if(player.y < player.radius) player.y = player.radius;
    if(player.y > HEIGHT - player.radius) player.y = HEIGHT - player.radius;
  }

  function drawCircle(x, y, r, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Desenhar jogador
    drawCircle(player.x, player.y, player.radius, 'cyan');

    // Desenhar tiros
    shots.forEach(shot => {
      drawCircle(shot.x, shot.y, shot.radius, 'yellow');
    });

    // Desenhar inimigos
    enemies.forEach(enemy => {
      drawCircle(enemy.x, enemy.y, enemy.radius, 'red');
    });
  }

  function gameLoop() {
    if(gameOver) return;

    updatePlayer();
    updateEnemies();
    updateShots();
    checkPlayerCollision();
    draw();

    requestAnimationFrame(gameLoop);
  }

  // Atirar
  function shoot() {
    shots.push({
      x: player.x,
      y: player.y - player.radius,
      vx: 0,
      vy: -shotSpeed,
      radius: shotRadius
    });
  }

  // Controle de teclado
  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    if(e.code === 'Space' && !gameOver) {
      shoot();
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // Spawnar inimigos a cada 2 segundos
  setInterval(() => {
    if(!gameOver) spawnEnemy();
  }, 2500);

  // Começa o jogo
  gameLoop();

  // Atualiza a pontuação
  setInterval(() => {
    if(!gameOver) {
      score++;
      document.querySelector('.score').textContent = `Score: ${score}`;
    }

  }, 1000);
  
