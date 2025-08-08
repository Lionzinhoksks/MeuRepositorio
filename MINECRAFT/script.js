  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
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
  const enemy1Speed = 1.5;
  const enemy2Radius = 20;
  const enemy2Speed = 2.5;
  const enemy3Radius = 30;
  const enemy3Speed = 3.5;
  let keys = {};
  let gameOver = false;
  let score = 0;

  function spawnEnemy() {// Spawnar inimigos nas bordas da tela
    let side = Math.floor(Math.random() * 4);
    let x, y;
    switch(side) {
      case 0: // topo
        x = Math.random() * WIDTH;
        y = -enemy1Radius, -enemy2Radius, -enemy3Radius;
        break;
      case 1: // direita
        x = WIDTH + enemy1Radius, enemy2Radius, enemy3Radius;
        y = Math.random() * HEIGHT;
        break;
      case 2: // baixo
        x = Math.random() * WIDTH;
        y = HEIGHT + enemy1Radius, enemy2Radius, enemy3Radius;
        break;
      case 3: // esquerda
        x = -enemy1Radius, -enemy2Radius, -enemy3Radius;
        y = Math.random() * HEIGHT;
        break;
    }

    enemies1.push({
      x,
      y,
      radius: enemy1Radius,
      color: 'red',
      vx: 0,
      vy: 0,
      points: Math.floor(Math.random() * 10) + 1 // Pontos aleatórios de 1 a 10
    });
    
    if (Math.random() < 0.3) {// Alternar entre inimigos de diferentes tamanhos e velocidades
      enemies1[enemies1.length - 1].radius = enemy2Radius;
      enemies1[enemies1.length - 1].vx = Math.random() * enemy2Speed - enemy2Speed / 2;
      enemies1[enemies1.length - 1].vy = Math.random() * enemy2Speed - enemy2Speed / 2;
    } else if (Math.random() < 0.5) {
      enemies1[enemies1.length - 1].radius = enemy3Radius;
      enemies1[enemies1.length - 1].vx = Math.random() * enemy3Speed - enemy3Speed / 2;
      enemies1[enemies1.length - 1].vy = Math.random() * enemy3Speed - enemy3Speed / 2;
    }
  }

  function updateEnemies() {
    enemies1.forEach(enemy => {// Movimentar inimigos em direção ao jogador
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      enemy.vx = (dx / dist) * enemy1Speed;
      enemy.vy = (dy / dist) * enemy1Speed;

      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
    });
  }

  function updateShots() {
    for (let i = shots.length -1; i >= 0; i--) {
      let shot = shots[i];
      shot.x += shot.vx;
      shot.y += shot.vy;
      
      if(shot.x < 0 || shot.x > WIDTH || shot.y < 0 || shot.y > HEIGHT) {// Tirar tiros que saem da tela
        shots.splice(i, 1);
        continue;
      }
      
      for(let j = enemies1.length -1; j >=0; j--) {// Verificar colisão com inimigos
        let enemy = enemies1[j];
        const dx = shot.x - enemy.x;
        const dy = shot.y - enemy.y;
        const dist = Math.sqrt(dx*dx + dy*dy);// Se a distância entre o tiro e o inimigo for menor que a soma dos raios, colidiu

        if(dist < shot.radius + enemy.radius) {
          score += enemy.points;
          document.querySelector('.score').textContent = `Score: ${score}`;
          enemies1.splice(j, 1);
          shots.splice(i, 1);
          break;
        }
      }
    }
  }

  function checkPlayerCollision() {
    for(let enemy of enemies1) {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if(dist < player.radius + enemy.radius) {// Game over!
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'blue';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', WIDTH / 2 - 100, HEIGHT / 2);
        ctx.fillText(`Score: ${score}`, WIDTH / 2 - 80, HEIGHT / 2 + 60);
        ctx.fillText('Press R to Restart', WIDTH / 2 - 150, HEIGHT / 2 + 120);
        document.getElementById('game-over').style.display = 'block';
        document.querySelector('.score').textContent = `Score: ${score}`;
        document.removeEventListener('keydown', restartGame);
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
    drawCircle(player.x, player.y, player.radius, 'cyan');// Desenhar jogador
    shots.forEach(shot => {// Desenhar tiros
      drawCircle(shot.x, shot.y, shot.radius, 'yellow');
    });
    enemies1.forEach(enemy => {// Desenhar inimigos
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
    requestAnimationFrame(gameLoop);// Loop do jogo

  }

  function shoot() {// Atirar
    shots.push({
      x: player.x,
      y: player.y - player.radius,
      vx: 0,
      vy: -shotSpeed,
      radius: shotRadius
    });
  }

  window.addEventListener('keydown', (e) => {// Controle de teclado
    keys[e.key.toLowerCase()] = true;
    if(e.code === 'Space' && !gameOver) {
      shoot();
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });
  setInterval(() => {// Spawnar inimigos a cada 2 segundos
    if(!gameOver) spawnEnemy();
    if(enemies1.length < 5) spawnEnemy(); // Limitar a quantidade de inimigos na tela
  }, 3000);
  gameLoop();// Começa o jogo
