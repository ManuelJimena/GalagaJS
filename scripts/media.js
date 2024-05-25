// scripts/media.js
(function() {
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

    const images = {
        fighter: loadImage('images/Galaga_Fighter.png'),
        missile1: loadImage('images/missile1.png'),
        missile2: loadImage('images/missile2.png'),
        bee1: loadImage('images/bee1.png'),
        bee2: loadImage('images/bee2.png'),
        butterfly1: loadImage('images/butterfly1.png'),
        butterfly2: loadImage('images/butterfly2.png'),
        fullBoss1: loadImage('images/fullBoss1.png'),
        fullBoss2: loadImage('images/fullBoss2.png'),
        halfBoss1: loadImage('images/boss1.png'),
        halfBoss2: loadImage('images/boss2.png'),
        bonus1: loadImage('images/bonus1.png'),
        bonus2: loadImage('images/bonus2.png'),
        bonus3: loadImage('images/bonus3.png'),
        badge1: loadImage('images/badge1.jpg'),
        badge5: loadImage('images/badge5.jpg'),
        badge10: loadImage('images/badge10.jpg'),
        badge20: loadImage('images/badge20.jpg'),
        badge30: loadImage('images/badge30.jpg'),
        badge50: loadImage('images/badge50.jpg'),
        smoke: loadImage('images/smoke.png'),
        fire1: loadImage('images/fire1.png'),
        fire2: loadImage('images/fire2.png'),
        fireBlue: loadImage('images/fireBlue.png'),
        fireGreen: loadImage('images/fireGreen.png')
    };

    function loadSound(src) {
        let sound = new Audio();
        sound.isReady = false;
        sound.addEventListener('canplay', function() { sound.isReady = true; });
        sound.src = src;
        sound.volume = 0.2;
        return sound;
    }

    const sounds = {
        theme: loadSound('sounds/Theme_Song.mp3'),
        missile: loadSound('sounds/Firing_Sound.mp3'),
        diving: loadSound('sounds/Flying_Enemy_Sound.mp3'),
        enemyDeath: loadSound('sounds/Kill_Enemy_Sound.mp3'),
        bossHurt: loadSound('sounds/Boss_Hurt_Sound.mp3'),
        bossDeath: loadSound('sounds/Boss_Death_Sound.mp3'),
        playerDeath: loadSound('sounds/Player_Death.mp3'),
        level: loadSound('sounds/Level_Start.mp3')
    };

    window.media = {
        images: images,
        sounds: sounds
    };
}());
