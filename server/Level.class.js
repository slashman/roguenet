var Level = function(id){
	this.init(id);
}

const geoObjects = [
	"Leather armor",
	"Studded leather armor",
	"Ring mail",
	"Scale mail",
	"Chain mail",
	"Splint mail",
	"Banded mail",
	"Plate mail",
	"Arrow",
	"Crossbow",
	"Crossbow bolt",
	"Dagger",
	"Dart",
	"Long sword",
	"Mace",
	"Rock",
	"Short bow",
	"Sling",
	"Shuriken",
	"Spear",
	"Two-handed sword",
	"Staff",
	"Wand",

	"Ring of Add strength",
	"Ring of Adornment",
	"Ring of Aggravate monsters",
	"Ring of Dexterity",
	"Ring of Increase damage",
	"Ring of Maintain armor",
	"Ring of Protection",
	"Ring of Regeneration",
	"Ring of Searching",
	"Ring of See invisible",
	"Ring of Slow digestion",
	"Ring of Stealth",
	"Ring of Sustain strength",
	"Ring of Teleportation",

	"Potion of Blindness",
	"Potion of Confusion",
	"Potion of Extra healing",
	"Potion of Gain strength",
	"Potion of Hallucination",
	"Potion of Haste self",
	"Potion of Healing",
	"Potion of Levitation",
	"Potion of Magic detection",
	"Potion of Monster detection",
	"Potion of Paralysis",
	"Potion of Poison",
	"Potion of Raise level",
	"Potion of Restore strength",
	"Potion of See invisible",
	"Potion of Thirst quenching"
];

Level.prototype = {
	init: function(id){
		this.map = [];
		this.beings = [];
		this.beingsList = [];
		this.exits = [];
		this.items = [];
		this.id = id;
		this.geo = "Cheap plastic imitation of Amulet of Yendor.";
		this.geoCacher = "Slashie";
		this.geoNumber = 1;
	},
	addBeing: function(being, x, y){
		this.beingsList.push(being);
		if (!this.beings[x])
			this.beings[x] = [];
		being.x = x;
		being.y = y;
		this.beings[x][y] = being;
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
	getItem: function(x, y){
		if (!this.items[x])
			return false;
		return this.items[x][y];
	},
	getBeing: function(x, y){
		if (!this.beings[x])
			return false;
		return this.beings[x][y];
	},
	removeItem: function(x, y){
		if (!this.items[x])
			this.items[x] = [];
		this.items[x][y] = false;
	},
	removeBeing: function(username) {
		const beingIndex = this.beingsList.findIndex(being => being.username == username);
		if (beingIndex != -1){
			const being = this.beingsList[beingIndex];
			delete this.beings[being.x][being.y];
			this.beingsList.splice(beingIndex, 1);
		}
	},
    moveTo: function(being, dx,dy){		
		if (!this.canWalkTo(being.x+dx,being.y+dy)){
			return false;
		}
		const tx = being.x + dx;
		const ty = being.y + dy;
		let result = true;
		if (tx == 5 && ty == 1) {
			if (!being.hasKey) {
				return "needKey";
			}
		}
		if (tx == 149 && ty == 80) {
			if (!being.hasKey) {
				being.hasKey = true;
				result = "pickedKey";
			}
		}
		if (tx == 6 && ty == 7) {
			if (!being.hadFoundGeo) {
				being.hadFoundGeo = true;
				result = "setGeo";
			} else {
				result = "foundGeo";
			}
		}
		this.beings[being.x][being.y] = false;
		being.x = being.x + dx;
		being.y = being.y + dy;
		if (!this.beings[being.x])
			this.beings[being.x] = [];
		this.beings[being.x][being.y] = being;
		return result;
	},
	getPlayerByUsername: function (username) {
		return this.beingsList.find(being => being.username == username);
	},
	newGeo: function (being) {
		this.geo = geoObjects[Math.floor(Math.random()*geoObjects.length)];
		this.geoNumber++;
		this.geoCacher = being.playerName;
	}
}

module.exports = Level;