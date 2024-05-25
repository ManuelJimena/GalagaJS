(function(media) {
    'use strict';

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawPlayer(player) {
        ctx.drawImage(media.images.fighter, player.x, player.y, player.width, player.height);
    }

    function drawBullets(bullets) {
        bullets.forEach(bullet => {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    function drawEnemies(enemies) {
        enemies.forEach(enemy => {
            ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }

    function drawGame(game) {
        drawPlayer(game.player);
        drawBullets(game.bullets);
        drawEnemies(game.enemies);
    }

    window.render = {
        clear: clear,
        drawGame: drawGame
    };
}(media));
