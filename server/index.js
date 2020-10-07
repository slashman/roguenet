var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var players = {};
var lastActions = {};

const Game = require('./Game');
const Being = require('./Being.class');

const testUsers = [
    {
        user: 'rodney',
        password: 'pwd',
        playerName: 'Rodney'
    },
    {
        user: 'rodinia',
        password: 'pwd',
        playerName: 'Rodinia'
    },
    {
        user: 'slashie',
        password: 'pwd',
        playerName: 'Slashie'
    },
    {
        user: 'gaby',
        password: 'pwd',
        playerName: 'Gaby'
    }
];

function initPlayer(playerObj, socketId) {
    const testLevel = Game.world.getLevel('testLevel');
    const player = new Being(testLevel);
    player.playerId = socketId;
    player.playerName = playerObj.playerName;
    player.username = playerObj.user;
    testLevel.addBeing(player, 37, 10);
    return player;
}

Game.start();

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
        const playerObject = {
            playerId: player.playerId,
            x: player.x,
            y: player.y,
            playerName: player.playerName
        };
        socket.emit('loginResult', { success: true, playerObject });
    });
});

function initHooks (socket) {
    const player = players[socket.id];

    const playerObject = {
        playerId: player.playerId,
        x: player.x,
        y: player.y,
        playerName: player.playerName
    };

    socket.broadcast.emit('playerJoined', playerObject);

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
        //TODO: Check if player is in chat area
        io.emit('messageSent', {
            playerId: player.playerId,
            messageText
        });
    });

	socket.on('moveTo', function(dir){
        const player = players[socket.id];
		console.log('Player '+player.name+" wants to move x:"+dir.dx+" y:"+dir.dy);
		var lastPlayerAction = lastActions[socket.id];
		if (lastPlayerAction && new Date().getTime() - lastPlayerAction < 30){
			return;
        }
        if (!player) {
            console.log('socket '+socket.id+" has no player");
            return;
        }
        const testLevel = Game.world.getLevel('testLevel'); //TODO: Get level from player
		if(testLevel.moveTo(player, dir.dx, dir.dy)){
            // Always emit playerMoved else the client gets stuck
        }
        io.emit('playerMoved', {
            playerId: player.playerId,
            x: player.x,
            y: player.y
        });
		lastActions[socket.id] = new Date().getTime();

	});
}

server.listen(3001, function(){
  console.log('listening on *:3001	');
});