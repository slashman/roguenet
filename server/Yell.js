module.exports = {
	init (io, players) {
		this.io = io;
		this.players = players;
	},
	yellMessage (socket, message) {
		const messageText = message.message;
		const player = this.players[socket.id];
		console.log('yelling message at ' + player.x + "," + player.y);
		this._emitToGroup(player, 'messageShout', {
			playerId: player.playerId,
			x: player.x,
			y: player.y,
			messageText
		});
	},

	_emitToGroup (player, message, payload) {
		console.log('sending [' + message + '] to [' + player.currentChatChannel + ']');
		this.io.to(player.currentChatChannel).emit(message, payload);
	},

	startTyping (socket) {
		const player = this.players[socket.id];
		this._emitToGroup(player, 'startedTyping', {
			playerId: player.playerId
		});
	},

	stopTyping (socket) {
		const player = this.players[socket.id];
		this._emitToGroup(player,'stoppedTyping', {
			playerId: player.playerId
		});
	},

	bindSocket (socket) {
		socket.on('yellMessage', (message) => this.yellMessage(socket, message));
		socket.on('startTyping', this.startTyping.bind(this, socket));
		socket.on('stopTyping', this.stopTyping.bind(this, socket));
	},
}