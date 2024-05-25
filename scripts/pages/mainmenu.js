MyGame.screens['main-menu'] = (function(game) {
   'use strict';

   let currentHighlightedValue;

   function initialize() {

      document.getElementById('id-new-game').addEventListener(
         'click',
         function() {
            game.showScreen('game-play'); 
         });

      document.getElementById('id-high-scores').addEventListener(
         'click',
         function() { game.showScreen('high-scores'); });
   }

   function selectMenuOption() {
      if (currentHighlightedValue === "id-new-game") {
         game.showScreen('game-play');
      } else if (currentHighlightedValue === "id-high-scores") {
         game.showScreen('high-scores');
      }
   }

   function menuDown() {
      if (currentHighlightedValue === "id-new-game") {
         document.getElementById("id-new-game").style.border = "0.1em solid rgb(0, 0, 0)";
         document.getElementById("id-high-scores").style.border = "0.1em solid #CECEF6";
         currentHighlightedValue = "id-high-scores";
      } else if (currentHighlightedValue === "id-high-scores") {
         document.getElementById("id-high-scores").style.border = "0.1em solid rgb(0, 0, 0)";
         document.getElementById("id-new-game").style.border = "0.1em solid #CECEF6";
         currentHighlightedValue = "id-new-game";
      }
   }

   function menuUp() {
      if (currentHighlightedValue === "id-new-game") {
         document.getElementById("id-new-game").style.border = "0.1em solid rgb(0, 0, 0)";
         document.getElementById("id-high-scores").style.border = "0.1em solid #CECEF6";
         currentHighlightedValue = "id-high-scores";
      } else if (currentHighlightedValue === "id-high-scores") {
         document.getElementById("id-high-scores").style.border = "0.1em solid rgb(0, 0, 0)";
         document.getElementById("id-new-game").style.border = "0.1em solid #CECEF6";
         currentHighlightedValue = "id-new-game";
      }
   }

   function run() {
      currentHighlightedValue = 'id-new-game';
      document.getElementById("id-new-game").style.border = "0.1em solid #CECEF6";
      document.getElementById("id-high-scores").style.border = "0.1em solid rgb(0, 0, 0)";

      document.getElementById('body').onkeyup = function(e) {
         if (game.getActiveScreen() !== "high-scores" && game.getActiveScreen() !== "game-play") {
            if (e.key === "ArrowDown") {
               menuDown();
            } else if (e.key === "ArrowUp") {
               menuUp();
            } else if (e.key === "Enter" && game.getActiveScreen() === "main-menu") {
               selectMenuOption();
            } else if (e.key === "Enter") {
               game.showScreen("main-menu");
            } else if (e.key === "Escape" && game.getActiveScreen() !== "main-menu") {
               game.showScreen("main-menu");
            }
         }
      }
   }

   return {
      initialize: initialize,
      run: run
   };
}(MyGame.game));
