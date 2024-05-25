"use strict";

function updateTime(elapsedTime, stats, fighter) {
    stats.currentTime += elapsedTime;
    stats.stage.stageTime += elapsedTime;
    stats.stage.showStageTimer -= elapsedTime;

    if (fighter.invulnerableTimer > 0) {
        fighter.invulnerableTimer -= elapsedTime;
    } else if (fighter.dead) {
        fighter.deadTimer -= elapsedTime;
        if (fighter.deadTimer < 0 && fighter.lives > 0) {
            fighter.invulnerableTimer = 1000;
            fighter.dead = false;
        }
    }
    if (stats.showPlayerResults === true) {
        stats.endGameTimer -= elapsedTime;
    }
}

function updateBackgroundStars(elapsedTime, backgroundStars) {
    if (Object.keys(backgroundStars).length !== 0) {
        let canvas = document.getElementById('id-canvas');
        let remove = [];
        for (let i = 0; i < backgroundStars.stars.length; i++) {
            let star = backgroundStars.stars[i];
            star.y += canvas.height * (elapsedTime / 4000);
            if (Math.random() < 0.01) {
                star.sparkle = !star.sparkle;
            }
            if (star.y > canvas.height) {
                remove.push(i);
            }
        }
        for (let i = remove.length-1; i > -1; i--) {
            backgroundStars.stars.splice(remove[i], 1);
        }
        
        let createNewStar = Math.random() < elapsedTime / 50;
        if (createNewStar) {
            backgroundStars.stars.push( { x: getRandomInt(5, canvas.width-5), y: 0, r: getRandomInt(1, 7)/2, sparkle: true })
        }
    }
}

function spawnEnemies(stats, enemies) {
    let stageEnemies = stats.stage.stageEnemies;
    if (stageEnemies.length > 0) {
        let remove = [];
        for (let i = 0; i < stageEnemies.length; i++) {
            if (stageEnemies[i].time < stats.stage.stageTime) {
                for (let j = 0; j < stageEnemies[i].enemy.length; j++) {
                    enemies.enemy.push(stageEnemies[i].enemy[j]);
                }
                remove.push(i);
            }
        }
        for (let i = remove.length-1; i > -1; i--) {
            stageEnemies.splice(remove[i], 1);
        }
    }
}

function updateEnemy(elapsedTime, enemy, stats, enemies, missiles, fighter) {
    if (enemy.path.length !== 0 && (enemy.type === "bee" || enemy.type === "butterfly" || enemy.type === "boss")) {
        enemy.spriteCount -= elapsedTime;
        if (enemy.spriteCount < 0) {
            if (enemy.currentSprite === 0) {
                enemy.currentSprite = 1;
            } else if (enemy.currentSprite === 1) {
                enemy.currentSprite = 0;
            }
            enemy.spriteCount = 400;
        }
    } else if (enemy.path.length === 0 && !enemy.diving) {
        enemy.currentSprite = enemies.formationSprite;
    }

    if (enemy.fireTimer > 0) {
        enemy.fireTimer -= elapsedTime;
        if (enemy.fireTimer <= 0) {
            fireEnemyMissile(enemy, missiles, fighter, elapsedTime);
        } 
    }

    if (enemy.path.length !== 0) {
        let speed = elapsedTime * (1+(stats.stage.currentStage/30));
        if (enemy.diving) {
            speed /= 2;
        }
        while (enemy.path.length !== 0 && speed !== 0) {
            let d = distance(enemy.center.x, enemy.center.y, enemy.path[0][0], enemy.path[0][1]);
            if (speed < d) {
                enemy.center = pointAtDistance(enemy.center.x, enemy.center.y, enemy.path[0][0], enemy.path[0][1], speed);
                speed = 0;
            } else {
                enemy.center = { x: enemy.path[0][0], y: enemy.path[0][1] }
                enemy.path.splice(0, 1);
                speed -= d;
            }
        }
        if (enemy.path.length === 1 && !enemy.diving) {
            enemy.path.push([enemy.formationLocation[0] + enemies.formationOffsetX, enemy.formationLocation[1]])
        }
    } else if (enemy.path.length === 0 && enemy.diving) {
        enemy.path = getDivePath(enemy);
    }

    else if (enemies.formationLeftRight > 0) {
        enemy.center.x = enemy.formationLocation[0] + enemies.formationOffsetX;
    } else if (enemies.formationLeftRight === 0) {
        let diffX = enemy.formationLocation[0] - 600;
        enemy.center.x = diffX * enemies.formationOffsetBreath + 600;
        let diffY = enemy.formationLocation[1] - 200;
        enemy.center.y = diffY * enemies.formationOffsetBreath + 200;
    }
}

