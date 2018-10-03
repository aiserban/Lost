Game.WorldEvents = [
    {
        id: 1,
        title: "The Stranger",
        isAvailable: function(){
            return (window.Game.currentTick % 50 === 0) && window.Game.lastEventId !== this.id;
        },
        trigger: function(){
            window.Game.logEvent("A stranger appears, wrapped in a dark robe");
        }
    },
    {
        id: 2,
        title: "The hog",
        isAvailable: function(){
            return (window.Game.currentTick % 50 === 0) && window.Game.lastEventId !== this.id;
        },
        trigger: function(){
            window.Game.logEvent("You spot a wild hog between the trees");
        }
    },
    {
        id: 3,
        title: "Forest sounds",
        isAvailable: function(){
            return (window.Game.currentTick % 50 === 0) && window.Game.lastEventId !== this.id;
        },
        trigger: function(){
            window.Game.logEvent("The trees move");
        }
    }
];