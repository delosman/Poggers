const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const leaderboardList = document.getElementById('leaderboardList');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// Assets
const bgImg = new Image();
bgImg.src = 'road.jpg'; // Replace with your road image URL
const grassImg = new Image();
grassImg.src = 'grass.jpg'; // Replace with your grass image URL
const poggersImg = new Image();
poggersImg.src = 'https://cdn.betterttv.net/emote/58ae8407ff7b7276f8e594f2/3x'; // Poggers
const kappaImg = new Image();
kappaImg.src = 'https://cdn.betterttv.net/emote/5e4f2b12e414d6102f5e6e5b/3x'; // Kappa
const monkaSImg = new Image();
monkaSImg.src = 'https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/3x'; // MonkaS
const triHardImg = new Image();
triHardImg.src = 'https://cdn.betterttv.net/emote/5e4f2b12e414d6102f5e6e5c/3x'; // TriHard
const kreygasmImg = new Image();
kreygasmImg.src = 'https://cdn.betterttv.net/emote/5e4f2b12e414d6102f5e6e5c/3x'; // Kreygasm (placeholder)

const moveSound = new Audio('move.mp3'); // Replace with your sound file
const hitSound = new Audio('hit.mp3');
const levelUpSound = new Audio('levelup.mp3');
const winSound = new Audio('win.mp3');
const startSound = new Audio('start.mp3');

// Game state
let player = { x: 400, y: 550, width: 40, height: 40, speed: 40 };
let score = 0;
let level = 1;
let obstacles = [];
let gameState = 'start';
const maxLevel = 3;

const levels = [
    [
        { img: kappaImg, x: 0, y: 100, width: 40, height: 40, speed: 2 },
        { img: monkaSImg, x: 800, y: 200, width: 40, height: 40, speed: -3 }
    ],
    [
        { img: kappaImg, x: 0, y: 100, width: 40, height: 40, speed: 3 },
        { img: monkaSImg, x: 800, y: 200, width: 40, height: 40, speed: -4 },
        { img: triHardImg, x: 0, y: 300, width: 40, height: 40, speed: 2.5 }
    ],
    [
        { img: kappaImg, x: 0, y: 100, width: 40, height: 40, speed: 4 },
        { img: monkaSImg, x: 800, y: 200, width: 40, height: 40, speed: -5 },
        { img: triHardImg, x: 0, y: 300, width: 40, height: 40, speed: 3 },
        { img: kreygasmImg, x: 800, y: 400, width: 40, height: 40, speed: -4 }
    ]
];

let leaderboard = JSON.parse(localStorage.getItem('poggersLeaderboard')) || [];
function updateLeaderboard() {
    leaderboard.sort((a, b) => b - a);
    leaderboard = leaderboard.slice(0, 5);
    leaderboardList.innerHTML = leaderboard.map(score => `<li>${score}</li>`).join('');
    localStorage.setItem('poggersLeaderboard', JSON.stringify(leaderboard));
}

function startGame() {
    gameState = 'playing';
    startScreen.style.display = 'none';
    startSound.play();
    resetGame();
    gameLoop();
}

function gameOver() {
    gameState = 'over';
    gameOverScreen.style.display = 'block';
    finalScore.textContent = score;
    leaderboard.push(score);
    updateLeaderboard();
}

function resetGame() {
    player.x = 400;
    player.y = 550;
    score = 0;
    level = 1;
    obstacles = levels[0];
}

function update() {
    if (gameState !== 'playing') return;

    obstacles.forEach(obstacle => {
        obstacle.x += obstacle.speed;
        if (obstacle.speed > 0 && obstacle.x > canvas.width) obstacle.x = -obstacle.width;
        if (obstacle.speed < 0 && obstacle.x < -obstacle.width) obstacle.x = canvas.width;
    });

    for (let obstacle of obstacles) {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            hitSound.play();
            gameOver();
            return;
        }
    }

    if (player.y <= 50) {
        score += 100 * level;
        level++;
        if (level > maxLevel) {
            winSound.play();
            alert(`You Win! Final Score: ${score}`);
            gameOver();
            level = 1;
        } else {
            levelUpSound.play();
            alert(`Level ${level - 1} Complete! Score: ${score}`);
            player.y = 550;
            obstacles = levels[level - 1];
        }
    }
}

function draw() {
    if (gameState === 'start' || gameState === 'over') return;

    ctx.drawImage(bgImg, 0, 50, canvas.width, canvas.height - 100);
    ctx.drawImage(grassImg, 0, 0, canvas.width, 50);
    ctx.drawImage(poggersImg, player.x, player.y, player.width, player.height);

    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 10, 60);
}

document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    let moved = false;
    switch (e.key) {
        case 'ArrowUp': if (player.y > 0) { player.y -= player.speed; score += 10; moved = true; } break;
        case 'ArrowDown': if (player.y < canvas.height - player.height) { player.y += player.speed; moved = true; } break;
        case 'ArrowLeft': if (player.x > 0) { player.x -= player.speed; moved = true; } break;
        case 'ArrowRight': if (player.x < canvas.width - player.width) { player.x += player.speed; moved = true; } break;
    }
    if (moved) moveSound.play();
});

canvas.addEventListener('click', () => canvas.focus());
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startGame();
});

updateLeaderboard();