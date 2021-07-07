const Being = require("./Being.class");
const Tiles = require("./Tiles.enum");

var Level = function(game, id){
	this.init(game, id);
}

const areas = [
	{ x: 41, y: 20, w: 12, h: 6, name: "Enter the Chronosphere", gameDetails: "A tactical bullet hell roguelike where each turn is a slice of realtime action", videoId: "9ay2eHL9BOk", author: "Rhys and Ned", playURL: "https://rhys_vdw.itch.io/enter-the-chronosphere"},
	{ x: 70, y: 20, w: 12, h: 6, name: "Autonomy", gameDetails: "You play an Ai that must take over the machines around it to avoid destruction and escape.", videoId: "YXu_EOaWF-k", author: "Jay", playURL: "https://jaysgame.itch.io/autonomy"},
	{ x: 41, y: 30, w: 12, h: 6, name: "Bloplike", gameDetails: "Each entity's magical powers are wirtten in its DNA. Build your own from Trigger and Effect genes.", videoId: "h3_RNZ8LPsM", author: "Drestin", playURL: "https://drestin.itch.io/7rld2021-bloplike"},
	{ x: 70, y: 30, w: 12, h: 6, name: "Duntris", gameDetails: "", videoId: "5ZRxFXSumPo", author: "anttihaavikko", playURL: "https://anttihaavikko.itch.io/duntris"},
	{ x: 26, y: 20, w: 10, h: 6, name: "Pieux", gameDetails: "Using your humble armaments and dynamic movement, atone for your sins and find peace among chaos", videoId: "b6kN5rxc_FY", author: "Slogo", playURL: "https://slogo.itch.io/pieux"},
	{ x: 87, y: 20, w: 10, h: 6, name: "Shackles of the Stellar Tyrant", gameDetails: "A fully physically simulated action roguelike", videoId: "hwtjQBYAwqU", author: "Chao", playURL: "https://chao.itch.io/shackles-of-the-stellar-tyrant"},
	{ x: 26, y: 30, w: 10, h: 6, name: "Amoeba Roguelike", gameDetails: "Play as a giant, constantly evolving amoeba and fight off intensifying waves of humans.", videoId: "8JVWJDPI-rw", author: "Vectis", playURL: "https://vectis.itch.io/amoeba-roguelike"},
	{ x: 87, y: 30, w: 10, h: 6, name: "Rogue Meteor", gameDetails: "A Retro Sci-Fi Rogue-ish game where you try to get you off this god forsaken rock.", videoId: "C5aSHwI0Jv4", author: "Ponywolf", playURL: "https://ponywolf.itch.io/roguemeteor"},
	{ x: 13, y: 20, w: 11, h: 6, name: "Dungeon Tetris", gameDetails: "A traditional roguelike, with a tetris twist", videoId: "dh8b0tRHgUA", author: "Numeron", playURL: "https://numeron.itch.io/dungeon-tetris"},
	{ x: 98, y: 20, w: 11, h: 6, name: "Idol Knight", gameDetails: "A small scale tactical roguelike inspired by classics like Hoplite or Imbroglio.", videoId: "MJwC69LyTu8", author: "Tinytouchtales", playURL: "https://tinytouchtales.itch.io/idolknight"},
	{ x: 13, y: 30, w: 11, h: 6, name: "Rogue Impact", gameDetails: "Genshin Impact inspired Roguelike.  Party-based and Gacha mechanics!", videoId: "J0wnqmOlaiw", author: "Jeff Lait", playURL: "https://jmlait.itch.io/rogue-impact"},
	{ x: 98, y: 30, w: 11, h: 6, name: "Runemaster", gameDetails: "You are a runemaster that crafts his own spells combining runes.", videoId: "", author: "Luca Giacometti", playURL: "https://samelinux.itch.io/runemaster"}
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