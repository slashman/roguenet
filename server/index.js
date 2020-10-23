var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var players = {};
var lastActions = {};
const chatRequests = {};
const chats = {};
let currentChat = 0;

const Game = require('./Game');
const Being = require('./Being.class');
const { join } = require('path');

const COLORS = [
    [0, 0, 0],
    [0, 0, 170],
    [0, 170, 0],
    [0, 170, 170],
    [170, 0, 0],
    [170, 0, 170],
    [170, 85, 0],
    [170, 170, 170],
    [85, 85, 85],
    [85, 85, 255],
    [85, 255, 85],
    [85, 255, 255],
    [255, 85, 85],
    [255, 85, 255],
    [255, 255, 85],
    [255, 255, 255]
];

const testUsers = [
    {
        user: 'rodney',
        password: 'pwd',
        playerName: 'Rodney',
        color: COLORS[2]
    },
    {
        user: 'rodinia',
        password: 'pwd',
        playerName: 'Rodinia',
        color: COLORS[4]
    },
    {
        user: 'slashie',
        password: 'pwd',
        playerName: 'Slashie',
        color: COLORS[6]
    },
    {
        user: 'gaby',
        password: 'pwd',
        playerName: 'Gaby',
        color: COLORS[5]
    }
];

function initPlayer(playerObj, socketId) {
    const testLevel = Game.world.getLevel('testLevel');
    const player = new Being(testLevel);
    player.playerId = socketId;
    player.playerName = playerObj.playerName;
    player.username = playerObj.user;
    player.color = playerObj.color;
    testLevel.addBeing(player, 37, 10);
    return player;
}

io.on('connection', function(socket){
    console.log('Someone connected to us');
    // Stand by for login

    socket.on('login', function(credentials){
        const username = credentials.username;
        const password = credentials.password;
        const user = testUsers.find(p => p.user == username && p.password == password);
        if (!user) {
            socket.emit('loginResult', { success: false });
            return;
        }
        let player = players[socket.id];
        if (!player) {
            player = Game.world.getLevel('testLevel').getPlayerByUsername(user.user);
        }
        if (!player) {
            player = initPlayer(user, socket.id);
        }
        players[socket.id] = player;
        //TODO: Maybe if the player has another active socket, kill it?
        initHooks(socket);
        socket.emit('loginResult', { success: true, player });
    });
});

