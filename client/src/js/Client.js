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
            this.game.display.message(data.playerName + " joins.");
            this.game.player.updateFOV();
        });

        socket.on('playerDisconnected', data => {
            debug('playerDisconnected', data);
            this.game.display.message(data.playerName + " disconnected.");
            this.world.level.removeBeing(data.playerId);
            this.game.player.updateFOV();
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
            this.game.input.setMode('WAIT_CHAT');
            this.game.input.inputEnabled = true;
        });

        socket.on('chatRequestRejected', data => {
            if (data.reason == "tooManyPlayers") {
                this.game.display.message(data.playerName + " is talking with too many people now.");
            } else if (data.reason == "alreadyHasRequest") {
                this.game.display.message("Someone is already asking " + data.playerName + " to talk.");
            } else if (data.reason == "hasActiveRequest") {
                this.game.display.message(data.playerName + " is trying to talk with someone else.");
            } else {
                this.game.display.message(data.playerName + " cannot talk now.");
            }
            this.game.input.setMode('MOVEMENT');
        });

        socket.on('chatRequestAccepted', data => {
            if (data.otherPlayers) {
                this.game.display.message("You are now talking with " + data.playerName + " and " + data.otherPlayers.length + " more people.");
            } else {
                this.game.display.message("You are now talking with " + data.playerName + ".");
            }
            this.game.display.chatBox.activate();
            this.game.talkManager.startChat();
            this.game.input.setMode('TALK');
            this.game.display.refresh();
        });

        socket.on('playerJoinedChat', data => {
            this.game.display.message(data.playerName + " joins the conversation.");
        });

        socket.on('chatRequest', data => {
            debug('chatRequest', data);
            this.game.display.message(data.playerName + " wants to talk with you. Accept? Y/N");
            this.game.input.setMode('PROMPT_CHAT');
        });

        socket.on('chatRequestCancelled', data => {
            debug('chatRequestCancelled', data);
            if (this.game.input.mode == 'PROMPT_CHAT') {
                this.game.display.message(data.playerName + " cancelled the request.");
            } else {
                this.game.display.message("You cancel your request.");
            }
            this.game.input.setMode('MOVEMENT');
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
            this.game.talkManager.disablePlayer(data.playerId);
            if (data.conversationOver) {
                this.game.talkManager.endChat();
                this.game.input.conversationOver();
            }
        });

        socket.on('clientChanged', () => {
            this.game.display.message("You have logged from a different client. Disconnecting.");
            this.game.display.disconnect();
            this.game.input.disconnect();
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

    cancelChatRequest: function() {
        debug('cancelChatRequest');
        this.socket.emit('cancelChatRequest');
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
        this.game.input.setMode("MOVEMENT");
    },
    

    sendMessage: function (message) {
        this.socket.emit('sendMessage', {message});
    },

    tryLogin: function(password) {
        return this.login(this.savedUsername, password);
    },

    disconnect: function () {
        this.socket.close();
    }
}