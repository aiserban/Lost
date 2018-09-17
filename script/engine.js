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
window.Game.inventoryChanged = true;
window.Game.inventory = [
    {
        "name": "Hatchet",
        "isAvailable": true,
        "description": "Just a plain old hatchet"
    },
    {
        "name": "Canteen",
        "isAvailable": false,
        "description": "Used for storing water. Capacity: 2 liters"
    },
    {
        "name": "Hunting knife",
        "isAvailable": true,
        "description": "Your trusty knife. Great at skinning and cutting everything wildlife"
    }
];
window.Game.player = {};
window.Game.player.stats = [
    {
        'name': 'hunger',
        'value': 100
    },
    {
        'name': 'thirst',
        'value': 100
    },
    {
        'name': 'sleep',
        'value': 100
    }
];
window.Game.decaySpeed = 5; // stats decay by 1 each {value} ticks
window.Game.lastTickStatDecay = 0;

/**
 * Main game loop. This is where the game starts
 */
window.Game.MainLoop = function () {
    setInterval(window.Game.Update, window.Game.tickSpeed);
};

/**
 * Function takes care of all events, actions and checks that need to be completed in each tick
 */
window.Game.Update = function () {
    if (window.Game.running) {
        window.Game.updateTickCounter();
        window.Game.eventCheck();
        window.Game.updateResources();
        window.Game.updateStats();
        window.Game.updateInventory();
        window.Game.decayStats();
    }
};

/**
 * Pauses or starts the game, based on the current state
 * Debug method
 */
window.Game.pause = function () {
    window.Game.running = !window.Game.running;
};

/**
 * Returns a random integer between min and max, inclusive
 * Allows for exclusions by passing an array with numbers to exclude
 * @param min
 * @param max
 * @param exclude
 * @returns {number}
 */
window.Game.randomInt = function (min, max, exclude) {
    let result = min - 1;
    let exclusions = [];

    if (exclude === null || exclude === undefined) {
        exclusions.push(min - 1);
    } else if (typeof(exclude) === "number") {
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
 * Checks for and triggers an available event.
 * Only one event can be triggered per tick.
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
 */
window.Game.updateResources = function () {
    document.getElementById('wood').innerHTML = window.Game.resources.wood;
};

/**
 * Update the player's inventory.
 * Uses the inventoryChanged variable to decide whether or not it needs to run
 */
window.Game.updateInventory = function () {
    if (window.Game.inventoryChanged === true) {
        let inv = '';
        for (let i = 0; i < window.Game.inventory.length; i++) {
            if (window.Game.inventory[i].isAvailable) {
                inv += window.Game.inventory[i].name + "\n";
            }
        }

        document.getElementById('inventory').innerHTML = inv;
        window.Game.inventoryChanged = false;
    }
};

/**
 * Decays all stats by 1. Existing is a great burden
 */
window.Game.decayStats = function () {
    if (window.Game.currentTick === (window.Game.lastTickStatDecay + window.Game.decaySpeed)) {
        for (let i = 0; i < window.Game.player.stats.length; i++) {
            window.Game.player.stats[i].value -= 1;
        }
        window.Game.lastTickStatDecay = window.Game.currentTick;
        window.Game.updateStats();
    }
};

/**
 * Update the stats in the UI
 */
window.Game.updateStats = function () {
    let hungerBar = document.getElementById('hunger');
    let thirstBar = document.getElementById('thirst');
    let sleepBar = document.getElementById('sleep');

    let playerHunger = window.Game.player.stats.find(stat => {
        return stat.name === 'hunger'
    }).value;
    let playerThirst = window.Game.player.stats.find(stat => {
        return stat.name === 'thirst'
    }).value;
    let playerSleep = window.Game.player.stats.find(stat => {
        return stat.name === 'sleep'
    }).value;

    if (playerHunger> 80) {
        hungerBar.innerHTML = '[+++++]';
    } else if (playerHunger > 60) {
        hungerBar.innerHTML = '[++++-]';
    } else if (playerHunger > 40) {
        hungerBar.innerHTML = '[+++--]';
    } else if (playerHunger > 20) {
        hungerBar.innerHTML = '[++---]';
    } else if (playerHunger > 0) {
        hungerBar.innerHTML = '[+----]';
    } else {
        hungerBar.innerHTML = '[-----]';
    }

    if (playerThirst> 80) {
        thirstBar.innerHTML = '[+++++]';
    } else if (playerThirst > 60) {
        thirstBar.innerHTML = '[++++-]';
    } else if (playerThirst > 40) {
        thirstBar.innerHTML = '[+++--]';
    } else if (playerThirst > 20) {
        thirstBar.innerHTML = '[++---]';
    } else if (playerThirst > 0) {
        thirstBar.innerHTML = '[+----]';
    } else {
        thirstBar.innerHTML = '[-----]';
    }

    if (playerSleep> 80) {
        sleepBar.innerHTML = '[+++++]';
    } else if (playerSleep > 60) {
        sleepBar.innerHTML = '[++++-]';
    } else if (playerSleep > 40) {
        sleepBar.innerHTML = '[+++--]';
    } else if (playerSleep > 20) {
        sleepBar.innerHTML = '[++---]';
    } else if (playerSleep > 0) {
        sleepBar.innerHTML = '[+----]';
    } else {
        sleepBar.innerHTML = '[-----]';
    }
};

/**
 * Checks if the player has the item with that name in the inventory
 * @param name
 * @returns {boolean}
 */
window.Game.itemAvailable = function (name) {
    let hasItem = false;
    if (window.Game.inventory.find(item => {
        return (item.name === name && item.isAvailable);
    })) {
        hasItem = true;
    }
    return hasItem;
};

/**
 * Displays a message to the game log
 * @param message
 */
window.Game.logEvent = function (message) {
    document.getElementById('log').innerHTML = message + "\n" + document.getElementById('log').innerHTML;
};

/**
 * Gather wood. Results are based on whether or not a proper tool is equipped and random chance.
 */
window.Game.gatherWood = function () {
    let woodGathered = 0;
    if (window.Game.itemAvailable("Hatchet" +
        "")) {
        woodGathered = window.Game.randomInt(3, 8);
    }
    else {
        woodGathered = window.Game.randomInt(0, 4);
    }

    window.Game.resources.wood += woodGathered;
    window.Game.updateResources();
    window.Game.logEvent("You manage to gather " + woodGathered + " wood");
};

/**
 * Run the game!
 */
window.Game.MainLoop();