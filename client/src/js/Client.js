const Being = require('./Being.class');
const config = require('./config');

module.exports = {
    init: function (game) {
        this.game = game;
        var socket = io(config.serverAddress);
        this.socket = socket;

        socket.on('loginResult', (data) => {
            debug('loginResult', data);
            if (data.success) {
                this.game.player.playerId = data.player.playerId;
                this._initHooks(socket);
            }
            this.loginResolve(data);
        });
    },
    _initHooks: function (socket) {
        if (this.initialized) return;
        this.initialized = true;

        socket.on('worldState', (response) => {
            this.worldStateResolve(response);
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

    login: function (username, password) {
        this.socket.emit('login', { username, password });
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
    },

    tryLogin: function(password) {
        return this.login(this.savedUsername, password);
    }
}