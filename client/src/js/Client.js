const Being = require('./Being.class');

module.exports = {
    init: function (game) {
        this.game = game;
        var socket = io('http://localhost:3001');
        this.socket = socket;
        socket.on('worldState', (response) => {
            this.worldStateResolve(response);
        });

        socket.on('playerLoggedIn', (data) => {
            debug('playerLoggedIn', data);
            this.game.player.playerId = data.playerId;
            this.loginResolve(data);
        });

        socket.on('playerJoined', data => {
            debug('playerJoined', data);
            const player = new Being(this.world.level, data);
            this.world.level.addBeing(player, player.x, player.y);
        });

        socket.on('playerMoved', data => {
            if (!this.world.level) return;
            let player = this.world.level.getPlayer(data.playerId);
            if (!player){
                return;
            }
            player.teleportTo(data.x, data.y);
            this.game.player.endTurn();
        });

        socket.on('messageSent', data => {
            if (!this.world.level) return;
            let player = this.world.level.getPlayer(data.playerId);
            if (!player){
                return;
            }
            this.game.talkManager.displayMessage(player, data.messageText);
        });
    },

    login: function () {
        this.socket.emit('login');
        return new Promise(resolve => { 
            this.loginResolve = resolve; 
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
    },

    sendMessage: function (message) {
        this.socket.emit('sendMessage', {message});
    }
}