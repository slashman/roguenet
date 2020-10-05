function Being(level, beingData){
	this.level = level;
	this.x = beingData.x;
    this.y = beingData.y;
    this.playerId = beingData.playerId;
    this.tile = new ut.Tile('@', 255, 255, 255);
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
    }
}

module.exports = Being;