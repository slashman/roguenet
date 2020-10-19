module.exports = {
    init: function (game) {
        this.game = game;
    },
    sendMessage: function (message){
        this.game.client.sendMessage(message);
    },
    displayMessage: function (player, message) {
        const chatBox = this.game.display.getOrAssignChatbox(player);
        if (!chatBox) {
            return; // Edge case
        }
        chatBox.setText(message);
    },
    startChat: function () {
        this.isTalkActive = true;
    },
    endChat: function () {
        this.isTalkActive = false;
    }
}