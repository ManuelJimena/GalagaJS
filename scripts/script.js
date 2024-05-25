const canvas = document.getElementById('gameCanvas');
const startButton = document.getElementById('startButton');
const highscoresButton = document.getElementById('highscoresButton');
const backButton = document.getElementById('backButton');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOver');
const highScoresScreen = document.getElementById('highScores');
const restartButton = document.getElementById('restartButton');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.logic.resetGame();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

startButton.addEventListener('click', () => {
    menu.classList.add('hidden');
    window.logic.resetGame();
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

function gameLoop() {
    window.render.clear();
    window.logic.updateGame();
    window.render.drawGame(window.logic.game);
    requestAnimationFrame(gameLoop);
}
