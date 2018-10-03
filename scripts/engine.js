Game = {};
Game.currentTick = 0;
Game.tickSpeed = 500;  // tick speed in milliseconds
Game.startDateTime = new Date().toString();
Game.running = true;
Game.log = "";
Game.lastEventId = -1;
Game.lastEventTick = 0;
Game.inventoryChanged = true;
Game.player = {};
Game.player.inventory = [
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
Game.player.resources = {};
Game.player.resources.wood = 0;
Game.player.resources.leaves = 0;
Game.player.resources.sticks = 0;
Game.player.resources.berries = 0;
Game.player.resources.mushrooms = 0;
Game.player.resources.apples = 0;
Game.player.resources.skin = 0;
Game.player.resources.fur = 0;
Game.player.resources.meat = 0;
Game.player.stats = [
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
Game.decaySpeed = 5; // stats decay by 1 each {value} ticks
Game.lastTickStatDecay = 0;
Game.lastStoryEventId = 0;
Game.disallowEvents = false;
Game.buildings = [
    {
        name: 'Shelter',
        requirements: {
            sticks: 5,
            leaves: 10
        },
        isAvailable: function(){
            return (this.requirements.sticks < Game.player.resources.sticks &&
                    this.requirements.leaves < Game.player.resources.leaves);
        }
    }
];
Game.buildMenuDisplayed = false;
Game.actionMenuDisplayed = true;
Game.currentSeason = 'Spring';
Game.seasonChangeTicks = 600;

/**
 * Main game loop. This is where the game starts
 */
Game.MainLoop = function () {
    Game.addTooltips();
    setInterval(Game.Update, Game.tickSpeed);
};

/**
 * Function takes care of all events, actions and checks that need to be completed in each tick
 */
Game.Update = function () {
    if (Game.running) {
        Game.updateTickCounter();
        if (Game.currentTick % Game.seasonChangeTicks === 0){
            Game.changeSeason();
        }
        Game.storyEventTrigger();
        Game.worldEventTrigger();
        Game.updateResources();
        Game.updateStats();
        Game.updateInventory();
        Game.decayStats();
    }
};

/**
 * Pauses or starts the game, based on the current state
 * Debug method
 */
Game.pause = function () {
    Game.running = !Game.running;
};

/**
 * Returns a random integer between min and max, inclusive
 * Allows for exclusions by passing an array with numbers to exclude
 * @param min
 * @param max
 * @param exclude
 * @returns {number}
 */
Game.randomInt = function (min, max, exclude) {
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
Game.worldEventTrigger = function () {
    if (Game.disallowEvents){
        return;
    }
    let excludedIds = [];
    excludedIds.push(0, Game.lastEventId);

    let rand = Game.randomInt(1, Game.WorldEvents.length, excludedIds);
    let event = Game.WorldEvents.find(obj => {
        return obj.id === rand && obj.isAvailable();
    });

    if (event !== undefined) {
        Game.disallowEvents = true;
        event.trigger();
        Game.lastEventId = event.id;
        Game.disallowEvents = false;
    }
};

/**
 * Triggers a story related event if one is available
 */
Game.storyEventTrigger = function () {
    if (Game.disallowEvents){
        return;
    }

    let event = Game.StoryEvents.find(obj => {
        return obj.id === Game.lastStoryEventId + 1 && obj.isAvailable();
    });
    if (event !== undefined) {
        Game.disallowEvents = true;
        event.trigger();
        Game.lastStoryEventId = event.id;
        Game.disallowEvents = false;
    }
};

/**
 * Increases the game counter and displays the value in the UI
 * Debug method
 */
Game.updateTickCounter = function () {
    Game.currentTick += 1;
    document.getElementById('tickCounter').innerHTML = Game.currentTick;
};

/**
 * Updates the resource count in the UI
 */
Game.updateResources = function () {
    document.getElementById('wood').innerHTML = Game.player.resources.wood;
};

/**
 * Update the player's inventory.
 * Uses the inventoryChanged variable to decide whether or not it needs to run
 */
Game.updateInventory = function () {
    if (Game.inventoryChanged === true) {
        let inv = '';
        for (let i = 0; i < Game.player.inventory.length; i++) {
            if (Game.player.inventory[i].isAvailable) {
                inv += Game.player.inventory[i].name + "\n";
            }
        }

        document.getElementById('inventory').innerHTML = inv;
        Game.inventoryChanged = false;
    }
};

/**
 * Decays all stats by 1. Existing is a great burden
 */
Game.decayStats = function () {
    if (Game.currentTick === (Game.lastTickStatDecay + Game.decaySpeed)) {
        for (let i = 0; i < Game.player.stats.length; i++) {
            Game.player.stats[i].value -= 1;
        }
        Game.lastTickStatDecay = Game.currentTick;
        Game.updateStats();
    }
};

/**
 * Update the stats in the UI
 */
Game.updateStats = function () {
    let hungerBar = document.getElementById('hunger');
    let thirstBar = document.getElementById('thirst');
    let sleepBar = document.getElementById('sleep');
    let comfortBar = document.getElementById('comfort');
    // Health bar is not displayed

    let playerHunger = Game.player.stats.find(stat => {
        return stat.name === 'Hunger'
    }).value;
    let playerThirst = Game.player.stats.find(stat => {
        return stat.name === 'Thirst'
    }).value;
    let playerSleep = Game.player.stats.find(stat => {
        return stat.name === 'Sleep'
    }).value;
    let playerComfort = Game.player.stats.find(stat => {
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
Game.itemAvailable = function (name) {
    let hasItem = false;
    if (Game.player.inventory.find(item => {
        return (item.name === name && item.isAvailable);
    })) {
        hasItem = true;
    }
    return hasItem;
};

/**
 * Changes the current season
 */
Game.changeSeason = function (){
    if (Game.currentSeason === "Spring") {
        Game.logEvent("The sun shines brighter than usual today");
        Game.currentSeason = "Summer";
    } else if (Game.currentSeason === "Summer"){
        Game.logEvent("The leaves have started to fall");
        Game.currentSeason = "Autumn";
    } else if (Game.currentSeason === "Autumn"){
        Game.logEvent("Unexpectedly warm, the first snowflake melts on your cheek");
        Game.currentSeason = "Winter";
    } else {
        Game.logEvent("The vivid colors of a flower catches your attention");
        Game.currentSeason = "Spring";
    }
};

/**
 * Displays a message to the game log
 * @param message
 */
Game.logEvent = function (message) {
    document.getElementById('log').innerHTML = message + "\n" + document.getElementById('log').innerHTML;
};

/**
 * Gather wood, sticks and leaves.
 * Results are based on whether or not a proper tool is equipped and random chance.
 */
Game.gatherWood = function () {
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

    if (Game.itemAvailable(boostItem)) {
        woodGathered = Game.randomInt(minWoodWithoutMultiplier * boostMultiplier, maxWoodWithoutMultiplier * boostMultiplier);
    }
    else {
        woodGathered = Game.randomInt(minWoodWithoutMultiplier, maxWoodWithoutMultiplier);
    }

    sticksGathered = Game.randomInt(5, 15);
    leavesGathered = Game.randomInt(1, 2);

    Game.player.resources.wood += woodGathered;
    Game.player.resources.sticks += sticksGathered;
    Game.player.resources.leaves += leavesGathered;
    Game.player.stats.find(obj => {
        return obj.name === "Hunger"
    }).value -= hungerCost;
    Game.player.stats.find(obj => {
        return obj.name === "Thirst"
    }).value -= thirstCost;
    Game.player.stats.find(obj => {
        return obj.name === "Sleep"
    }).value -= sleepCost;

    Game.updateResources();
    Game.updateStats();
    Game.logEvent("You manage to gather " + woodGathered + " wood, " + sticksGathered + " sticks and " + leavesGathered + " bunch of leaves.");
};

/**
 * Forage for fruit, vegetables and other small gains
 */
Game.forage = function () {
    let hungerCost = 3;
    let sleepCost = 5;
    let thirstCost = 3;
    let applesGathered = 0;
    let mushroomsGathered = 0;
    let berriesGathered = 0;

    applesGathered = Game.randomInt(1, 10);
    mushroomsGathered = Game.randomInt(1, 10);
    berriesGathered = Game.randomInt(5, 10);

    Game.player.resources.apples += applesGathered;
    Game.player.resources.mushrooms += mushroomsGathered;
    Game.player.resources.berries += berriesGathered;

    Game.player.stats.find(obj => {
        return obj.name === "Hunger"
    }).value -= hungerCost;
    Game.player.stats.find(obj => {
        return obj.name === "Thirst"
    }).value -= thirstCost;
    Game.player.stats.find(obj => {
        return obj.name === "Sleep"
    }).value -= sleepCost;

    Game.updateResources();
    Game.updateStats();
    Game.logEvent("You manage to forage " + berriesGathered + " berries, " + applesGathered + " apples and " + mushroomsGathered + " mushrooms.");
};

/**
 * Hunt to obtain meat, fur, skin and other goodies from animal sources
 */
Game.hunt = function () {
    let hungerCost = 5;
    let sleepCost = 5;
    let thirstCost = 5;
    let meatGathered = 0;
    let skinGathered = 0;
    let furGathered = 0;

    meatGathered = Game.randomInt(1, 3);
    skinGathered = Game.randomInt(0, 2);
    furGathered = Game.randomInt(1, 6);

    Game.player.resources.meat += meatGathered;
    Game.player.resources.skin += skinGathered;
    Game.player.resources.fur += furGathered;

    Game.player.stats.find(obj => {
        return obj.name === "Hunger"
    }).value -= hungerCost;
    Game.player.stats.find(obj => {
        return obj.name === "Thirst"
    }).value -= thirstCost;
    Game.player.stats.find(obj => {
        return obj.name === "Sleep"
    }).value -= sleepCost;

    Game.updateResources();
    Game.updateStats();
    Game.logEvent("You manage to get " + meatGathered + " meat, " + furGathered + " fur and " + skinGathered + " skins");
};

/**
 * Display the build menu
 */
Game.showBuildMenu = function(){
    document.getElementById('actionMenu').setAttribute('style', 'visibility: collapse');
    document.getElementById('buildMenu').setAttribute('style', 'visibility: visible');
    Game.buildMenuDisplayed = true;
    Game.actionMenuDisplayed = false;
};

/**
 * Back button switches the current view in the UI to the previous one
 */
Game.back = function(){
    if (Game.buildMenuDisplayed){
        document.getElementById('buildMenu').setAttribute('style', 'visibility: collapse');
        document.getElementById('actionMenu').setAttribute('style', 'visibility: visible');
        Game.buildMenuDisplayed = false;
        Game.actionMenuDisplayed = true;
    }
};

/**
 * Build a shelter to protect from weather effects
 * Having a home also gives a boost for comfort
 */
Game.buildShelter = function(){
    let shelter = Game.buildings.find(building => function(){ return building.name === 'Shelter'});
    if (shelter.isAvailable()) {
        Game.player.resources.stick -= shelter.requirements.sticks;
        Game.player.resources.leaves -= shelter.requirements.leaves;
        Game.updateResources();
        Game.logEvent('You wrap a bunch of stick and leaves together. It isn\'t much, but it will have to do for now');
    } else {
        Game.logEvent('There aren\'t enough resources to build a shelter');
    }
};

Game.addTooltips = function(){
    let shelter = Game.buildings.find(building => function(){ return building.name === 'Shelter'});
    document.getElementById("shelter").setAttribute(
        "title", "Requires " + shelter.requirements.sticks + " sticks and " + shelter.requirements.leaves + " leaves");
};

/**
 * Run the game!
 */
Game.MainLoop();