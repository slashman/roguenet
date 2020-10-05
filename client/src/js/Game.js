var Display = require('./Display');
var Client = require('./Client');
var World = require('./World');
var Player = require('./Player');
var Input = require('./Input');

var Game = {
	start: function(){
		this.display = Display;
		this.world = World;
		this.player = Player;
		this.input = Input;
		Client.init(this);
		Display.init(this);
		Player.init(this);
		Input.init(this, Client);
		Display.textBox.setText("Welcome to RogueNet - Getting Game State");
		World.init(this, Client).then(() => {
			this.player.updateFOV();
			Display.refresh();
			Display.textBox.setText("Welcome to the Virtual Roguelike Space! Move around using the arrow keys, type short messages and players near will hear you. Press [?] for help.");
		});
	}
}

window.Game = Game;

module.exports = Game;