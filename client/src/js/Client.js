const Being = require('./Being.class');

module.exports = {
    init: function (game) {
        this.game = game;
        var socket = io('http://localhost:3001');
        this.socket = socket;
        socket.on('worldState', (response) => {
            this.worldStateResolve(response);
        });

        socket.on('playerMoved', data => {
            if (!this.world.level) return; // Hack
            let player = this.world.level.getPlayer(data.playerId);
            if (!player){
                player = new Being(this.world.level, data);
			    this.world.level.addBeing(player, player.x, player.y);
            }
            player.teleportTo(data.x, data.y);
            this.game.player.endTurn();
        });
    },

    getWorldState: function () {
        this.socket.emit('getWorldState');
        return new Promise(resolve => { 
            this.worldStateResolve = resolve; 
        });
    },

    moveTo: function(dx, dy) {
        this.socket.emit('moveTo', {dx, dy});
    }
}