module.exports = {
	isTyping: false,
	wasTyping: false,
	startTyping: function () {
		this.isTyping = true;
	},
	stopTyping: function () {
		this.isTyping = false;
	},
	beat: function(){
		if (this.isTyping && !this.wasTyping) {
			this.wasTyping = true;
			this.client.startTyping();
			return;
		}
		if (!this.isTyping && this.wasTyping) {
			this.wasTyping = false;
			this.client.stopTyping();
			return;
		}
	},
	init: function (client) {
		this.client = client;
		setInterval(() => this.beat(), 1000);
	}
}