function updateEnemyFormation(elapsedTime, enemies) {
    enemies.formationSpriteCount -= elapsedTime;
    if (enemies.formationSpriteCount < 0) {
        if (enemies.formationSprite === 0) {
            enemies.formationSprite = 1;
        } else if (enemies.formationSprite === 1) {
            enemies.formationSprite = 0;
        }
        enemies.formationSpriteCount = 500;
    }
    let speed = elapsedTime / 30;
    if (enemies.formationLeftRight > 0) {
        if (enemies.formationLeftRight % 2 === 0) {
            enemies.formationOffsetX += speed;
        } else {
            enemies.formationOffsetX -= speed;
        }
        if (enemies.formationOffsetX > 100) {
            enemies.formationOffsetX = 100;
            enemies.formationLeftRight -= 1;
        } else if (enemies.formationOffsetX < -100) {
            enemies.formationOffsetX = -100;
            enemies.formationLeftRight -= 1;
        } else if (enemies.formationLeftRight === 1 && enemies.formationOffsetX < 0) {
            enemies.formationOffsetX = 0;
            enemies.formationLeftRight = 0;
        }
    } else if (enemies.formationLeftRight === 0) {
        if (enemies.formationBreathOut) {
            enemies.formationOffsetBreath += speed / 250;
            if (enemies.formationOffsetBreath > 1.2) {
                enemies.formationBreathOut = false;
            }
        } else {
            enemies.formationOffsetBreath -= speed / 250;
            if (enemies.formationOffsetBreath < 1) {
                enemies.formationBreathOut = true;
            }
        }
    }
}

function updateEnemies(elapsedTime, enemies, stats, missiles, fighter, sound, effects) {
    updateEnemyFormation(elapsedTime, enemies);
    spawnEnemies(stats, enemies);
    for (let i = 0; i < enemies.enemy.length; i++) {
        updateEnemy(elapsedTime, enemies.enemy[i], stats, enemies, missiles, fighter);
    }
    enemyDiving(elapsedTime, enemies, stats, sound, effects);
}

function enemyDiving(elapsedTime, enemies, stats, sound, effects) {
    if (stats.stage.currentStage % 4 !== 3) {
        enemies.divingTimer -= elapsedTime;
    }
    if (enemies.divingTimer < 0) {
        let availableEnemies = [];
        for (let i = 0; i < enemies.enemy.length; i++) {
            let enemy = enemies.enemy[i];
            if (!enemy.diving && enemy.path.length === 0) {
                availableEnemies.push(enemy);
            }
        }
        if (availableEnemies.length > 1) {
            let a = getRandomInt(0, availableEnemies.length);
            let b = getRandomInt(0, availableEnemies.length);
            availableEnemies[a].path = getDivePath(availableEnemies[a]);
            availableEnemies[b].path = getDivePath(availableEnemies[b]);
            availableEnemies[a].fireTimer = 1000;
            availableEnemies[b].fireTimer = 1000;
            if (sound.diving.isReady) {
                sound.diving.play();
            }
        } else if (availableEnemies.length === 1) {
            availableEnemies[0].path = getDivePath(availableEnemies[0]);
            availableEnemies[0].fireTimer = 1000;
            if (sound.diving.isReady) {
                sound.diving.play();
            }
        }
        enemies.divingTimer = 3000;
    }
}