function initHooks (socket) {
    const player = players[socket.id];

    socket.broadcast.emit('playerJoined', player);

	socket.on('getWorldState', function(){
		socket.emit('worldState', {
            levels: Game.world.levels
        });
    });
    
    socket.on('sendMessage', function(message){
        const messageText = message.message;
        const player = players[socket.id];
        if (!player) {
            console.log('socket '+socket.id+" has no player");
            return;
        }
        if (!player.currentChat) {
            console.log('player has no chat');
            return;
        }
        console.log('sending message to group ' + player.currentChat);
        io.to(player.currentChat).emit('messageSent', {
            playerId: player.playerId,
            messageText
        });
    });

    socket.on('leaveChat', function(){
        const player = players[socket.id];
        if (!player.currentChat) {
            return;
        }
        const chatId = player.currentChat;
        const chat = chats[chatId];
        if (!chat) {
            return;
        }
        leaveChat(player, socket);
        if (chat.members.length == 1) {
            leaveChat(chat.members[0]);
            delete chats[chatId];
        }
    });

	socket.on('moveTo', function(dir){
        const player = players[socket.id];
		console.log('Player '+player.playerName+" wants to move x:"+dir.dx+" y:"+dir.dy);
		var lastPlayerAction = lastActions[socket.id];
		if (lastPlayerAction && new Date().getTime() - lastPlayerAction < 30){
            socket.emit('actionFailed');
			return;
        }
        if (!player) {
            console.log('socket '+socket.id+" has no player");
            socket.emit('actionFailed');
            return;
        }
        const testLevel = Game.world.getLevel('testLevel'); //TODO: Get level from player
		if(testLevel.moveTo(player, dir.dx, dir.dy)){
            io.emit('playerMoved', {
                playerId: player.playerId,
                x: player.x,
                y: player.y
            });
        } else {
            socket.emit('actionFailed');
        }

        
		lastActions[socket.id] = new Date().getTime();

    });

    socket.on('acceptChatRequest', function(){
        const player = players[socket.id];
        const chatRequest = chatRequests[socket.id];
        socket.broadcast.to(chatRequest.fromPlayer.playerId).emit('chatRequestAccepted', {
            playerName: player.playerName
        });
        socket.emit('chatRequestAccepted', {
            playerName: chatRequest.fromPlayer.playerName
        });
        delete chatRequests[socket.id];
        const chatGroupName = 'hangout_' + (++currentChat);
        joinChat(player, socket, chatGroupName);
        joinChat(chatRequest.fromPlayer, io.sockets.connected[chatRequest.fromPlayer.playerId], chatGroupName);
    });

    function joinChat(player, socket, chatGroupName) {
        if (!chats[chatGroupName]) {
            chats[chatGroupName] = {
                members: []
            };
        }
        player.currentChat = chatGroupName;
        socket.join(chatGroupName);
        chats[chatGroupName].members.push(player);
    }

    function leaveChat(player, socket) {
        const chatId = player.currentChat;
        const chat = chats[chatId];
        if (!socket) {
            socket = io.sockets.connected[player.playerId];
        }
        io.in(chatId).emit('playerLeft', {
            playerId: player.playerId,
            playerName: player.playerName,
            conversationOver: chat.members.length == 1
        });
        if (socket) {
            socket.leave(chatId);
        }
        delete player.currentChat;
        chat.members.splice(chat.members.findIndex(p => p.playerId == player.playerId), 1);
    }

    socket.on('rejectChatRequest', function(){
        const player = players[socket.id];
        console.log('rejectChatRequest with '+chatRequests[socket.id].fromPlayer.playerId);
        socket.broadcast.to(chatRequests[socket.id].fromPlayer.playerId).emit('chatRequestRejected', {
            playerName: player.playerName
        });
        delete chatRequests[socket.id];
    });

    socket.on('nudgeChat', function(dir){
        const player = players[socket.id];
		console.log('Player '+player.playerName+" wants to chat x:"+dir.dx+" y:"+dir.dy);
		var lastPlayerAction = lastActions[socket.id];
		if (lastPlayerAction && new Date().getTime() - lastPlayerAction < 30){
            socket.emit('actionFailed');
			return;
        }
        if (!player) {
            console.log('socket '+socket.id+" has no player");
            socket.emit('actionFailed');
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
            const chat = chats[target.currentChat];
            if (chat.members.length < 6) {
                socket.emit('chatRequestAccepted', {
                    playerName: target.playerName,
                    otherPlayers: chat.members.filter(m => m.playerId == target.playerId).map(m => m.playerName)
                });
                socket.to(player.currentChat).emit('playerJoinedChat', {
                    playerId: player.playerId,
                    playerName: player.playerName
                });
                joinChat(player, socket, target.currentChat);
            } else {
                socket.emit('chatRequestRejected', {
                    playerName: player.playerName,
                    reason: "tooManyPlayers"
                });
            }
        } else {
            // Ask the player if he wants to chat
            //TODO: Ignore request if already ignored within some time
            socket.emit('chatRequested', {
                playerName: target.playerName
            });
            chatRequests[target.playerId] = {
                fromPlayer: player,
                toPlayer: target
            };
            console.log('emitting chatRequest to '+ target.playerId + ' socket');
            socket.broadcast.to(target.playerId).emit('chatRequest', {
                playerName: player.playerName
            });
        }
		lastActions[socket.id] = new Date().getTime();
    });
}

Game.start().then(() => {
    server.listen(3001, function(){
        console.log('listening on *:3001');
      });
});
