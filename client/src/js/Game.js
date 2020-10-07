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
	login: function (username, password) { 
		Client.login(username, password)
		.then(result => {
			if (result.success) {
				return World.init(this, Client)
				.then(() => {
					this.player.updateFOV();
					Display.mode = 'GAME';
					Input.mode = 'MOVEMENT';
					Display.refresh();
					Display.textBox.setText("Welcome back " + this.player.being.playerName +". Press [?] for help.");
				});
			} else {
				Display.loginFailed();
			}
		});
	}
}

window.Game = Game;

module.exports = Game;