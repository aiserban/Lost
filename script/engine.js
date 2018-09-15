window.Game = {};
window.Game.currentTick = 0;
window.Game.tickSpeed = 500;  // tick speed in milliseconds
window.Game.startDateTime = new Date().toString();
window.Game.running = true;
window.Game.resources = {};
window.Game.resources.wood = 0;
window.Game.log = "";

window.Game.Update = function () {
    if (window.Game.running) {
        window.Game.updateTickCounter();
        window.Game.updateResources();
        window.Game.eventCheck();
    }
}


/**
 * Checks for and triggers an available event
 *
 */
window.Game.eventCheck = function () {
    window.Game.Events.forEach(event => {
        if (event.isAvailable()) {
            event.trigger();
        }
    });
}

/**
 * Increases the game counter and displays the value in the UI
 * Debug method
 */
window.Game.updateTickCounter = function () {
    window.Game.currentTick += 1;
    document.getElementById('tickCounter').innerHTML = window.Game.currentTick;
}


/**
 * Updates the resource count in the UI
 *
 */
window.Game.updateResources = function () {
    document.getElementById('wood').innerHTML = window.Game.resources.wood;
}

window.Game.gatherWood = function () {
    window.Game.resources.wood += 1;
    window.Game.updateResources();
}

window.Game.MainLoop = function () {
    setInterval(window.Game.Update, window.Game.tickSpeed);
}

window.Game.pause = function() {
    window.Game.running = !window.Game.running;
}

window.Game.MainLoop();