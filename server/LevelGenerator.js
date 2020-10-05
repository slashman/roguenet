var Tiles = require('./Tiles.enum');
// var Item = require('./Item.class');
var Random = require('./Random');

const map = [
	"                                      WWWWWWW                                   ",
	"                                      WWWWWWW                                   ",
	"                                      WWWWWWW                                   ",
	"    WWWWWWWWWWWWW                     W     W                                   ",
	"    W           W                     W     W                                   ",
	"    W           W                     WWW WWW       WWWWWWWWWWWWW               ",
	"    W           WWWWWWWWWWWWW WWWWWWWWWWW WWWWWW    W           W               ",
	"    W           ............W W                W    W           W               ",
	"    W           WWWWWWWWWWW.WWW                WWWWWW           W               ",
	"    W           W         W....                .......          W               ",
	"    W           W         WWWWW                WWWWWW           W               ",
	"    WWWWWWWWWWWWW             W                W    W           W               ",
	"                              W                W    W           W               ",
	"                              W                W    WWWWWWWWWWWWW               ",
	"                              W                W    WWWWWWWWWWWWW               ",
	"                              W                W    WWWWWWWWWWWWW               ",
	"                              W                W    WWWWWWWWWWWWW               ",
	"                              WWWWWWWWW  WWWWWWW                                ",
	"                                      W  W                                      ",
	"                                      W  W                                      ",
	"                                      W  W                                      ",
	"                             WWWWWWWWWW  WWWWWWW                                ",
	"                             W                 W                                ",
	"                             W                 W                                ",
	"                             W                 W                                ",
	"                             WWWWWWWWWWWWWWWWWWW                                ",
	"                                                                                "
];

module.exports = {
	generateTestLevel: function(level){
		for (var x = 0; x < 80; x++){
			level.map[x] = [];
			for (var y = 0; y < 25; y++){
				var char = map[y].charAt(x);
				level.map[x][y] = char == 'W' ? Tiles.WALL : Tiles.FLOOR;
			}
		}
		// level.addItem(new Item(Items.IRON_SWORD), Random.n(0,79), Random.n(0,25));
	},

	generateTestLevelR: function(level){
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