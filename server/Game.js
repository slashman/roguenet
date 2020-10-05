var World = require('./World');

var Game = {
	start: function(){
		this.world = World;
		World.init(this);
	}
}

module.exports = Game;