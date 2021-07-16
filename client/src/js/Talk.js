module.exports = {
    init: function (game) {
        this.game = game;
        this.isYellActive = true;
    },
    sendMessage: function (message){
        if (this.isYellActive) {
            this.game.client.yellMessage(message);
        } else {
            this.game.client.sendMessage(message);
        }
    },
    displayMessage: function (player, message) {
        const chatBox = this.game.display.spawnChatbox(player, message);
        if (!chatBox) {
            return; // Edge case
        }
    },

    startedTyping: function (player) {
        const chatBox = this.game.display.getLastChatboxForPlayer(player);
        if (!chatBox) {
            return;
        }
        chatBox.setIsTyping(true);
    },
    stoppedTyping: function (player) {
        const chatBox = this.game.display.getLastChatboxForPlayer(player);
        if (!chatBox) {
            return;
        }
        chatBox.setIsTyping(false);
    },
    disablePlayer: function (playerId) {
        this.game.display.unassignChatbox(playerId);
    },
    startChat: function () {
        this.isTalkActive = true;
    },
    endChat: function () {
        this.isTalkActive = false;
        this.game.display.unassignChatboxes();
    }
}