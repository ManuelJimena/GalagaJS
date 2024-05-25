MyGame.input.Keyboard = function() {
   let fireMissile = false;
   let fireKey = ' ';

   let that = {
      keys: {},
      handlers: {}
   };

   function keyPress(e) {
      that.keys[e.key] = e.timeStamp;
   }

   function keyRelease(e) {
      delete that.keys[e.key];
      if (fireMissile && e.key === fireKey) {
         fireMissile = false;
      }
   }

   that.update = function(elapsedTime) {
      for (let key in that.keys) {
         if (that.keys.hasOwnProperty(key)) {
            if (that.handlers[key]) {
               if (key === fireKey && !fireMissile) {
                  fireMissile = true;
                  that.handlers[key](elapsedTime);
               } else if (key !== fireKey) {
                  that.handlers[key](elapsedTime);
               }
            }
         }
      }
   };

   that.register = function(key, handler) {
      that.handlers[key] = handler;
   };

   that.setFireKey = function(key) {
      fireKey = key;
   };

   window.addEventListener('keydown', keyPress);
   window.addEventListener('keyup', keyRelease);

   return that;
}; 
