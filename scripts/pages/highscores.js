(function(LocalScores) {
    'use strict';

    let currentHighlightedValue;

    function initialize() {
        document.getElementById('backButton').addEventListener(
            'click',
            function() { showScreen('menu'); });

        LocalScores.persistence.report();
    }

    function selectMenuOption() {
        if (currentHighlightedValue === "reset-high-scores") {
            resetHighScores();
        } else if (currentHighlightedValue === "backButton") {
            showScreen("menu");
        }
    }

    function menuDown() {
        if (currentHighlightedValue === 'backButton') {
            currentHighlightedValue = "reset-high-scores";
            document.getElementById("backButton").style.border = "0.1em solid rgb(0, 0, 0)";
            document.getElementById("reset-high-scores").style.border = "0.1em solid #CECEF6";
        } else {
            currentHighlightedValue = 'backButton';
            document.getElementById("backButton").style.border = "0.1em solid #CECEF6";
            document.getElementById("reset-high-scores").style.border = "0.1em solid rgb(0, 0, 0)";
        }
    }

    function run() {
        currentHighlightedValue = 'backButton';
        document.getElementById("backButton").style.border = "0.1em solid #CECEF6";
        document.getElementById("reset-high-scores").style.border = "0.1em solid rgb(0, 0, 0)";

        document.body.onkeyup = function(e) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                menuDown();
            } else if (e.key === "Enter") {
                selectMenuOption();
            } else if (e.key === "Escape") {
                showScreen("menu");
            }
        }
    }

    function showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }

    window.highscores = {
        initialize: initialize,
        run: run
    };
}(LocalScores));