function updateMissiles(elapsedTime, missiles) {
    let canvas = document.getElementById('id-canvas');
    let speed = elapsedTime / 800 * canvas.height;

    let removeFriendly = [];
    for (let i = 0; i < missiles.friendly.length; i++) {
        let t = missiles.friendly[i];
        t.center.y -= speed;
        if (t.center.y < 0) {
            removeFriendly.push(i);
        }
    }
    for (let i = removeFriendly.length-1; i > -1; i--) {
        missiles.friendly.splice(removeFriendly[i], 1);
    }

    let removeEnemy = [];
    for (let i = 0; i < missiles.enemy.length; i++) {
        let t = missiles.enemy[i];
        t.center.y += speed * 2 / 5;
        t.center.x += t.xVel;
        if (t.center.y > canvas.height) {
            removeEnemy.push(i);
        }
    }
    for (let i = removeEnemy.length-1; i > -1; i--) {
        missiles.enemy.splice(removeEnemy[i], 1);
    }
}

function fireEnemyMissile(enemy, missiles, fighter, elapsedTime) {
    let canvas = document.getElementById("id-canvas");
    let xVel = 0;
    if (fighter.center.x < enemy.center.x) {
        xVel = -1 * elapsedTime / 800 / 15 * canvas.height;
    } else {
        xVel = elapsedTime / 800 / 15 * canvas.height;
    }
    missiles.enemy.push({ center: { x: enemy.center.x, y: enemy.center.y }, xVel: xVel });
}

function fireMissile(fighter, missiles, stats, sound) {
    if (!fighter.dead && (missiles.noLimit || missiles.friendly.length < 2)) {
        missiles.friendly.push({ center: { x: fighter.center.x, y: fighter.center.y } });
        stats.stage.missilesFired++;
        if (sound.fireMissile[sound.fireMissileQueue].isReady) {
            sound.fireMissile[sound.fireMissileQueue].play();
            sound.fireMissileQueue++;
            if (sound.fireMissileQueue > 9) {
                sound.fireMissileQueue = 0;
            }
        }
    }
}

function moveFighterLeft(fighter, value) {
    fighter.center.x -= 8 * value;
    if (fighter.center.x < fighter.size.width / 2) {
        fighter.center.x = fighter.size.width / 2;
    }
}

function moveFighterRight(fighter, value) {
    let canvas = document.getElementById('id-canvas');
    fighter.center.x += 8 * value;
    if (fighter.center.x + fighter.size.width / 2 > canvas.width) {
        fighter.center.x = canvas.width - fighter.size.width / 2;
    }
}

function checkCollisions(missiles, fighter, enemies, stats, explosions, sound, effects) {
    if (fighter.invulnerableTimer <= 0 && !fighter.dead) {
        checkFighterCollision(missiles, fighter, enemies, explosions, sound, effects);
    }
    checkEnemyCollision(missiles, enemies, stats, explosions, sound, effects);
}

