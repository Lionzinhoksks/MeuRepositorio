/* Script do Jogo */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wiidth = canvas.width;
const heiight = canvas.height;

/* Variáveis e Constantes */

// Player
const player = {
    x: wiidth / 2,
    y: heiight / 2,
    raio: 15,
    speed: 3.75,
    color: 'cyan',
    vx: 0,
    vy: 0,
};

// Inimigos e Tiro
const tiros = [];
const velocidadeTiro = 8;
const raioTiro = 5;
const inimigos = [];
const inimigo1raio = 15;
const inimigo2raio = 25;
const inimigo3raio = 40;
const inimigo1velocidade = 0.75;
const inimigo2velocidade = 1.5;
const inimigo3velocidade = 2.5;

let keys = {};
let gameOver = false;
let score = 0;
let animacaoId = null;
let intervaloSpawnId = null;

/* Funções do Jogo */

function começarJogo() {
    document.getElementById('startPopUp').classList.add('active');
    document.getElementById('gameOverPopUp').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.querySelector('.score').style.display = 'block';
    score = 0;
    inimigos.length = 0;
    tiro.length = 0;
    player.x = wiidth / 2;
    player.y = heiight / 2;
    gameOver = false;
    document.querySelector('.score').textContent = `Score: ${score}`;
    intervaloInicialSpawn();
    jogoLoop();
}

function criainimigo() {
    let side = Math.floor(Math.random() * 4);
    let x, y;
    switch (side) {
        case 0: Math.random() < 0.5 ? (x = 0, y = Math.random() * heiight) : (x = wiidth, y = Math.random() * heiight); break; // Esquerda ou Direita
        case 1: Math.random() < 0.5 ? (x = Math.random() * wiidth, y = 0) : (x = Math.random() * wiidth, y = heiight); break; // Cima ou Baixo
    }

    let raio = inimigo1raio, type = 1;
    if (Math.random() < 0.35) {
        raio = inimigo2raio; type = 2;
    } else if (Math.random() < 0.55) {
        raio = inimigo3raio; type = 3;
    }

        inimigos.push({
        x, y, raio, type, vx: 0, vy: 0, points: Math.floor(Math.random() * 10) + 1,
        frameTick: 0, animacaoFrame: 0, spriteFrame: 0
    });
}

function atualizaInimigos() {
    inimigos.forEach(inimigo => {
        const dx = player.x - inimigo.x;
        const dy = player.y - inimigo.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        let velocidade = inimigo1velocidade;
        if (inimigo.type === 2) velocidade = inimigo2velocidade;
        if (inimigo.type === 3) velocidade = inimigo3velocidade;
        inimigo.vx = (dx / distancia) * velocidade;
        inimigo.vy = (dy / distancia) * velocidade;
        inimigo.x += inimigo.vx;
        inimigo.y += inimigo.vy;
    });
}

function atualizaTiros() {
    for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];
        tiro.x += tiro.vx;
        tiro.y += tiro.vy;

        if (tiro.x < 0 || tiro.x > wiidth || tiro.y < 0 || tiro.y > heiight) {
            tiros.splice(i, 1);
            continue;
        }

        for (let j = inimigos.length - 1; j >= 0; j--) {
            const inimigo = inimigos[j];
            const dx = tiro.x - inimigo.x;
            const dy = tiro.y - inimigo.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            if (distancia < inimigo.raio + raioTiro) {
                score += inimigo.points;
                document.querySelector('.score').textContent = `Score: ${score}`;
                inimigos.splice(j, 1);
                tiros.splice(i, 1);
                break;
            }
        }
    }
}

function checkColisãoPlayer() {
    for (let inimigo of inimigos) {
        const dx = player .x - inimigo.x;
        const dy = player.y - inimigo.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        if (distancia < player.radius + inimigo.raio) {
            gameOver = true;
            document.getElementById('gameOverPopUp').style.display = 'flex';
            document.querySelector('.score').textContent = `Score: ${score}`;
            document.getElementById('game').style.display = 'none';
            document.querySelector('.score').style.display = 'none';
        }
    }
}

function movimentaçãoPlayer() {
    if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
    if (player.x < player.raio) player.x = player.raio;
    if (player.x > wiidth - player.raio) player.x = wiidth - player.raio;
    if (player.y < player.raio) player.y = player.raio;
    if (player.y > heiight - player.raio) player.y = heiight - player.raio;
}

function desenha() {
    ctx.clearRect(0, 0, wiidth, heiight);
    criacirculos(player.x, player.y, player.raio, player.color);
    tiros.forEach(tiro => {
        criacirculos(tiro.x, tiro.y, raioTiro, 'yellow');
    });
    inimigos.forEach(inimigo => {
        let color = 'red';
        criaCirculos(inimigo.x, inimigo.y, inimigo.raio, color);
    });
}