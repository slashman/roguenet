const Level = require("./Level.class");

module.exports = {
	levels: {},
	init: function(game, client){
		this.game = game;
		this.player = game.player;
		client.world = this;
		return client.getWorldState().then(worldState => {
			this.level = new Level(this.game);
			this.level.loadData(
				worldState.tiles, 
				worldState.items,
				worldState.levels['testLevel']
			);
			this.levels['testLevel'] = this.level;
			const playerId = this.player.playerId;
			const playerBeing = this.level.getPlayer(playerId);
			if (!playerBeing) {
				throw new Error("Player character not loaded into level");
			}
			this.player.setBeing(playerBeing);
		});
	}
}