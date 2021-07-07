var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var players = {};

const Game = require('./Game');
const Being = require('./Being.class');
const Tiles = require('./Tiles.enum');
const ChatRequests = require('./ChatRequests');
const AdminActions = require('./AdminActions');
const Chats = require('./Chats');
const ActionRateLimiter = require('./ActionRateLimiter');
const { join } = require('path');

const COLORS = [
//    [0, 0, 0],
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

const users = [
    {
        user: 'slashie',
        password: 'pwd',
        playerName: 'Slashie',
        colorIndex: 6,
        isAdmin: true
    }
];

function initPlayer(playerObj, socketId) {
    const testLevel = Game.world.getLevel('testLevel');
    const player = new Being(testLevel);
    player.playerId = socketId;
    player.playerName = playerObj.playerName;
    player.username = playerObj.user;
    player.colorIndex = playerObj.colorIndex;
    player.color = COLORS[playerObj.colorIndex];
    testLevel.addBeing(player, 61, 86);
    return player;
}

ChatRequests.init(io, players);
Chats.init(io, players);
AdminActions.init(io, players);

io.on('connection', function(socket){
    console.log('Connection detected, stand by for login');
    // Stand by for login

    socket.on('login', function(credentials){
        const username = credentials.username;
        const password = credentials.password;
        const create = credentials.create;
        let user;
        if (create) {
            user = users.find(p => p.user == username);
            if (user) {
                socket.emit('loginResult', { success: false }); // Already exists
                console.log('Create Player failed: User '+username+" already exists");
                return;
            }
            user = {
                user: username,
                password: password,
                playerName: username,
                colorIndex: 6
            }
            users.push(user);
        } else {
            user = users.find(p => p.user == username && p.password == password);
            if (!user) {
                socket.emit('loginResult', { success: false });
                console.log('Login failed for user '+username);
                return;
            }
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
                console.log('Disconnecting existing client for user '+username+ ".");
                oldSocket.emit('clientChanged');
                oldSocket.disconnect();
            }
            player.playerId = socket.id;
        }
        initHooks(socket, user);
        console.log('User '+username+ " logs in");
        socket.emit('loginResult', { success: true, player, isAdmin: user.isAdmin == true });
    });
});

function initHooks (socket, user) {
    const player = players[socket.id];

    socket.broadcast.emit('playerJoined', player);

    socket.on('disconnect', (reason) => {
        console.log('Player '+player.playerName+" disconnecting :"+reason);
        if (reason === 'client namespace disconnect'/* || reason === 'ping timeout'*/) {
            Chats.leaveChatMessage(socket);
            socket.broadcast.emit('playerDisconnected', player);
            Game.world.getLevel('testLevel').removeBeing(player.username);
            delete players[socket.id];
            return;
        }
    });

	socket.on('getWorldState', function(){
		socket.emit('worldState', {
            tiles: Tiles,
            levels: Game.world.levels
        });
    });

    socket.on('changeColor', function(){
        const player = players[socket.id];
        if (ActionRateLimiter.limitAction(socket)) {
            return;
        }
        if (!player) {
            return;
        }
        player.colorIndex++;
        if (player.colorIndex == COLORS.length - 1) {
            player.colorIndex = 0;
        }
        player.color = COLORS[player.colorIndex];

        io.emit('playerChangedColor', {
            playerId: player.playerId,
            color: player.color
        });
    });
    
    socket.on('moveTo', function(dir){
        const player = players[socket.id];
        // console.log('Player '+player.playerName+" wants to move x:"+dir.dx+" y:"+dir.dy);
        if (ActionRateLimiter.limitAction(socket)) {
			return;
        }
        if (!player) {
            console.log('socket '+socket.id+" has no player");
            socket.emit('actionFailed');
            return;
        }
        const testLevel = Game.world.getLevel('testLevel'); //TODO: Get level from player
        const result = testLevel.moveTo(player, dir.dx, dir.dy);
        if(result === "needKey") {
            socket.emit('serverMessage', { message: "It's locked." });
            socket.emit('actionFailed');
		} else if(result){
            io.emit('playerMoved', {
                playerId: player.playerId,
                x: player.x,
                y: player.y
            });
            if (result === "pickedKey") {
                socket.emit('serverMessage', { message: "You pick a red key." });
            } else if (result === "setGeo") {
                const currentGeo = testLevel.geo;
                const currentGeoCacher = testLevel.geoCacher;
                testLevel.newGeo(player);
                socket.emit('serverMessage', { message: "You pick the " + currentGeo + " left by " + currentGeoCacher + ", and drop a " + testLevel.geo + ". You are #"+testLevel.geoNumber+" to find the cache." });
            } else if (result === "foundGeo") {
                socket.emit('serverMessage', { message: "There is a " + testLevel.geo + " here, cached by " + testLevel.geoCacher + " (#" + testLevel.geoNumber + ")." });
            }
        } else {
            socket.emit('actionFailed');
        }
        ActionRateLimiter.update(socket);
    });
    if (user.isAdmin) {
        AdminActions.bindSocket(socket);
    }

    ChatRequests.bindSocket(socket);
    Chats.bindSocket(socket);
}

Game.start().then(() => {
    server.listen(3001, function(){
        console.log('listening on *:3001');
      });
});
