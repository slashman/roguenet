var Level = require('./Level.class');
const LevelGenerator = require('./LevelGenerator');
const LevelLoader = require('./LevelLoader');

module.exports = {
	levels: {},
	init: async function(game){
		this.game = game;
		const level = new Level("testLevel");
		//LevelGenerator.generateTestLevel(level);
		return LevelLoader.loadLevel(level).then(() => {
			this.levels.testLevel = level;
		});
	},
	getLevel: function(levelId){
		this.level = this.levels[levelId];
        return this.levels[levelId];
	}
}