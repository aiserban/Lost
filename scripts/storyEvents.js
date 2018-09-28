Game.StoryEvents = [
    {
        id: 1,
        title: 'intro',
        isAvailable: function(){
            return (window.Game.currentTick === 5);
        },
        trigger: function() {
            window.Game.logEvent("You wake up from a restless sleep");
            setTimeout(function () {
                window.Game.logEvent("The hatchet is still beside you")
            }, window.Game.tickSpeed * 15);
        }
    }
];