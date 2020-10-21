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
            this.game.player.updateFOV();
            if (player == this.game.player.being) {
                this.game.input.inputEnabled = true;
            }
        });

        socket.on('actionFailed', data => {
            debug('actionFailed', data);
            this.game.input.inputEnabled = true;
        });

        socket.on('chatRequested', data => {
            debug('chatRequested', data);
            this.game.display.message("Waiting for " + data.playerName + " to accept...");
        });

        socket.on('chatRequestRejected', data => {
            this.game.display.message(data.playerName + " cannot talk now.");
            this.game.input.inputEnabled = true;
        });

        socket.on('chatRequestAccepted', data => {
            this.game.display.message("You are now talking with " + data.playerName + ".");
            this.game.display.chatBox.activate();
            this.game.talkManager.startChat();
            this.game.input.setMode('TALK');
            this.game.input.inputEnabled = true;
            this.game.input.chatPrompt = false;
        });

        socket.on('chatRequest', data => {
            debug('chatRequest', data);
            this.game.display.message(data.playerName + " wants to talk with you. Y/N");
            this.game.input.chatPrompt = true;
        });

        socket.on('messageSent', data => {
            if (!this.world.level) return;
            let player = this.world.level.getPlayer(data.playerId);
            if (!player){
                return;
            }
            this.game.talkManager.displayMessage(player, data.messageText);
        });

        socket.on('playerLeft', data => {
            this.game.display.message(data.playerName + " lefts the conversation.");
            if (data.conversationOver) {
                this.game.talkManager.endChat();
                this.game.input.conversationOver();
            }
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
        debug('moveTo', {dx, dy});
        this.socket.emit('moveTo', {dx, dy});
    },

    nudgeChat: function(dx, dy) {
        debug('nudgeChat', {dx, dy});
        this.socket.emit('nudgeChat', {dx, dy});
    },

    leaveChat: function() {
        debug('leaveChat');
        this.socket.emit('leaveChat');
    },

    acceptChatRequest: function () {
        this.socket.emit('acceptChatRequest'); // This will trigger receiving a chatRequestAccepted
    },
    
    rejectChatRequest: function () {
        this.socket.emit('rejectChatRequest');
        this.game.display.message("Maybe some other time.");
        this.game.input.chatPrompt = false;
    },
    

    sendMessage: function (message) {
        this.socket.emit('sendMessage', {message});
    },

    tryLogin: function(password) {
        return this.login(this.savedUsername, password);
    }
}