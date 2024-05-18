const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');

const playerImage = new Image();
playerImage.src = 'images/PlayerShip.png';

let game = {
    player: {
        x: canvas.width / 2 - 20,
        y: canvas.height - 80,
        width: 40,
        height: 40,
        canShoot: true
    },
    bullets: [],
    enemies: [],
    score: 0,
    lives: 3,
    level: 1,
    running: false
};

const shootSound = new Audio('sounds/shoot.mp3');
const explosionSound = new Audio('sounds/explosion.mp3');
const startSound = new Audio('sounds/start.mp3');

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

function resetGame() {
    game.player.x = canvas.width / 2 - 20;
    game.player.y = canvas.height - 80;
    game.bullets = [];
    game.enemies = [];
    game.score = 0;
    game.lives = 3;
    game.level = 1;
    createEnemies();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetGame();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

startButton.addEventListener('click', () => {
    menu.classList.add('hidden');
    game.running = true;
    playSound(startSound);
    resetGame();
    gameLoop();
});

restartButton.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    menu.classList.remove('hidden');
});

document.addEventListener('keydown', (event) => {
    if (!game.running) return;
    const key = event.key;
    if (key === 'ArrowLeft' && game.player.x > 0) {
        game.player.x -= 10;
    } else if (key === 'ArrowRight' && game.player.x < canvas.width - game.player.width) {
        game.player.x += 10;
    } else if (key === ' ' && game.player.canShoot) {
        game.bullets.push({
            x: game.player.x + game.player.width / 2 - 2,
            y: game.player.y,
            width: 4,
            height: 10,
            color: 'yellow'
        });
        game.player.canShoot = false;
        playSound(shootSound);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === ' ') {
        game.player.canShoot = true;
    }
});

function drawPlayer() {
    ctx.drawImage(playerImage, game.player.x, game.player.y, game.player.width, game.player.height);
}

function drawBullets() {
    game.bullets.forEach((bullet, index) => {
        bullet.y -= 10;
        if (bullet.y < 0) {
            game.bullets.splice(index, 1);
        } else {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    });
}

function createEnemies() {
    game.enemies = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 10; j++) {
            game.enemies.push({
                x: j * 50,
                y: i * 50,
                width: 40,
                height: 40,
                color: 'blue',
                direction: 1,
                speed: 0.5 + (game.level * 0.05)
            });
        }
    }
}

function drawEnemies() {
    game.enemies.forEach((enemy) => {
        enemy.x += enemy.direction * 1 * enemy.speed;
        if (enemy.x + enemy.width >= canvas.width || enemy.x <= 0) {
            enemy.direction *= -1;
            enemy.y += 20;
        }
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function detectCollisions() {
    game.bullets.forEach((bullet, bulletIndex) => {
        game.enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                game.bullets.splice(bulletIndex, 1);
                game.enemies.splice(enemyIndex, 1);
                game.score += 100;
                playSound(explosionSound);
            }
        });
    });

    game.enemies.forEach((enemy, enemyIndex) => {
        if (game.player.x < enemy.x + enemy.width &&
            game.player.x + game.player.width > enemy.x &&
            game.player.y < enemy.y + enemy.height &&
            game.player.y + game.player.height > enemy.y) {
            game.lives -= 1;
            if (game.lives === 0) {
                gameOver();
            } else {
                resetEnemies();
            }
        }
    });
}

function drawScore() {
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText('Score', canvas.width / 2 - ctx.measureText('Score').width / 2, 20);

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(game.score, canvas.width / 2 - ctx.measureText(game.score.toString()).width / 2, 50);
}

function drawLevel() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Level: ' + game.level, canvas.width - 100, canvas.height - 20);
}

function drawLives() {
    for (let i = 0; i < game.lives; i++) {
        ctx.drawImage(playerImage, 10 + (i * 50), canvas.height - 70, game.player.width, game.player.height);
    }
}

function checkLevel() {
    if (game.enemies.length === 0) {
        if (game.level === 50) {
            gameWon();
        } else {
            game.level++;
            createEnemies();
        }
    }
}

function resetEnemies() {
    game.enemies = [];
    createEnemies();
    game.player.x = canvas.width / 2 - 20;
    game.player.y = canvas.height - 80;
}

function gameOver() {
    game.running = false;
    ctx.fillStyle = 'red';
    ctx.font = '50px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - ctx.measureText('Game Over').width / 2, canvas.height / 2);
    gameOverScreen.classList.remove('hidden');
}

function gameWon() {
    game.running = false;
    ctx.fillStyle = 'green';
    ctx.font = '50px Arial';
    ctx.fillText('Has acabado con la amenaza alienígena', canvas.width / 2 - ctx.measureText('Has acabado con la amenaza alienígena').width / 2, canvas.height / 2);
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    if (!game.running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGame();
    requestAnimationFrame(gameLoop);
}

function drawGame() {
    drawPlayer();
    drawBullets();
    drawEnemies();
    detectCollisions();
    drawScore();
    drawLevel();
    drawLives();
    checkLevel();
}

createEnemies();
