const Being = require("./Being.class");
const Tiles = require("./Tiles.enum");
const Items = require("./Items");

var Level = function(game, id){
	this.init(game, id);
}

const areas = [
	{ x: 104, y: 29, w: 5, h: 2, name: "Rogue", gameDetails: "", videoId: "T7ZVeJVOYe0", author: "Michael Toy, Glenn Wichman, Ken Arnold", playURL: ""},
	{ x: 98, y: 23, w: 2, h: 5, name: "Hack", gameDetails: "", videoId: "", author: "Jay Fenlason, Kenny Woodland, Mike Thome, Jonathan Payne", playURL: ""},
	{ x: 98, y: 12, w: 2, h: 5, name: "Nethack", gameDetails: "", videoId: "", author: "Mike Stephenson, Izchak Miller, Janet Walz", playURL: ""},
	{ x: 113, y: 23, w: 2, h: 5, name: "Moria", gameDetails: "", videoId: "MnKyvlexxgM", author: "Robert Alan Koeneke", playURL: ""},
	{ x: 113, y: 12, w: 2, h: 5, name: "Angband", gameDetails: "", videoId: "BDidsq-HQP8", author: "Alex Cutler, Andy Astrand", playURL: ""},
	{ x: 104, y: 26, w: 5, h: 2, name: "Larn ", gameDetails: "", videoId: "", author: "Noah Morgan", playURL: ""},
	{ x: 104, y: 5, w: 5, h: 2, name: "ADOM", gameDetails: "", videoId: "", author: "Thomas Biskup", playURL: ""},
]


Level.prototype = {
	loadData: function (tiles, items, data) {
		Tiles.setData(tiles);
		Items.setData(items);
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
		/*if (this.beings[x] && this.beings[x][y]){
			return false;
		}*/
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