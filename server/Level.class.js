var Level = function(id){
	this.init(id);
}

Level.prototype = {
	init: function(id){
		this.map = [];
		this.beings = [];
		this.beingsList = [];
		this.exits = [];
		this.items = [];
		this.id = id;
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
	}
}

module.exports = Level;