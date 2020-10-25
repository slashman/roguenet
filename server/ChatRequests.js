const ActionRateLimiter = require('./ActionRateLimiter');
const Game = require('./Game');
const Chats = require('./Chats');

module.exports = {
	chatRequests: {},
	rejectChatRequest (socket) {
		const player = this.players[socket.id];
		const fromPlayerId = this.chatRequests[socket.id].fromPlayer.playerId;
		console.log('rejectChatRequest with ' + fromPlayerId);
		socket.broadcast.to(fromPlayerId).emit('chatRequestRejected', {
			playerName: player.playerName
		});
		delete this.players[fromPlayerId].currentChatRequestToPlayerId;
		delete this.chatRequests[socket.id];
	},
	cancelChatRequest (socket) {
		const player = this.players[socket.id];
		const chatRequest = this.chatRequests[player.currentChatRequestToPlayerId]; // TODO: Clean up outstanding requests on disconnect
		if (chatRequest) {
			console.log('rejectChatRequest with ' + chatRequest.fromPlayer.playerId);
			socket.broadcast.to(chatRequest.toPlayer.playerId).emit('chatRequestCancelled', {
				playerName: player.playerName
			});
			socket.emit('chatRequestCancelled');
			delete this.chatRequests[player.currentChatRequestToPlayerId];
			delete player.currentChatRequestToPlayerId;
		} else {
			console.log('Player has no outstanding chat request');
		}
	},
	acceptChatRequest (socket) {
		const player = this.players[socket.id];
		const chatRequest = this.chatRequests[socket.id];
		socket.broadcast.to(chatRequest.fromPlayer.playerId).emit('chatRequestAccepted', {
			playerName: player.playerName
		});
		socket.emit('chatRequestAccepted', {
			playerName: chatRequest.fromPlayer.playerName
		});
		delete this.players[chatRequest.fromPlayer.playerId].currentChatRequestToPlayerId;
		delete this.chatRequests[socket.id];
		const chatGroupName = Chats.getNewChatId();
		Chats.joinChat(player, socket, chatGroupName);
		Chats.joinChat(chatRequest.fromPlayer, this.io.sockets.connected[chatRequest.fromPlayer.playerId], chatGroupName);
	},
	nudgeChat (socket, dir) {
		const player = this.players[socket.id];
		console.log('Player '+player.playerName+" wants to chat x:" + dir.dx + " y:" + dir.dy);
		if (ActionRateLimiter.limitAction(socket)) {
			return;
		}
		if (player.currentChat) {
			// TODO: Are we on a chat already? if so, request the player to join the chat?
			return;
		}
		const testLevel = Game.world.getLevel('testLevel'); //TODO: Get level from player
		const target = testLevel.getBeing(player.x + dir.dx, player.y + dir.dy);
		if (!target) {
			console.log('target moved?');
			socket.emit('actionFailed');
			return;
		}
		if (target.currentChat) {
			// The player is on a chat already, check if can join
			Chats.tryJoinChatWithPlayer(socket, player, target);
		} else if (this.chatRequests[target.playerId]) {
			// Someone's already trying to talk with him
			socket.emit('chatRequestRejected', {
				playerName: target.playerName,
				reason: "alreadyHasRequest"
			});
		} else if (target.currentChatRequestToPlayerId) {
			// Player is trying to talk with someone
			socket.emit('chatRequestRejected', {
				playerName: target.playerName,
				reason: "hasActiveRequest"
			});
		} else {
			// Ask the player if he wants to chat
			//TODO: Ignore request if already ignored within some time
			socket.emit('chatRequested', {
				playerName: target.playerName
			});
			player.currentChatRequestToPlayerId = target.playerId;
			this.chatRequests[target.playerId] = {
				fromPlayer: player,
				toPlayer: target
			};
			console.log('emitting chatRequest to '+ target.playerId + ' socket');
			socket.broadcast.to(target.playerId).emit('chatRequest', {
				playerName: player.playerName
			});
		}
		ActionRateLimiter.update(socket);
	},
	init (io, players) {
		this.players = players; // TODO: Reference data module
		this.io = io;
	},
	bindSocket (socket) {
		socket.on('rejectChatRequest', this.rejectChatRequest.bind(this, socket));
		socket.on('cancelChatRequest', this.cancelChatRequest.bind(this, socket));
		socket.on('acceptChatRequest', this.acceptChatRequest.bind(this, socket));
		socket.on('nudgeChat', (dir) => this.nudgeChat(socket, dir));
	}
}