MyGame.graphics = (function() {
    'use strict';

    let canvas = document.getElementById('id-canvas');
    let ctx = canvas.getContext('2d');
    let blink = true;
    let lastBlinkTime = performance.now();

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawTexture(image, center, rotation, size) {
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(rotation);
        ctx.translate(-center.x, -center.y);
        ctx.drawImage(
            image,
            center.x - size.width / 2,
            center.y - size.height / 2,
            size.width, size.height);
        ctx.restore();
    }

    function drawText(spec) {
        ctx.save();
        ctx.font = spec.font;
        ctx.fillStyle = spec.fillStyle;
        ctx.strokeStyle = spec.strokeStyle;
        ctx.textBaseline = 'top';
        ctx.translate(spec.position.x, spec.position.y);
        ctx.rotate(spec.rotation);
        ctx.translate(-spec.position.x, -spec.position.y);
        ctx.fillText(spec.text, spec.position.x, spec.position.y);
        ctx.strokeText(spec.text, spec.position.x, spec.position.y);
        ctx.restore();
    }

    function drawBackgroundStars(backgroundStars) {
        if (Object.keys(backgroundStars).length !== 0) {
            for (let i = 0; i < backgroundStars.stars.length; i++) {
                let star = backgroundStars.stars[i];
                if (star.sparkle) {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI, false);
                    ctx.fillStyle = "white";
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
    }

    function drawScore(stats) {
        if (blink) {
            drawText({ font: "76px VT323", fillStyle: "red", strokeStyle: "black", position: { x: 50, y: 2 }, rotation: 0, text: "1UP" });
        }
        drawText({ font: "58px VT323", fillStyle: "white", strokeStyle: "white", position: { x: 55, y: 70 }, rotation: 0, text: stats.score });
        drawText({ font: "76px VT323", fillStyle: "hsl(0, 70%, 50%)", strokeStyle: "black", position: { x: canvas.width/2 - 150, y: 2 }, rotation: 0, text: "HIGH SCORE" });
        ctx.font = '42px VT323';
        const width = ctx.measureText(stats.highScore + "").width;
        drawText({ font: "60px VT323", fillStyle: "white", strokeStyle: "white", position: { x: canvas.width/2 - (width/1.5), y: 70 }, rotation: 0, text: stats.highScore });
    }

    function showCurrentStageBeginning(stage) {
        if (stage.showStageTimer > 0) {
            if (stage.currentStage % 4 === 3) {
                drawText({ font: "52px VT323", fillStyle: "#0fe3d3", strokeStyle: "black", position: { x: canvas.width / 2 - 180, y: canvas.height / 2 - 50 }, rotation: 0, text: "BONUS STAGE" });
            } else {
                drawText({ font: "52px VT323", fillStyle: "#0fe3d3", strokeStyle: "black", position: { x: canvas.width / 2 - 70, y: canvas.height / 2 - 50 }, rotation: 0, text: "STAGE " + stage.currentStage });
            }
        }
    }

    function showStats(stats) {
        if (stats.showPlayerStats) {
            drawText({ font: "52px VT323", fillStyle: "#0fe3d3", strokeStyle: "black", position: { x: canvas.width / 2 - 160, y: canvas.height / 2 - 50 }, rotation: 0, text: "NUMBER OF HITS: " + stats.stage.hits });
        } else if (stats.showPlayerResults) {
            drawText({ font: "116px VT323", fillStyle: "white", strokeStyle: "black", position: { x: canvas.width / 2 - 210, y: canvas.height / 2 - 150 }, rotation: 0, text: "GAME OVER" });
        }
    }

    function drawStage(stage) {
        showCurrentStageBeginning(stage);
        if (stage.currentStage < 5) {
            for (let i = 0; i < stage.currentStage; i++) {
                drawTexture(stage.badge1, { x: canvas.width - (i * 32) - 16, y: canvas.height - 32 }, 0, { width: 28, height: 60 });
            }
        } else if (stage.currentStage < 10) {
            for (let i = 0; i < stage.currentStage - 4; i++) {
                if (i === stage.currentStage - 5) {
                    drawTexture(stage.badge5, { x: canvas.width - (i * 32) - 16, y: canvas.height - 30 }, 0, { width: 28, height: 56 });
                } else {
                    drawTexture(stage.badge1, { x: canvas.width - (i * 32) - 16, y: canvas.height - 26 }, 0, { width: 28, height: 48 });
                }
            }
        } else if (stage.currentStage < 20) {
            drawTexture(stage.badge10, { x: canvas.width - 30, y: canvas.height - 30 }, 0, { width: 52, height: 56 });
        } else {
            drawTexture(stage.badge20, { x: canvas.width - 34, y: canvas.height - 34 }, 0, { width: 60, height: 64 });
        }
    }

    function drawLives(fighter) {
        if (fighter.lives === 3) {
            drawTexture(fighter.img, { x: fighter.size.width / 2 + 10, y: canvas.height - fighter.size.height / 2 - 5 }, 0, fighter.size);
            drawTexture(fighter.img, { x: fighter.size.width * 1.5 + 15, y: canvas.height - fighter.size.height / 2 - 5 }, 0, fighter.size);
        } else if (fighter.lives === 2) {
            drawTexture(fighter.img, { x: fighter.size.width / 2 + 10, y: canvas.height - fighter.size.height / 2 - 5 }, 0, fighter.size);
        }
    }

    function drawEnemy(enemies, enemy) {
        let type = enemy.type;
        if (enemies[type].images[0].isReady) {
            let rotation = 0;
            let sprite = enemy.currentSprite;
            if (enemy.path.length === 0 && !enemy.diving) {
                sprite = enemies.formationSprite;
            }
            let size = enemies[type].size;
            if (sprite === 1) {
                size = enemies[type].size2;
            }
            if (type === "boss" && enemy.life === 1) {
                sprite += 2;
            }
            if (enemy.path.length > 0 && enemy.path[0].length === 3) {
                rotation = enemy.path[0][2] * Math.PI / 180;
            } else if (enemy.path.length === 0 && enemy.diving) {
                rotation = 180 * Math.PI / 180;
            }
            drawTexture(enemies[type].images[sprite], enemy.center, rotation, size);
        }
    }

    function drawEnemies(enemies) {
        for (let i = 0; i < enemies.enemy.length; i++) {
            drawEnemy(enemies, enemies.enemy[i]);
        }
    }

    function drawFighter(fighter) {
        if (fighter.img.isReady && !fighter.dead) {
            drawTexture(fighter.img, fighter.center, 0, fighter.size);
        }
    }

    function drawMissiles(missiles) {
        if (missiles.img1.isReady) {
            for (let i = 0; i < missiles.friendly.length; i++) {
                let t = missiles.friendly[i];
                drawTexture(missiles.img1, t.center, 0, missiles.size);
            }
        }
        if (missiles.img2.isReady) {
            for (let i = 0; i < missiles.enemy.length; i++) {
                let t = missiles.enemy[i];
                let size = { width: missiles.size.width * 1.2, height: missiles.size.height * 1.2 };
                drawTexture(missiles.img2, t.center, 180 * Math.PI / 180, size);
            }
        }
    }

    function drawExplosions(explosions) {
        for (let i in explosions.explosion) {
            let p = explosions.explosion[i];
            let image = null;
            if (p.image === 'fire1') {
                image = explosions.imgFire1;
            } else if (p.image === 'fire2') {
                image = explosions.imgFire2;
            } else if (p.image === 'smoke') {
                image = explosions.imgSmoke;
            } else if (p.image === "fireBlue") {
                image = explosions.imgFireBlue;
            } else if (p.image === "fireGreen") {
                image = explosions.imgFireGreen;
            }
            if (image !== null && image.isReady) {
                drawTexture(image, p.center, p.rotation, p.size);
            }
        }
    }

    function updateBlink(elapsedTime) {
        let currentTime = performance.now();
        if (currentTime - lastBlinkTime > 500) {
            blink = !blink;
            lastBlinkTime = currentTime;
        }
    }

    let api = {
        get canvas() { return canvas; },
        clear: clear,
        drawTexture: drawTexture,
        drawText: drawText,
        drawBackgroundStars: drawBackgroundStars,
        drawScore: drawScore,
        drawStage: drawStage,
        drawLives: drawLives,
        drawEnemies: drawEnemies,
        drawFighter: drawFighter,
        drawMissiles: drawMissiles,
        drawExplosions: drawExplosions,
        showStats: showStats,
        updateBlink: updateBlink
    };

    return api;
}());

function gameLoop(time) {
    MyGame.graphics.clear();
    MyGame.graphics.updateBlink(time);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
