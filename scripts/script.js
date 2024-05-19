const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const highscoresButton = document.getElementById('highscoresButton');
const backButton = document.getElementById('backButton');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOver');
const highScoresScreen = document.getElementById('highScores');
const restartButton = document.getElementById('restartButton');

const playerImage = new Image();
playerImage.src = 'images/Galaga_Fighter.png';

const beeImage = new Image();
beeImage.src = 'images/bee2.png';
const bossImage = new Image();
bossImage.src = 'images/boss2.png';
const butterflyImage = new Image();
butterflyImage.src = 'images/butterfly2.png';

const enemyImages = [beeImage, bossImage, butterflyImage];

let game = {
    player: {
        x: canvas.width / 2 - 20,
        y: canvas.height - 80,
        width: 40,
        height: 40,
        canShoot: true
    },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    score: 0,
    lives: 3,
    level: 1,
    running: false
};

const shootSound = new Audio('sounds/Firing_Sound.mp3');
const explosionSound = new Audio('sounds/Player_Death.mp3');
const startSound = new Audio('sounds/Theme_Song.mp3');

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

function resetGame() {
    game.player.x = canvas.width / 2 - 20;
    game.player.y = canvas.height - 80;
    game.bullets = [];
    game.enemyBullets = [];
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

highscoresButton.addEventListener('click', () => {
    menu.classList.add('hidden');
    highScoresScreen.classList.remove('hidden');
    LocalScores.persistence.report();
});

backButton.addEventListener('click', () => {
    highScoresScreen.classList.add('hidden');
    menu.classList.remove('hidden');
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

function drawEnemyBullets() {
    game.enemyBullets.forEach((bullet, index) => {
        bullet.y += 10;
        if (bullet.y > canvas.height) {
            game.enemyBullets.splice(index, 1);
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
            const randomImage = enemyImages[Math.floor(Math.random() * enemyImages.length)];
            const isBoss = randomImage === bossImage;
            game.enemies.push({
                x: j * 50,
                y: i * 50,
                width: 40,
                height: 40,
                image: randomImage,
                canShoot: isBoss,
                direction: 1,
                speed: 0.5 + (game.level * 0.05)
            });
        }
    }
}

function enemyShoot(enemy) {
    if (game.enemyBullets.length < 2) {
        game.enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 10,
            color: 'red'
        });
    }
}

function drawEnemies() {
    game.enemies.forEach((enemy) => {
        enemy.x += enemy.direction * 1 * enemy.speed;
        if (enemy.x + enemy.width >= canvas.width || enemy.x <= 0) {
            enemy.direction *= -1;
            enemy.y += 20;
        }
        ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);

        if (enemy.canShoot && Math.random() < 0.01) {
            enemyShoot(enemy);
        }
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

function detectPlayerCollisions() {
    game.enemyBullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < game.player.x + game.player.width &&
            bullet.x + bullet.width > game.player.x &&
            bullet.y < game.player.y + game.player.height &&
            bullet.y + bullet.height > game.player.y) {
            game.enemyBullets.splice(bulletIndex, 1);
            game.lives -= 1;
            if (game.lives === 0) {
                gameOver();
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
    saveScoreValue(game.score);
    gameOverScreen.classList.remove('hidden');
}

function gameWon() {
    game.running = false;
    ctx.fillStyle = 'green';
    ctx.font = '50px Arial';
    ctx.fillText('Has acabado con la amenaza alienígena', canvas.width / 2 - ctx.measureText('Has acabado con la amenaza alienígena').width / 2, canvas.height / 2);
    saveScoreValue(game.score);
    gameOverScreen.classList.remove('hidden');
}

function drawGame() {
    drawPlayer();
    drawBullets();
    drawEnemyBullets();
    drawEnemies();
    detectCollisions();
    detectPlayerCollisions();
    drawScore();
    drawLevel();
    drawLives();
    checkLevel();
}

function gameLoop() {
    if (!game.running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGame();
    requestAnimationFrame(gameLoop);
}

createEnemies();