function checkFighterCollision(missiles, fighter, enemies, explosions, sound, effects) {
    let enemyMissiles = missiles.enemy;
    let removeMissile = [];
    for (let i = 0; i < enemyMissiles.length; i++) {
        let t = enemyMissiles[i];
        let f = fighter;
        if (t.center.x < f.center.x + f.size.width / 2 && t.center.x > f.center.x - f.size.width / 2 &&
            t.center.y + missiles.size.height / 2 < f.center.y + f.size.height / 2 && t.center.y + missiles.size.height / 2 > f.center.y - f.size.height / 2 + 20) {
            if (!removeMissile.includes(i)) {
                removeMissile.push(i);
            }
            effects.explosions.createPlayerDeathExplosions(fighter, explosions);
            loseLife(fighter);
            if (sound.playerDeath.isReady) {
                sound.playerDeath.play();
            }
        }
    }
    for (let i = removeMissile.length-1; i > -1; i--) {
        enemyMissiles.splice(removeMissile[i], 1);
    }

    let removeEnemy = [];
    for (let i = 0; i < enemies.enemy.length; i++) {
        let e = enemies.enemy[i];
        if (e.center.x < fighter.center.x + fighter.size.width / 2 + 20 && e.center.x > fighter.center.x - fighter.size.width / 2 - 20 &&
            e.center.y < fighter.center.y + fighter.size.height / 2 + 30 && e.center.y > fighter.center.y - fighter.size.height / 2) {
            effects.explosions.createPlayerDeathExplosions(fighter, explosions);
            loseLife(fighter);
            effects.explosions.createEnemyDeathExplosions(explosions, enemies, e);
            if (sound.playerDeath.isReady) {
                sound.playerDeath.play();
            }
            removeEnemy.push(i);
        }
    }
    for (let i = removeEnemy.length-1; i > -1; i--) {
        enemies.enemy.splice(removeEnemy[i], 1);
    }
}

function checkEnemyCollision(missiles, enemies, stats, explosions, sound, effects) {
    let friendlyMissiles = missiles.friendly;
    let removeMissile = [];
    let removeEnemy = [];
    for (let i = 0; i < friendlyMissiles.length; i++) {
        let t = friendlyMissiles[i];
        for (let j = 0; j < enemies.enemy.length; j++) {
            let e = enemies.enemy[j];
            if (t.center.x < e.center.x + enemies[e.type].size.width / 2 + 6 && t.center.x > e.center.x - enemies[e.type].size.width / 2 - 6 &&
                t.center.y - missiles.size.height / 2 < e.center.y + enemies[e.type].size.height / 2 && t.center.y - missiles.size.height / 2 > e.center.y - enemies[e.type].size.height / 2) {
                
                if (!removeMissile.includes(i)) {
                    removeMissile.push(i);
                }
                if (!removeEnemy.includes(j)) {
                    if (e.type === "boss" && e.life === 2) {
                        e.life--;
                        if (sound.bossHurt.isReady) {
                            sound.bossHurt.play();
                        }
                    } else {
                        removeEnemy.push(j);
                        addScore(stats, e);
                        effects.explosions.createEnemyDeathExplosions(explosions, enemies, e);
                        if (e.type === "boss" && sound.bossDeath.isReady) {
                            sound.bossDeath.play();
                        } else if (sound.enemyDeath.isReady) {
                            sound.enemyDeath.play();
                        }
                    }
                }
                stats.stage.hits++;
            }
        }
    }
    for (let i = removeMissile.length-1; i > -1; i--) {
        friendlyMissiles.splice(removeMissile[i], 1);
    }
    for (let i = removeEnemy.length-1; i > -1; i--) {
        enemies.enemy.splice(removeEnemy[i], 1);
    }
}

function loseLife(fighter) {
    fighter.lives--;
    fighter.dead = true;
    fighter.deadTimer = 2000;
}

function addScore(stats, enemy) {
    if (enemy.type === "bee" && !enemy.diving) {
        stats.score += 50;
    } else if (enemy.type === "bee" && enemy.diving) {
        stats.score += 100;
    } else if (enemy.type === "butterfly" && !enemy.diving) {
        stats.score += 80;
    } else if (enemy.type === "butterfly" && enemy.diving) {
        stats.score += 160;
    } else if (enemy.type === "bonus1" || enemy.type === "bonus2" || enemy.type === "bonus3") {
        stats.score += 100;
    } else if (enemy.type === "boss" && !enemy.diving) {
        stats.score += 150;
    } else if (enemy.type === "boss" && enemy.diving) {
        stats.score += 400;
    }
}

