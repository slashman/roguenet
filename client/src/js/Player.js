module.exports = {
	MAX_SIGHT_RANGE: 10,
	being: null,
	visible: [],
	memory: {},
	items: [],
	seenBeings: [],
	init: function(game){
		this.game = game;
		for (var j = -this.MAX_SIGHT_RANGE; j <= this.MAX_SIGHT_RANGE; j++){
			this.visible[j] = [];
		}
	},
	setBeing: function(being) {
		this.being = being;	
	},
	tryMove: function(dir){
		const level = this.game.world.level;
		const being = level.getBeing(this.being.x + dir.x, this.being.y + dir.y);
		if (being) {
			if (!this.game.talkManager.isTalkActive && !this.game.talkManager.isYellActive) {
				this.game.client.nudgeChat(dir.x, dir.y);
				this.game.input.inputEnabled = true;
				return;
			} else {
				// TODO: Inspect!
			}
		}
		if (!level.canWalkTo(this.being.x + dir.x, this.being.y + dir.y)){
			this.game.input.inputEnabled = true;
			return;
		}
		this.game.client.moveTo(dir.x, dir.y);
	},
	remember: function(x, y){
		var memory = this.memory[this.game.world.level.id];
		if (!memory){
			memory = [];
			this.memory[this.game.world.level.id] = memory;
		}
		if (!memory[x]){
			memory[x] = [];
		}
		memory[x][y] = true;
	},
	remembers: function(x, y){
		var memory = this.memory[this.game.world.level.id];
		if (!memory){
			return false;
		}
		if (!memory[x]){
			return false;
		}
		return memory[x][y] === true;
	},
	endTurn: function(){
		this.updateFOV();
		this.game.input.inputEnabled = true;
	},
	canSee: function(dx, dy){
		try {
			return this.visible[dx][dy] === true;
		} catch(err) {
			// Catch OOB
			return false; 
		}
	},
	getSightRange: function(){
		return 15;
	},
	addToSeenBeings(being) {
		this.seenBeings.push(being);
	},
	updateFOV: function(){
		/*
		 * This function uses simple raycasting, 
		 * use something better for longer ranges
		 * or increased performance
		 */
		this.seenBeings = [];
		this.addToSeenBeings(this.being);
		for (var j = -this.MAX_SIGHT_RANGE; j <= this.MAX_SIGHT_RANGE; j++)
			for (var i = -this.MAX_SIGHT_RANGE; i <= this.MAX_SIGHT_RANGE; i++)
				this.visible[i][j] = false;
		var step = Math.PI * 2.0 / 1080;
		for (var a = 0; a < Math.PI * 2; a += step)
			this.shootRay(a);
		this.game.display.peopleList.setData(this.seenBeings);
		this.game.display.refresh();
	},
	shootRay: function (a) {
		var step = 0.3333;
		var maxdist = this.getSightRange() < this.MAX_SIGHT_RANGE ? this.getSightRange() : this.MAX_SIGHT_RANGE;
		maxdist /= step;
		var dx = Math.cos(a) * step;
		var dy = -Math.sin(a) * step;
		var xx = this.being.x, yy = this.being.y;
		for (var i = 0; i < maxdist; ++i) {
			var testx = Math.round(xx);
			var testy = Math.round(yy);
			if (!this.visible[testx-this.being.x][testy-this.being.y]) {
				const being = this.game.world.level.getBeing(testx, testy);
				if (being && being != this.being)
					this.addToSeenBeings(being);
			}
			this.visible[testx-this.being.x][testy-this.being.y] = true;
			this.remember(testx, testy);
			try { 
				if (this.game.world.level.map[testx][testy].opaque)
					return;
			} catch(err) {
				// Catch OOB
				return; 
			}
			xx += dx; yy += dy;
		}
	},
	canPick: function(){
		return this.items.length < 24;
	},
	addItem: function(item){
		if (this.items.length === 24){
			return;
		}
		this.items.push(item);
		this.items.sort(this.itemSorter);
	},
	removeItem: function(item){
		this.items.splice(this.items.indexOf(item), 1);
		this.items.sort(this.itemSorter);	
	},
	itemSorter: function(a, b){
		if (a.def.type.name === b.def.type.name){
			return a.def.name > b.def.name ? 1 : -1;
		} else {
			return a.def.type.name > b.def.type.name ? 1 : -1;
		}
	},
	tryPickup: function(){
		var item = this.game.world.level.getItem(this.being.x, this.being.y);
		if (item){
			if (!this.canPick()){
				this.game.display.message("You can't pickup the "+item.def.name);
			} else {
				this.game.display.message("You pickup the "+item.def.name);
				this.game.world.level.removeItem(this.being.x, this.being.y);
				this.addItem(item);
			}
		}
	},
	tryDrop: function(item){
		var underItem = this.game.world.level.items[this.being.x] && this.game.world.level.items[this.being.x][this.being.y];
		if (underItem){
			this.game.display.message("Cannot drop the "+item.def.name+" here.");
		} else {
			this.game.world.level.addItem(item, this.being.x, this.being.y);
			this.removeItem(item);
			this.game.display.message("You drop the "+item.def.name+".");
		}
	},
	tryUse: function(item, dx, dy){
		item.def.type.useFunction(this.game, item, dx, dy);
	},
	tryTalk: function() {
		if (true || this.game.world.level.inChatArea(this.being.x, this.being.y)) {
			return true;
		}
	}
}