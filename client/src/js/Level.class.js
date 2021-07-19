const Being = require("./Being.class");
const Tiles = require("./Tiles.enum");

var Level = function(game, id){
	this.init(game, id);
}

const areas = [
	{ x: 33, y: 11, w: 9, h: 8, name: "Jupiter Hell", gameDetails: "Rip and tear zombies, demons, and heavy metal monstrosities with chainguns and chainsaws.", videoId: "tp_uizEnIes", author: "Chaosforge", playURL: "https://store.steampowered.com/app/811320/Jupiter_Hell/"},
	{ x: 29, y: 41, w: 9, h: 8, name: "NovaMundi", gameDetails: "Journey through the XV Century Andes highlands uniting your people against the invaders.", videoId: "GbkcOWRY_xk", author: "Slashware", playURL: "https://store.steampowered.com/app/1370940/NovaMundi_The_Spear_of_Chaqun/"},
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