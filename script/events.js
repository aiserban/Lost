window.Game.Events = [
    {
        title: "The Stranger",
        isAvailable: function(){
            return (window.Game.currentTick % 5 === 0);
        },
        trigger: function(){
            document.getElementById('log').innerHTML += 
                "You meet a stranger\n";
                
        }
    }
]