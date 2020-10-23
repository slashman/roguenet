var World = require('./World');

var Game = {
	start: async function(){
		this.world = World;
		return World.init(this);
	}
}

module.exports = Game;