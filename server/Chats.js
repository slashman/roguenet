module.exports = {
	currentChat: 1,
	chats: {},
	init (io, players) {
		this.io = io;
		this.players = players;
	},
	leaveChatMessage (socket) {
		const player = this.players[socket.id];
		if (!player.currentChat) {
			return;
		}
		const chatId = player.currentChat;
		const chat = this.chats[chatId];
		if (!chat) {
			return;
		}
		this.leaveChat(player, socket);
		if (chat.members.length == 1) {
			this.leaveChat(chat.members[0]);
			delete this.chats[chatId];
		}
	},
	sendMessage (socket, message) {
		const messageText = message.message;
		const player = this.players[socket.id];
		if (!player.currentChat) {
			console.log('player has no chat');
			return;
		}
		console.log('sending message to group ' + player.currentChat);
		this.io.to(player.currentChat).emit('messageSent', {
			playerId: player.playerId,
			messageText
		});
	},
	bindSocket (socket) {
		socket.on('leaveChat', this.leaveChatMessage.bind(this, socket));
		socket.on('sendMessage', (message) => this.sendMessage(socket, message));
	},
	getNewChatId () {
		return 'hangout_' + (++this.currentChat);
	},
	tryJoinChatWithPlayer (socket, player, target) {
		const chat = this.chats[target.currentChat];
		if (chat.members.length < 6) {
			socket.emit('chatRequestAccepted', {
				playerName: target.playerName,
				otherPlayers: chat.members.filter(m => m.playerId == target.playerId).map(m => m.playerName)
			});
			socket.to(target.currentChat).emit('playerJoinedChat', {
				playerId: player.playerId,
				playerName: player.playerName
			});
			this.joinChat(player, socket, target.currentChat);
		} else {
			socket.emit('chatRequestRejected', {
				playerName: player.playerName,
				reason: "tooManyPlayers"
			});
		}
	},
	joinChat(player, socket, chatGroupName) {
        if (!this.chats[chatGroupName]) {
            this.chats[chatGroupName] = {
                members: []
            };
        }
        player.currentChat = chatGroupName;
        socket.join(chatGroupName);
        this.chats[chatGroupName].members.push(player);
    },
	leaveChat(player, socket) {
        const chatId = player.currentChat;
        const chat = this.chats[chatId];
        if (!socket) {
            socket = this.io.sockets.connected[player.playerId];
		}
		this.io.in(chatId).emit('playerLeft', {
            playerId: player.playerId,
            playerName: player.playerName,
            conversationOver: chat.members.length == 1
		});
		if (socket) {
			// Player may be disconnected already!
			socket.leave(chatId);
		}
        delete player.currentChat;
        chat.members.splice(chat.members.findIndex(p => p.playerId == player.playerId), 1);
    }
}