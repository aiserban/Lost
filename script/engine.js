window.Game = {};
window.Game.currentTick = 0;
window.Game.tickSpeed = 500;  // tick speed in milliseconds
window.Game.startDateTime = new Date().toString();
window.Game.running = true;

window.Game.Update = function() {
    function updateTickCounter() {
        window.Game.currentTick += 1;
        document.getElementById('tickCounter').innerHTML = window.Game.currentTick;
        console.log(window.Game.currentTick);
    }

    function eventCheck(){
        window.Game.Events.forEach(event => {
            if(event.isAvailable()){
                event.trigger();
            }
        });
    }

    updateTickCounter();
    eventCheck();
}


window.Game.MainLoop = function() {
    setInterval(window.Game.Update, window.Game.tickSpeed);
}

if (window.Game.running) {

}
window.Game.MainLoop();