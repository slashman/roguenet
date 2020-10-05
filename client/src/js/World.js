const Level = require("./Level.class");

module.exports = {
	levels: {},
	init: function(game, client){
		this.game = game;
		this.player = game.player;
		client.world = this;
		return client.getWorldState().then(worldState => {
			this.level = new Level(this.game);
			this.level.loadData(worldState.levels['testLevel']);
			this.levels['testLevel'] = this.level;
			this.player.setBeing(this.level.getPlayer(worldState.playerId));
		});
	}
}