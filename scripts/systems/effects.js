MyGame.effects = (function() {
    'use strict';

    function loadImage(src) {
        let img = new Image();
        img.isReady = false;
        img.onload = function() {
            this.isReady = true;
        };
        img.src = src;
        return img;
    }

    function loadImages() {
        return {
            fighter: loadImage('./images/Galaga_Fighter.png'),
            missile1: loadImage('./images/missile1.png'),
            missile2: loadImage('./images/missile2.png'),
            bee1: loadImage('./images/bee1.png'),
            bee2: loadImage('./images/bee2.png'),
            butterfly1: loadImage('./images/butterfly1.png'),
            butterfly2: loadImage('./images/butterfly2.png'),
            fullBoss1: loadImage('./images/fullBoss1.png'),
            fullBoss2: loadImage('./images/fullBoss2.png'),
            halfBoss1: loadImage('./images/boss1.png'),
            halfBoss2: loadImage('./images/boss2.png'),
            bonus1: loadImage('./images/bonus1.png'),
            bonus2: loadImage('./images/bonus2.png'),
            bonus3: loadImage('./images/bonus3.png'),
            badge1: loadImage('./images/badge1.jpg'),
            badge5: loadImage('./images/badge5.jpg'),
            badge10: loadImage('./images/badge10.jpg'),
            badge20: loadImage('./images/badge20.jpg'),
            badge30: loadImage('./images/badge30.jpg'),
            badge50: loadImage('./images/badge50.jpg'),
            smoke: loadImage('./images/smoke.png'),
            fire1: loadImage('./images/fire1.png'),
            fire2: loadImage('./images/fire2.png'),
            fireBlue: loadImage('./images/fireBlue.png'),
            fireGreen: loadImage('./images/fireGreen.png')
        };
    }

    function loadSound(src) {
        let sound = new Audio();
        sound.isReady = false;
        sound.addEventListener('canplay', function() { sound.isReady = true; });
        sound.src = src;
        sound.volume = 0.2;
        return sound;
    }

    function loadSounds() {
        return {
            theme: loadSound('./sounds/Theme_Song.mp3'),
            missile: loadSound('./sounds/Firing_Sound.mp3'),
            diving: loadSound('./sounds/Flying_Enemy_Sound.mp3'),
            enemyDeath: loadSound('./sounds/Kill_Enemy_Sound.mp3'),
            bossHurt: loadSound('./sounds/Boss_Hurt_Sound.mp3'),
            bossDeath: loadSound('./sounds/Boss_Death_Sound.mp3'),
            playerDeath: loadSound('./sounds/Player_Death.mp3'),
            level: loadSound('./sounds/Level_Start.mp3')
        };
    }

    function createExplosions() {
        function createEnemyDeathExplosions(explosions, enemies, enemy) {
            let explosion = {
                size: { mean: 7, stdev: 3 },
                speed: { mean: 200, stdev: 50 },
                lifetime: { mean: 350, stdev: 100 }
            };

            function createExplosions(image, count) {
                for (let i = 0; i < count; i++) {
                    let x = getRandomInt(enemy.center.x - enemies[enemy.type].size.width / 2, enemy.center.x + enemies[enemy.type].size.width / 2);
                    let y = getRandomInt(enemy.center.y - enemies[enemy.type].size.height / 2, enemy.center.y + enemies[enemy.type].size.height / 2);
                    let size = nextGaussian(explosion.size.mean, explosion.size.stdev);
                    explosions.explosion.push({
                        center: { x: x, y: y },
                        size: { width: size, height: size },
                        direction: nextCircleVector(),
                        speed: nextGaussian(explosion.speed.mean, explosion.speed.stdev),
                        rotation: 0,
                        lifetime: nextGaussian(explosion.lifetime.mean, explosion.lifetime.stdev),
                        alive: 0,
                        image: image
                    });
                }
            }

            createExplosions("fire1", 20);
            createExplosions("fire2", 20);
            createExplosions("smoke", 20);
        }

        function createPlayerDeathExplosions(fighter, explosions) {
            let explosion = {
                size: { mean: 8, stdev: 5 },
                speed: { mean: 150, stdev: 50 },
                lifetime: { mean: 1000, stdev: 200 }
            };

            function createExplosions(image, count) {
                for (let i = 0; i < count; i++) {
                    let x = getRandomInt(fighter.center.x - fighter.size.width / 2 - 15, fighter.center.x + fighter.size.width / 2 + 15);
                    let y = getRandomInt(fighter.center.y - fighter.size.height / 2 + 5, fighter.center.y + fighter.size.height / 2 + 15);
                    explosions.explosion.push({
                        center: { x: x, y: y },
                        size: { width: nextGaussian(explosion.size.mean, explosion.size.stdev), height: nextGaussian(explosion.size.mean, explosion.size.stdev) },
                        direction: nextCircleVectorPositive(),
                        speed: nextGaussian(explosion.speed.mean, explosion.speed.stdev),
                        rotation: 0,
                        lifetime: nextGaussian(explosion.lifetime.mean, explosion.lifetime.stdev),
                        alive: 0,
                        image: image
                    });
                }
            }

            createExplosions("fireBlue", 60);
            createExplosions("fireGreen", 30);
            createExplosions("fire2", 30);
            createExplosions("smoke", 50);
        }

        function updateExplosions(explosions, elapsedTime) {
            let remove = [];

            for (let i = 0; i < explosions.length; i++) {
                let explosion = explosions[i];
                explosion.alive += elapsedTime;
                explosion.center.x += (elapsedTime / 1000 * explosion.speed * explosion.direction.x);
                explosion.center.y += (elapsedTime / 1000 * explosion.speed * explosion.direction.y);
                explosion.rotation += explosion.speed / 500;

                if (explosion.alive > explosion.lifetime) {
                    remove.push(i);
                }
            }
            for (let i = remove.length - 1; i > -1; i--) {
                explosions.splice(remove[i], 1);
            }
            remove.length = 0;
        }

        return {
            createEnemyDeathExplosions,
            createPlayerDeathExplosions,
            updateExplosions
        };
    }

    return {
        loadImages: loadImages,
        loadSounds: loadSounds,
        explosions: createExplosions()
    };
}());
