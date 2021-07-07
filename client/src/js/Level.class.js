const Being = require("./Being.class");
const Tiles = require("./Tiles.enum");

var Level = function(game, id){
	this.init(game, id);
}

const areas = [
	{ x: 41, y: 49, w: 7, h: 6, // Eastern Gardens
		name: 'Rainy Day',
		videoId: '8_VOIQDVtHs',
		gameDetails: "An evil corporation is draining the planet's resources, the only way to stop them is to blow the core of their four reactors in the Kradia Valley.",
		author: 'slashie and quietgecko',
		playURL: 'https://slash.itch.io/rainy-day',
	},
	{ x: 7, y: 21, w: 12, h: 6, // Inside the temple
		name: 'Shattered Forest',
		videoId: "_CbL4yBwJYA",
		gameDetails: 'Evil spirits have shattered the forest! Master the broken terrain and find the root cause of all this chaos!',
		author: 'Verdagon',
		playURL: 'https://verdagon.itch.io/shattered-forest',
	},
	{ x: 7, y: 30, w: 12, h: 6, // Inside the temple
		name: 'Rune Master',
		videoId: undefined,
		gameDetails: "Runemaster is roguelike heavly focused on spellcrafting. I've tried to give magic a new face, complex but rewarding.",
		author: 'Samel',
		playURL: 'https://samelinux.itch.io/runemaster',
	},
	{ x: 36, y: 21, w: 12, h: 6, // Inside the temple
		name: 'SUV Dungeon',
		gameDetails: 'Sport utility dungeon crawling tactics',
		videoId: "TTQtAgEtDsg",
		author: 'NeverK',
		playURL: 'https://never-k.itch.io/suv-dungeon',
	},
	{ x: 36, y: 30, w: 12, h: 6,  // Inside the temple
		name: 'OctoRogue',
		videoId: "eXQg_hH-Vqw",
		gameDetails: 'Play as an octopus in a traditional roguelike',
		author: 'kylep',
		playURL: 'https://kylep.itch.io/octorogue',
	},
	{ x: 20, y: 37, w: 6, h: 12, // Inside the temple
	  name: 'Medieval Upbringing',
	  gameDetails: 'Medieval childhood simulator as a multidimensional optimization problem.',
	  author: 'ostr',
	  playURL: 'https://ostr.itch.io/medieval-upbringing',
	  videoId: 'sH5L152NeFY'
	},
	{ x: 20, y: 49, w: 6, h: 12, // Inside the temple
		name: 'Furball Catacombs',
		gameDetails: 'Be a cat. Hunt mice in a labyrinth that defies geometry. Lick yourself a lot. Become very sharp.',
		author: 'laurheth',
		playURL: 'https://laurheth.itch.io/furball-catacombs',
		videoId: "IUBBoQe_s0U"
	},
	{ x: 29, y: 49, w: 6, h: 12, // Inside the temple
		name: 'Rogue of the Seven Seas',
		gameDetails: 'Beginning with a simple dingy and 100 coins to your name, you sail from island to island.',
		author: 'gamepopper',
		playURL: 'https://gamepopper.itch.io/rogue-of-the-seven-seas',
		videoId: "DWZWm9Z4ek8"
	},
	{ x: 41, y: 60, w: 5, h: 8, // Eastern Gardens
		name: 'Wyrm\'s Wrath',
		gameDetails: 'Traditional roguelike meets deck-builder meets snake. Play as a multi-tiled wyrm, find the rogue who killed your mother, and eat him.',
		author: 'mscottmoore',
		playURL: 'https://mscottmoore.itch.io/wyrms-wrath',
		videoId: 'dnyzoWtYSt0'
	},
	{ x: 41, y: 70, w: 5, h: 8, // Eastern Gardens
		name: 'Mantis',
		gameDetails: 'Fast-paced dungeon crawler.',
		author: 'suricatta413',
		playURL: 'https://suricatta413.itch.io/mantis',
		videoId: 'Lexb8Ia1Q3M'
	},
	{ x: 29, y: 37, w: 6, h: 12, // Inside the temple
		name: 'Cardinal Ramship Pirate',
		gameDetails: 'A burn-based [sic] ram-em-up.',
		author: 'st33d',
		playURL: 'https://st33d.itch.io/cardinal-ramship-pirate',
		videoId: "6rt24KAVmt0"
	}
]


Level.prototype = {
	loadData: function (tiles, data) {
		Tiles.setData(tiles);
		this.map = data.map.map(mapColumn => mapColumn.map (tile => Tiles[tile.tileId]));
		this.beings = [];
		this.beingsList = [];
		this.playersMap = {};
		data.beingsList.forEach(beingData => {
			const being = new Being(this, beingData);
			this.addBeing(being, being.x, being.y);
		});
		this.exits = [];
		this.items = [];
	},
	init: function(game){
		this.game = game;
		this.player = game.player;
	},
	beingsTurn: function(){
		for (var i = 0; i < this.beingsList.length; i++){
			this.beingsList[i].act();
		}
		this.player.updateFOV();
	},
	addBeing: function(being, x, y){
		this.beingsList.push(being);
		if (!this.beings[x])
			this.beings[x] = [];
		being.x = x;
		being.y = y;
		this.beings[x][y] = being;
		this.playersMap[being.playerId] = being;
	},
	canWalkTo: function(x, y){
		try {
			if (this.map[x][y].solid){
				return false;
			}
		} catch (e){
			// Catch OOB
			return false;
		}
		if (this.beings[x] && this.beings[x][y]){
			return false;
		}
		if (this.player && this.player.x === x && this.player.y === y)
			return false;
		return true;
	},
	addExit: function(x,y, levelId, tile){
		if (!this.map[x])
			this.map[x] = [];
		this.map[x][y] = tile;
		if (!this.exits[x])
			this.exits[x] = [];
		this.exits[x][y] = levelId;
	},
	addItem: function(item, x, y){
		if (!this.items[x])
			this.items[x] = [];
		this.items[x][y] = item;
	},
	getBeing: function(x, y){
		if (!this.beings[x])
			return false;
		return this.beings[x][y];
	},
	getItem: function(x, y){
		if (!this.items[x])
			return false;
		return this.items[x][y];
	},
	removeItem: function(x, y){
		if (!this.items[x])
			this.items[x] = [];
		this.items[x][y] = false;
	},
	removeBeing: function(id) {
		const beingIndex = this.beingsList.findIndex(being => being == this.playersMap[id]);
		if (beingIndex != -1){
			const being = this.beingsList[beingIndex];
			delete this.beings[being.x][being.y];
			this.beingsList.splice(beingIndex, 1);
			delete this.playersMap[being.playerId];
		}
	},
	getPlayer: function (id) {
		return this.playersMap[id];
	},
	getArea: function (x, y) {
		return areas.find(a => x >= a.x && x < a.x + a.w && y >= a.y && y < a.y + a.h);
	}
}

module.exports = Level;