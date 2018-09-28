window.Game = {};
window.Game.currentTick = 0;
window.Game.tickSpeed = 500;  // tick speed in milliseconds
window.Game.startDateTime = new Date().toString();
window.Game.running = true;
window.Game.log = "";
window.Game.lastEventId = -1;
window.Game.lastEventTick = 0;
window.Game.inventoryChanged = true;
window.Game.player = {};
window.Game.player.inventory = [
    {
        name: "Hatchet",
        isAvailable: true,
        description: "Just a plain old hatchet"
    },
    {
        name: "Canteen",
        isAvailable: false,
        description: "Used for storing water. Capacity: 2 liters"
    },
    {
        name: "Hunting knife",
        isAvailable: true,
        description: "Your trusty knife. Great at skinning and cutting everything wildlife"
    }
];
window.Game.player.resources = {};
window.Game.player.resources.wood = 0;
window.Game.player.resources.leaves = 0;
window.Game.player.resources.sticks = 0;
window.Game.player.resources.berries = 0;
window.Game.player.resources.mushrooms = 0;
window.Game.player.resources.apples = 0;
window.Game.player.resources.skin = 0;
window.Game.player.resources.fur = 0
window.Game.player.resources.meat = 0;
window.Game.player.stats = [
    {
        name: 'Hunger',
        value: 100
    },
    {
        name: 'Thirst',
        value: 100
    },
    {
        name: 'Sleep',
        value: 100
    },
    {
        name: 'Comfort',
        value: 100
    },
    {
        name: 'Health',
        value: 100
    }
];
window.Game.decaySpeed = 5; // stats decay by 1 each {value} ticks
window.Game.lastTickStatDecay = 0;
window.Game.lastStoryEventId = 0;
window.Game.disallowEvents = false;
window.Game.buildings = [
    {
        name: 'Shelter',
        requirements: {
            sticks: 5,
            leaves: 10
        },
        isAvailable: function(){
            return (this.requirements.sticks < window.Game.player.resources.sticks &&
                    this.requirements.leaves < window.Game.player.resources.leaves);
        }
    }
];
window.Game.buildMenuDisplayed = false;
window.Game.actionMenuDisplayed = true;

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
        window.Game.storyEventTrigger();
        window.Game.worldEventTrigger();
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
window.Game.worldEventTrigger = function () {
    if (window.Game.disallowEvents){
        return;
    }
    let excludedIds = [];
    excludedIds.push(0, window.Game.lastEventId);

    let rand = window.Game.randomInt(1, window.Game.WorldEvents.length, excludedIds);
    let event = window.Game.WorldEvents.find(obj => {
        return obj.id === rand && obj.isAvailable();
    });

    if (event !== undefined) {
        window.Game.disallowEvents = true;
        event.trigger();
        window.Game.lastEventId = event.id;
        window.Game.disallowEvents = false;
    }
};

/**
 * Triggers a story related event if one is available
 */
