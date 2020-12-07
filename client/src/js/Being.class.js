function Being(level, beingData){
	this.level = level;
	this.x = beingData.x;
    this.y = beingData.y;
	this.playerId = beingData.playerId;
	this.playerName = beingData.playerName;
    this.tile = new ut.Tile('@', beingData.color[0], beingData.color[1], beingData.color[2]);
}

Being.prototype = {
	moveTo: function(dx,dy){
		this.level.beings[this.x][this.y] = false;
		this.x = this.x + dx;
		this.y = this.y + dy;
		if (!this.level.beings[this.x])
			this.level.beings[this.x] = [];
		this.level.beings[this.x][this.y] = this;
    },
    teleportTo: function (x, y) {
        this.level.beings[this.x][this.y] = false;
        this.x = x;
		this.y = y;
		if (!this.level.beings[this.x])
			this.level.beings[this.x] = [];
		this.level.beings[this.x][this.y] = this;
	},
	changeColor: function (color) {
		this.tile = new ut.Tile('@', color[0], color[1], color[2]);
	}
}

module.exports = Being;