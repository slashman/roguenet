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
	removeItem: function(x, y){
		if (!this.items[x])
			this.items[x] = [];
		this.items[x][y] = false;
    },
    moveTo: function(being, dx,dy){		
		if (!this.canWalkTo(being.x+dx,being.y+dy)){
			return false;
		}
		this.beings[being.x][being.y] = false;
		being.x = being.x + dx;
		being.y = being.y + dy;
		if (!this.beings[being.x])
			this.beings[being.x] = [];
		this.beings[being.x][being.y] = being;
		return true;
	}
}

module.exports = Level;