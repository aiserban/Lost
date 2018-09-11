window.Game.Events = [
    {
        title: "The Stranger",
        isAvailable: function(){
            return (window.Game.currentTick % 5 === 0);
        },
        trigger: function(){
            console.log("You meet a stranger");
        }
    }
]