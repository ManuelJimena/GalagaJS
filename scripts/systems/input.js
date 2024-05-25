(function() {
    'use strict';

    let keys = {};

    function keyPress(e) {
        keys[e.key] = e.timeStamp;
    }

    function keyRelease(e) {
        delete keys[e.key];
    }

    function isKeyPressed(key) {
        return keys.hasOwnProperty(key);
    }

    window.addEventListener('keydown', keyPress);
    window.addEventListener('keyup', keyRelease);

    window.input = {
        isKeyPressed: isKeyPressed
    };
}());
