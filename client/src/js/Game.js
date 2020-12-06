var Display = require('./Display');
var Client = require('./Client');
var World = require('./World');
var Player = require('./Player');
var Input = require('./Input');
var Talk = require('./Talk');

window.debug = function(a, b){
	console.log(a, b);
}

var Game = {
	start: function(){
		this.display = Display;
		this.world = World;
		this.player = Player;
		this.input = Input;
		this.talkManager = Talk;
		this.client = Client;
		Client.init(this);
		Display.init(this);
		Player.init(this);
		Talk.init(this);
		Input.init(this, Client);
		Display.refresh();
	},
	unload: function () {
		Client.disconnect();
	},
	login: function (username, password) { 
		Client.login(username, password)
		.then(result => {
			if (result.success) {
				return World.init(this, Client)
				.then(() => {
					Display.mode = 'GAME';
					Input.setMode('MOVEMENT');
					this.player.updateFOV();
					Display.textBox.setText("Welcome back " + this.player.being.playerName +".");
				});
			} else {
				Display.loginFailed();
			}
		});
	},
	create: function (username, password) { 
		Client.create(username, password)
		.then(result => {
			if (result.success) {
				return World.init(this, Client)
				.then(() => {
					Display.mode = 'GAME';
					Input.setMode('MOVEMENT');
					this.player.updateFOV();
					Display.textBox.setText("Welcome to the temple, " + this.player.being.playerName +".");
				});
			} else {
				Display.createFailed();
			}
		});
	}
}

window.Game = Game;

module.exports = Game;