MyGame.screens['game-play'] = (function(game, input, graphics, effects, LocalScores) {
    'use strict';

    let canvas = document.getElementById('id-canvas');
    let lastTimeStamp = performance.now();
    let cancelNextRequest = true;
    let quit = false;
    let myKeyboard = input.Keyboard();
    let backgroundStars = {};
    let fighter = {};
    let enemies = {};
    let missiles = {};
    let stats = {};
    let explosions = {};
    let sound = {};
    let slider = document.getElementById('mobile-movement');
    let sliderRange = 25;

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }

    function update(elapsedTime) {
        updateTime(elapsedTime, stats, fighter);
        if (fighter.lives !== 0) {
            updateBackgroundStars(elapsedTime, backgroundStars);
            updateEnemies(elapsedTime, enemies, stats, missiles, fighter, sound, effects);
            updateMissiles(elapsedTime, missiles);
            updateFighterMobile(elapsedTime, fighter);
        }
        checkCollisions(missiles, fighter, enemies, stats, explosions, sound, effects);
        effects.explosions.updateExplosions(explosions.explosion, elapsedTime);
        checkEndStage(enemies, stats, fighter, elapsedTime, sound, effects);
        if (fighter.lives === 0 && stats.endGameTimer <= 0) {
            endGame();
        }
    }

    function render() {
        graphics.clear();
        graphics.drawBackgroundStars(backgroundStars);
        graphics.drawScore(stats);
        graphics.drawLives(fighter);
        graphics.drawStage(stats.stage);
        graphics.drawEnemies(enemies);
        graphics.drawFighter(fighter);
        graphics.drawMissiles(missiles);
        graphics.drawExplosions(explosions);
       

graphics.showStats(stats);
}

function gameLoop(time) {
    let elapsedTime = time - lastTimeStamp;
    lastTimeStamp = time;

    processInput(elapsedTime);
    update(elapsedTime);
    render();

    if (!cancelNextRequest) {
        requestAnimationFrame(gameLoop);
    }
}

function initialize() {
    backgroundStars = { stars: [] };

    fighter = {
        lives: 3,
        img: effects.loadImages().fighter,
        center: { x: 600, y: 1470 },
        size: { width: 80, height: 80 },
        dead: false,
        deadTimer: 0,
        invulnerableTimer: 1000,
        speed: 300,
        mobileMoveVal: 50
    };

    missiles = {
        friendly: [],
        enemy: [],
        img1: effects.loadImages().missile1,
        img2: effects.loadImages().missile2,
        size: { width: 15, height: 40 },
        noLimit: true
    };

    stats = {
        score: 0,
        totalMissilesFired: 0,
        totalHits: 0,
        currentTime: 0,
        showPlayerStats: false,
        showPlayerResults: false,
        endGameTimer: 5000,
        highScore: LocalScores.persistence.getHighScore()
    };

    stats.stage = {
        currentStage: 1,
        stageTime: 0,
        showStageTimer: 5000,
        missilesFired: 0,
        hits: 0,
        endingStage: false,
        endingStageTimer: 500,
        stageEnemies: getStage(1),
        badge1: effects.loadImages().badge1,
        badge5: effects.loadImages().badge5,
        badge10: effects.loadImages().badge10,
        badge20: effects.loadImages().badge20,
        badge30: effects.loadImages().badge30,
        badge50: effects.loadImages().badge50
    };

    enemies = {
        enemy: [],
        divingTimer: 17000,
        formationSprite: 0,
        formationSpriteCount: 500,
        formationLeftRight: 4,
        formationOffsetX: 0,
        formationOffsetBreath: 1,
        formationBreathOut: true,
        "bee": { size: { width: 54, height: 60 }, size2: { width: 78, height: 60 }, images: [effects.loadImages().bee1, effects.loadImages().bee2] },
        "butterfly": { size: { width: 54, height: 60 }, size2: { width: 78, height: 60 }, images: [effects.loadImages().butterfly1, effects.loadImages().butterfly2] },
        "boss": { size: { width: 90, height: 90 }, size2: { width: 90, height: 96 }, images: [effects.loadImages().fullBoss1, effects.loadImages().fullBoss2, effects.loadImages().halfBoss1, effects.loadImages().halfBoss2] },
        "bonus1": { size: { width: 96, height: 78 }, size2: { width: 78, height: 60 }, images: [effects.loadImages().bonus1] },
        "bonus2": { size: { width: 108, height: 90 }, size2: { width: 78, height: 60 }, images: [effects.loadImages().bonus2] },
        "bonus3": { size: { width: 84, height: 96 }, size2: { width: 78, height: 60 }, images: [effects.loadImages().bonus3] }
    };

    explosions = {
        explosion: [],
        imgSmoke: effects.loadImages().smoke,
        imgFire1: effects.loadImages().fire1,
        imgFire2: effects.loadImages().fire2,
        imgFireBlue: effects.loadImages().fireBlue,
        imgFireGreen: effects.loadImages().fireGreen
    };

    sound = {
        theme: effects.loadSounds().theme,
        diving: effects.loadSounds().diving,
        enemyDeath: effects.loadSounds().enemyDeath,
        levelStart: effects.loadSounds().level,
        playerDeath: effects.loadSounds().playerDeath,
        bossHurt: effects.loadSounds().bossHurt,
        bossDeath: effects.loadSounds().bossDeath,
        fireMissile: [],
        fireMissileQueue: 0
    };

    for (let i = 0; i < 10; i++) {
        sound.fireMissile.push(effects.loadSounds().missile);
    }

    myKeyboard.register('ArrowLeft', function() { moveFighterLeft(fighter, 1); });
    myKeyboard.register('a', function() { moveFighterLeft(fighter, 1); });
    myKeyboard.register('ArrowRight', function() { moveFighterRight(fighter, 1); });
    myKeyboard.register('d', function() { moveFighterRight(fighter, 1); });
    myKeyboard.register(' ', function() { fireMissile(fighter, missiles, stats, sound); });

    myKeyboard.register('Escape', function() {
        quit = true;
        endGame();
    });
    canvas.addEventListener('click', function() { fireMissile(fighter, missiles, stats, sound); });

    slider.addEventListener('input', function() {
        const sliderValue = parseInt(slider.value, 10);
        const maxFighterX = canvas.width - fighter.size.width / 2;
        const minFighterX = fighter.size.width / 2;
        const normalizedValue = (sliderValue - 50) / sliderRange;
        const moveAmount = normalizedValue * fighter.speed * 0.02;
        const newX = fighter.center.x + moveAmount;

        fighter.center.x = Math.min(maxFighterX, Math.max(minFighterX, newX));
    });

    mobileSupport(fighter, missiles, stats, sound);
}

function resetGame() {
    backgroundStars = { stars: [] };
    fighter.lives = 3;
    fighter.center = { x: 600, y: 1470 };
    fighter.dead = false;
    fighter.deadTime = 0;
    fighter.invulnerableTimer = 1000;
    missiles.friendly = [];
    missiles.enemy = [];
    stats.score = 0;
    stats.totalMissilesFired = 0;
    stats.totalHits = 0;
    stats.currentTime = 0;
    stats.showPlayerStats = false;
    stats.showPlayerResults = false;
    stats.endGameTimer = 5000;
    stats.highScore = LocalScores.persistence.getHighScore();
    stats.stage.currentStage = 1;
    stats.stage.stageTime = 0;
    stats.stage.showStageTimer = 5000;
    stats.stage.missilesFired = 0;
    stats.stage.hits = 0;
    stats.stage.endingStage = false;
    stats.stage.endingStageTimer = 500;
    stats.stage.stageEnemies = getStage(1);
    enemies.enemy = [];
    enemies.divingTimer = 17000;
    enemies.formationSprite = 0;
    enemies.formationSpriteCount = 500;
    enemies.formationLeftRight = 4;
    enemies.formationOffsetX = 0;
    enemies.formationOffsetBreath = 1;
    enemies.formationBreathOut = true;
    explosions.explosion = [];
}

function run() {
    stats.highScore = LocalScores.persistence.getHighScore();
    missiles.noLimit = true;
    if (stats.stage.currentStage === 1) {
        let theme = sound.theme;
        if (theme.isReady) {
            theme.play();
        }
    }

    lastTimeStamp = performance.now();
    cancelNextRequest = false;
    quit = false;
    requestAnimationFrame(gameLoop);
}

function endGame() {
    cancelNextRequest = true;
    if (quit) {
        game.showScreen('main-menu');
    } else {
        saveScoreValue(stats.score);
        game.showScreen('high-scores');
    }
    resetGame();
}

return {
    initialize: initialize,
    run: run
};

}(MyGame.game, MyGame.input, MyGame.graphics, MyGame.effects, LocalScores));