window.Game.storyEventTrigger = function () {
    if (window.Game.disallowEvents){
        return;
    }

    let event = window.Game.StoryEvents.find(obj => {
        return obj.id === window.Game.lastStoryEventId + 1 && obj.isAvailable();
    });
    if (event !== undefined) {
        window.Game.disallowEvents = true;
        event.trigger();
        window.Game.lastStoryEventId = event.id;
        window.Game.disallowEvents = false;
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
    document.getElementById('wood').innerHTML = window.Game.player.resources.wood;
};

/**
 * Update the player's inventory.
 * Uses the inventoryChanged variable to decide whether or not it needs to run
 */
window.Game.updateInventory = function () {
    if (window.Game.inventoryChanged === true) {
        let inv = '';
        for (let i = 0; i < window.Game.player.inventory.length; i++) {
            if (window.Game.player.inventory[i].isAvailable) {
                inv += window.Game.player.inventory[i].name + "\n";
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
    let comfortBar = document.getElementById('comfort');
    // Health bar is not displayed

    let playerHunger = window.Game.player.stats.find(stat => {
        return stat.name === 'Hunger'
    }).value;
    let playerThirst = window.Game.player.stats.find(stat => {
        return stat.name === 'Thirst'
    }).value;
    let playerSleep = window.Game.player.stats.find(stat => {
        return stat.name === 'Sleep'
    }).value;
    let playerComfort = window.Game.player.stats.find(stat => {
        return stat.name === 'Comfort'
    }).value;

    if (playerHunger > 80) {
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

    if (playerThirst > 80) {
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

    if (playerSleep > 80) {
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

    if (playerComfort > 80) {
        comfortBar.innerHTML = '[+++++]';
    } else if (playerComfort > 60) {
        comfortBar.innerHTML = '[++++-]';
    } else if (playerComfort > 40) {
        comfortBar.innerHTML = '[+++--]';
    } else if (playerComfort > 20) {
        comfortBar.innerHTML = '[++---]';
    } else if (playerComfort > 0) {
        comfortBar.innerHTML = '[+----]';
    } else {
        comfortBar.innerHTML = '[-----]';
    }
};

/**
 * Checks if the player has the item with the provided name in the inventory
 * @param name
 * @returns {boolean}
 */
window.Game.itemAvailable = function (name) {
    let hasItem = false;
    if (window.Game.player.inventory.find(item => {
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
 * Gather wood, sticks and leaves.
 * Results are based on whether or not a proper tool is equipped and random chance.
 */
window.Game.gatherWood = function () {
    let woodGathered = 0;
    let sticksGathered = 0;
    let leavesGathered = 0;
    let boostItem = "Hatchet";
    let boostMultiplier = 2;
    let minWoodWithoutMultiplier = 1;
    let maxWoodWithoutMultiplier = 5;
    let hungerCost = 10;
    let thirstCost = 10;
    let sleepCost = 5;

    if (window.Game.itemAvailable(boostItem)) {
        woodGathered = window.Game.randomInt(minWoodWithoutMultiplier * boostMultiplier, maxWoodWithoutMultiplier * boostMultiplier);
    }
    else {
        woodGathered = window.Game.randomInt(minWoodWithoutMultiplier, maxWoodWithoutMultiplier);
    }

    sticksGathered = window.Game.randomInt(5, 15);
    leavesGathered = window.Game.randomInt(1, 2);

    window.Game.player.resources.wood += woodGathered;
    window.Game.player.resources.sticks += sticksGathered;
    window.Game.player.resources.leaves += leavesGathered;
    window.Game.player.stats.find(obj => {
        return obj.name === "Hunger"
    }).value -= hungerCost;
    window.Game.player.stats.find(obj => {
        return obj.name === "Thirst"
    }).value -= thirstCost;
    window.Game.player.stats.find(obj => {
        return obj.name === "Sleep"
    }).value -= sleepCost;

    window.Game.updateResources();
    window.Game.updateStats();
    window.Game.logEvent("You manage to gather " + woodGathered + " wood, " + sticksGathered + " sticks and " + leavesGathered + " bunch of leaves.");
};

/**
 * Forage for fruit, vegetables and other small gains
 */
window.Game.forage = function () {
    let hungerCost = 3;
    let sleepCost = 5;
    let thirstCost = 3;
    let applesGathered = 0;
    let mushroomsGathered = 0;
    let berriesGathered = 0;

    applesGathered = window.Game.randomInt(1, 10);
    mushroomsGathered = window.Game.randomInt(1, 10);
    berriesGathered = window.Game.randomInt(5, 10);

    window.Game.player.resources.apples += applesGathered;
    window.Game.player.resources.mushrooms += mushroomsGathered;
    window.Game.player.resources.berries += berriesGathered;

    window.Game.player.stats.find(obj => {
        return obj.name === "Hunger"
    }).value -= hungerCost;
    window.Game.player.stats.find(obj => {
        return obj.name === "Thirst"
    }).value -= thirstCost;
    window.Game.player.stats.find(obj => {
        return obj.name === "Sleep"
    }).value -= sleepCost;

    window.Game.updateResources();
    window.Game.updateStats();
    window.Game.logEvent("You manage to forage " + berriesGathered + " berries, " + applesGathered + " apples and " + mushroomsGathered + " mushrooms.");
};

/**
 * Hunt to obtain meat, fur, skin and other goodies from animal sources
 */
window.Game.hunt = function () {
    let hungerCost = 5;
    let sleepCost = 5;
    let thirstCost = 5;
    let meatGathered = 0;
    let skinGathered = 0;
    let furGathered = 0;

    meatGathered = window.Game.randomInt(1, 3);
    skinGathered = window.Game.randomInt(0, 2);
    furGathered = window.Game.randomInt(1, 6);

    window.Game.player.resources.meat += meatGathered;
    window.Game.player.resources.skin += skinGathered;
    window.Game.player.resources.fur += furGathered;

    window.Game.player.stats.find(obj => {
        return obj.name === "Hunger"
    }).value -= hungerCost;
    window.Game.player.stats.find(obj => {
        return obj.name === "Thirst"
    }).value -= thirstCost;
    window.Game.player.stats.find(obj => {
        return obj.name === "Sleep"
    }).value -= sleepCost;

    window.Game.updateResources();
    window.Game.updateStats();
    window.Game.logEvent("You manage to get " + meatGathered + " meat, " + furGathered + " fur and " + skinGathered + " skins");
};

/**
 * Display the build menu
 */
window.Game.showBuildMenu = function(){
    document.getElementById('actionMenu').setAttribute('style', 'visibility: collapse');
    document.getElementById('buildMenu').setAttribute('style', 'visibility: visible');
    window.Game.buildMenuDisplayed = true;
    window.Game.actionMenuDisplayed = false;
};

/**
 * Back button switches the current view in the UI to the previous one
 */
window.Game.back = function(){
    if (window.Game.buildMenuDisplayed){
        document.getElementById('buildMenu').setAttribute('style', 'visibility: collapse');
        document.getElementById('actionMenu').setAttribute('style', 'visibility: visible');
        window.Game.buildMenuDisplayed = false;
        window.Game.actionMenuDisplayed = true;
    }
};

/**
 * Build a shelter to protect from weather effects
 * Having a home also gives a boost for comfort
 */
window.Game.buildShelter = function(){
    let shelter = window.Game.buildings.find(building => function(){ return building.name === 'Shelter'});
    if (shelter.isAvailable()) {
        window.Game.player.resources.stick -= shelter.requirements.sticks;
        window.Game.player.resources.leaves -= shelter.requirements.leaves;
        window.Game.updateResources();
        window.Game.logEvent('You wrap a bunch of stick and leaves together. It isn\'t much, but it will have to do for now');
    } else {
        window.Game.logEvent('There aren\'t enough resources to build a shelter');
    }
};

/**
 * Run the game!
 */
window.Game.MainLoop();