function checkEndStage(enemies, stats, fighter, elapsedTime, sound, effects) {
    if (fighter.lives === 0 && fighter.deadTimer <= 0 && !stats.showPlayerResults) {
        stats.totalMissilesFired += stats.stage.missilesFired;
        stats.totalHits += stats.stage.hits;
        stats.showPlayerResults = true;
    } else if (stats.stage.stageEnemies.length === 0 && enemies.enemy.length === 0 && fighter.lives > 0) {
        if (!stats.stage.endStage) {
            if (stats.stage.currentStage % 4 === 3) {
                stats.stage.endStageTimer = 2000;
                stats.showPlayerStats = true;
            } else {
                stats.stage.endStageTimer = 500;
            }
            stats.totalMissilesFired += stats.stage.missilesFired;
            stats.totalHits += stats.stage.hits;
            stats.stage.endStage = true;
        } else {
            stats.stage.endStageTimer -= elapsedTime;
            if (stats.stage.endStageTimer < 0) {
                stats.showPlayerStats = false;
                stats.stage.endStage = false;
                stats.stage.currentStage += 1;
                stats.stage.showStageTimer = 2000;
                stats.stage.missilesFired = 0;
                stats.stage.hits = 0;
                stats.stage.stageTime = 0;
                stats.stage.stageEnemies = getStage(stats.stage.currentStage);
                enemies.divingTimer = 15000;
                enemies.formationSpriteCount = 500;
                enemies.formationLeftRight = 4;
                enemies.formationOffsetX = 0;
                enemies.formationOffsetBreath = 1;
                enemies.formationBreathOut = true;
                if (sound.levelStart.isReady) {
                    sound.levelStart.play();
                }
            }
        }
    } else if (stats.stage.currentStage % 4 === 3 && stats.stage.stageTime > 17000) {
        enemies.enemy = [];
    }
}

function updateAI(elapsedTime, ai, fighter, enemies, missiles, stats, sound) {
    let moveSpeed = elapsedTime / 2;

    ai.fireTimer -= elapsedTime;
    if (ai.fireTimer < 0 && enemies.enemy.length !== 0) {
        ai.fireTimer = 200;
        fireMissile(fighter, missiles, stats, sound);
    }

    if (enemies.enemy.length !== 0) {
        let e = enemies.enemy[0];
        if (e.center.x < fighter.center.x) {
            fighter.center.x -= moveSpeed;
        } else if (e.center.x > fighter.center.x) {
            fighter.center.x += moveSpeed;
        }
    }
}

function mobileSupport(fighter, missiles, stats, sound) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.getElementById("game").style.height = "130vw";
        document.getElementById("game").style.width = "98vw";
        document.getElementById("game").style.margin = "4vh 0 4vh 0";
        let mobileControls = document.getElementById("mobile-controls");
        mobileControls.style.visibility = "visible";
        var slider = document.getElementById("mobile-movement");
        var start;
        slider.addEventListener("touchstart", function(event) {
            start = event.touches[0].clientX;
        });

        slider.addEventListener("touchmove", function(event) {
            var current = event.touches[0].clientX;
            var delta = current - start;
            var value = parseInt(slider.value) + delta;
            if (value < slider.min) {
                value = slider.min;
            } else if (value > slider.max) {
                value = slider.max;
            }
            slider.value = value;
            start = current;
        });

        slider.addEventListener("input", function() {
            fighter.mobileMoveVal = slider.value;
        });

        slider.addEventListener("touchend", function(event) {
            slider.value = 50;
            fighter.mobileMoveVal = 50;
        });

        let fireButton = document.getElementById("mobile-fire");
        fireButton.addEventListener("touchstart", function(event) {
            if (stats.currentTime > 0) {
                fireMissile(fighter, missiles, stats, sound);
            }
        });
    } 
}

function updateFighterMobile(elapsedTime, fighter) {
    if (fighter.mobileMoveVal < 50) {
        moveFighterLeft(fighter, (1 - (fighter.mobileMoveVal / 50)) * elapsedTime / 6);
    } else if (fighter.mobileMoveVal > 50) {
        moveFighterRight(fighter, ((fighter.mobileMoveVal - 50) / 50) * elapsedTime / 6);
    }
}
