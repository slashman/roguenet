var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var players = {};

const Game = require('./Game');
const Being = require('./Being.class');
const Tiles = require('./Tiles.enum');
const ChatRequests = require('./ChatRequests');
const Chats = require('./Chats');
const ActionRateLimiter = require('./ActionRateLimiter');
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
    testLevel.addBeing(player, 27, 86);
    return player;
}

ChatRequests.init(io, players);
Chats.init(io, players);

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
        if (player.playerId != socket.id) {
            const oldSocket = io.sockets.connected[player.playerId];
            if (oldSocket) {
                oldSocket.emit('clientChanged');
                oldSocket.disconnect();
            }
            player.playerId = socket.id;
        }
        initHooks(socket);
        socket.emit('loginResult', { success: true, player });
    });
});

function initHooks (socket) {
    const player = players[socket.id];

    socket.broadcast.emit('playerJoined', player);

	socket.on('getWorldState', function(){
		socket.emit('worldState', {
            tiles: Tiles,
            levels: Game.world.levels
        });
    });
    
    socket.on('moveTo', function(dir){
        const player = players[socket.id];
        console.log('Player '+player.playerName+" wants to move x:"+dir.dx+" y:"+dir.dy);
        if (ActionRateLimiter.limitAction(socket)) {
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
        ActionRateLimiter.update(socket);
    });

    ChatRequests.bindSocket(socket);
    Chats.bindSocket(socket);
}

Game.start().then(() => {
    server.listen(3001, function(){
        console.log('listening on *:3001');
      });
});
