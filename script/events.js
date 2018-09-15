window.Game.Events = [
    {
        id: 1,
        title: "The Stranger",
        isAvailable: function(){
            return (window.Game.currentTick % 5 === 0) && window.Game.lastEventId !== this.id;
        },
        trigger: function(){
            window.Game.logEvent("A stranger appears, wrapped in a dark robe.\nYou cannot see his face, but you know he's looking at you.")
            window.Game.lastEventId = this.id;
        }
    },
    {
        id: 2,
        title: "The hog",
        isAvailable: function(){
            return (window.Game.currentTick % 5 === 0) && window.Game.lastEventId !== this.id;
        },
        trigger: function(){
            window.Game.logEvent("You spot a wild hog between the trees.")
            window.Game.lastEventId = this.id;
        }
    },
    {
        id: 3,
        title: "Forest sounds",
        isAvailable: function(){
            return (window.Game.currentTick % 5 === 0) && window.Game.lastEventId !== this.id;
        },
        trigger: function(){
            window.Game.logEvent("The trees move.")
            window.Game.lastEventId = this.id;
        }
    }
]