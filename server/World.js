var Level = require('./Level.class');
const LevelGenerator = require('./LevelGenerator');

module.exports = {
	levels: {},
	init: function(game){
        this.game = game;
	},
	getLevel: function(levelId){
		this.level = this.levels[levelId];
		if (!this.levels[levelId]){
			this.level = new Level(levelId);
			LevelGenerator.generateTestLevel(this.level);
			this.levels[levelId] = this.level;
        }
        return this.levels[levelId];
	}
}