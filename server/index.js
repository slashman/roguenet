var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var players = {};
var lastActions = {};

const Game = require('./Game');
const Being = require('./Being.class');

const names = ['Rodney', 'Rondolfo', 'Biskucho', 'Kornelio', 'Anormal', 'Kawawa', 'Wakaka', 'Romponolo'];
let currentName = 0;

function initPlayer(playerId) {
    const testLevel = Game.world.getLevel('testLevel');
    const player = new Being(testLevel);
    player.playerId = playerId;
    currentName++;
    if (currentName == names.length) currentName = 0;
    player.playerName = names[currentName];
    testLevel.addBeing(player, 37, 10);
    return player;
}

Game.start();

io.on('connection', function(socket){
    console.log('Someone connected to us');
    if (players[socket.id]) {
        // Welcome back
    } else {
        players[socket.id] = initPlayer(socket.id);
    }
    const player = players[socket.id];

    const playerObject = {
        playerId: player.playerId,
        x: player.x,
        y: player.y,
        playerName: player.playerName
    };

    socket.emit('playerLoggedIn', playerObject);

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

});

var canConquer = function (lastAction, map, where, color){
	if(!lastAction){
		return true;
	}
	if(where.y > 0 && map[where.x][where.y - 1] === color) { //same color up
		console.log('same color up');
		return true;
	} else if (where.y < model.height-1 && map[where.x][where.y + 1] === color){ //same color down
		console.log('same color down');
		return true;
	} else if (where.x > 0 && map[where.x - 1][where.y] === color ){ //same color left
		console.log('same color left');
		return true;
	} else if (where.x < model.width - 1 && map[where.x + 1][where.y] === color ){ //same color right
		console.log('same color right');
		return true;
	} 
	return false;
};

server.listen(3001, function(){
  console.log('listening on *:3001	');
});