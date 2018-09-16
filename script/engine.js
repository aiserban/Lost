window.Game = {};
window.Game.currentTick = 0;
window.Game.tickSpeed = 500;  // tick speed in milliseconds
window.Game.startDateTime = new Date().toString();
window.Game.running = true;
window.Game.resources = {};
window.Game.resources.wood = 0;
window.Game.log = "";
window.Game.lastEventId = -1;
window.Game.lastEventTick = 0;
window.Game.inventory = {
    "hatchet": true
};


/**
 * Main game loop. This is where the game starts
 *
 */
window.Game.MainLoop = function () {
    setInterval(window.Game.Update, window.Game.tickSpeed);
};


/**
 * Function takes care of all events, actions and checks that need to be completed in each tick
 *
 */
window.Game.Update = function () {
    if (window.Game.running) {
        window.Game.updateTickCounter();
        window.Game.updateResources();
        window.Game.eventCheck();
    }
};


/**
 * Pauses or starts the game, based on the current state
 *
 */
window.Game.pause = function () {
    window.Game.running = !window.Game.running;
};


/**
 * Generates a random integer
 *
 * @param {int} min
 * @param {int} max
 * @param {int []} exclude
 * @returns {int}
 */
window.Game.randomInt = function (min, max, exclude) {
    let result = min - 1;
    let exclusions = [];

    if (exclude === null || exclude === undefined) {
        exclusions.push(min - 1);
    } else if (typeof(exclude) === Number) {
        exclusions.push(exclude);
    } else {
        exclusions = exclusions.concat(exclude);
    }

    while (exclusions.includes(result)) {
        result = Math.floor(Math.random() * max + (min || 0));
    }

    return result;
};

/**
 * Checks for and triggers an available event. Only one event can be triggered per tick.
 *
 */
window.Game.eventCheck = function () {
    let excludedIds = [];
    excludedIds.push(0, window.Game.lastEventId);

    for (let i = 0; i < window.Game.Events.length; i++) {
        let rand = window.Game.randomInt(1, window.Game.Events.length, excludedIds);
        let event = window.Game.Events.filter(obj => {
            if (obj.id === rand) {
                return obj;
            }
        });
        if (event[0] !== 0 && event[0].isAvailable()) {
            event[0].trigger();
            break;
        }
    }
};


/**
 * Increases the game counter and displays the value in the UI
 * Debug method
 */
window.Game.updateTickCounter = function () {
    window.Game.currentTick += 1;
    document.getElementById('tickCounter').innerHTML = window.Game.currentTick;
};


/**
 * Updates the resource count in the UI
 *
 */
window.Game.updateResources = function () {
    document.getElementById('wood').innerHTML = window.Game.resources.wood;
};


/**
 * Displays a message in the log event
 *
 * @param {string} message
 */
window.Game.logEvent = function (message) {
    document.getElementById('log').innerHTML = message + "\n" + document.getElementById('log').innerHTML;
};


/**
 * Gather wood. Results are based on whether or not a proper weapon is equipped and random chance.
 *
 */
window.Game.gatherWood = function () {
    let woodGathered = 0;
    if (window.Game.inventory.hatchet === true) {
        woodGathered = window.Game.randomInt(3, 8);
    }
    else {
        woodGathered = window.Game.randomInt(0, 4);
    }

    window.Game.resources.wood += woodGathered;
    window.Game.updateResources();
    window.Game.logEvent("You manage to gather " + woodGathered + " wood");
};


window.Game.MainLoop();