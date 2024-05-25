(function(media, input) {
    'use strict';

    const game = {
        player: {
            x: 0,
            y: 0,
            width: 40,
            height: 40,
            speed: 5,
            canShoot: true
        },
        bullets: [],
        enemies: [],
        score: 0,
        lives: 3
    };

    function resetGame() {
        game.player.x = canvas.width / 2 - game.player.width / 2;
        game.player.y = canvas.height - game.player.height - 20;
        game.bullets = [];
        game.enemies = [];
        game.score = 0;
        game.lives = 3;
        createEnemies();
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
                    image: media.images.bee1,
                    canShoot: Math.random() < 0.1
                });
            }
        }
    }

    function movePlayer() {
        if (input.isKeyPressed('ArrowLeft') && game.player.x > 0) {
            game.player.x -= game.player.speed;
        } else if (input.isKeyPressed('ArrowRight') && game.player.x < canvas.width - game.player.width) {
            game.player.x += game.player.speed;
        }
    }

    function shoot() {
        if (input.isKeyPressed(' ') && game.player.canShoot) {
            game.bullets.push({
                x: game.player.x + game.player.width / 2 - 2,
                y: game.player.y,
                width: 4,
                height: 10
            });
            game.player.canShoot = false;
            media.sounds.missile.play();
        }
    }

    function updateBullets() {
        game.bullets = game.bullets.filter(bullet => bullet.y > 0);
        game.bullets.forEach(bullet => bullet.y -= 10);
    }

    function updateEnemies() {
        game.enemies.forEach(enemy => {
            enemy.y += 1;
        });
        game.enemies = game.enemies.filter(enemy => enemy.y < canvas.height);
    }

    function checkCollisions() {
        
    }

    function updateGame() {
        movePlayer();
        shoot();
        updateBullets();
        updateEnemies();
        checkCollisions();
    }

    window.logic = {
        resetGame: resetGame,
        updateGame: updateGame,
        game: game
    };
}(media, window.input));
