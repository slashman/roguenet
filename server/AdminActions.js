const Game = require('./Game');
const Chats = require('./Chats');

module.exports = {
	init (io, players) {
		this.io = io;
		this.players = players;
	},
	smite (socket, dir) {
		const player = this.players[socket.id];
		console.log('Admin '+player.playerName+" uses smite powers dir x:" + dir.dx + " y:" + dir.dy);
		const testLevel = Game.world.getLevel('testLevel'); //TODO: Get level from player
		const target = testLevel.getBeing(player.x + dir.dx, player.y + dir.dy);
		if (!target) {
			return;
		}
		Chats.leaveChat(target);
		this.io.emit('playerDisconnected', target);
		Game.world.getLevel('testLevel').removeBeing(target.username);
		delete this.players[target.playerId];	
		const playerSocket = this.io.sockets.connected[target.playerId];
		if (playerSocket) {
			playerSocket.emit('smitten');
			playerSocket.disconnect();
		}
	},
	bindSocket (socket) {
		socket.on('smite', (dir) => this.smite(socket, dir));
	}
}