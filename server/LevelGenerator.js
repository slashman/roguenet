var Tiles = require('./Tiles.enum');
// var Item = require('./Item.class');
var Random = require('./Random');

module.exports = {
	generateTestLevel: function(level){
		for (var x = 0; x < 80; x++){
			level.map[x] = [];
			for (var y = 0; y < 25; y++){
				level.map[x][y] = Tiles.GRASS;
			}
		}
		for (var i = 0; i < 40; i++){
			level.map[Random.n(0,79)][Random.n(0,24)] = Tiles.BUSH;
		}
		for (var i = 0; i < 40; i++){
			level.map[Random.n(0,79)][Random.n(0,24)] = Tiles.WATER;
		}
		// level.addItem(new Item(Items.IRON_SWORD), Random.n(0,79), Random.n(0,25));
	}
}