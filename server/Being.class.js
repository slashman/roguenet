var Random = require('./Random');

function Being(level){
	//this.level = level;
	this.x = null;
	this.y = null;
	this.intent = 'CHASE';
	this.inventory = [];
}

Being.prototype = {
	act: function(){
		switch (this.intent){
			case 'RANDOM':
				this.actRandom();
				break;
			case 'CHASE':
				this.actChase();
				break;
		}
	},
	actRandom: function(){
		var dx = Random.n(-1, 1);
		var dy = Random.n(-1, 1);
		this.moveTo(dx, dy);
	},
	actChase: function(){
		var nearestEnemy = this.getNearestEnemy();
		if (!nearestEnemy){
			return;
		}
		var dx = Math.sign(nearestEnemy.x - this.x);
		var dy = Math.sign(nearestEnemy.y - this.y);
		
		this.moveTo(dx, dy);
	},
	addItem: function(item) {
		this.inventory.push(item);
	},
	hasItem: function (itemId) {
		return this.inventory.find(i => i.def.id === itemId) !== undefined;
	},
	leaveArea: function (socket) {
		if (this.currentArea.type == 'talk') {
			socket.leave(this.currentChatChannel);
			this.currentChatChannel = 'nearbyConversation';
			socket.join('nearbyConversation');
		}
		this.currentArea = undefined;
	},
	joinArea: function (socket, area) {
		this.currentArea = area;
		if (area.type == 'talk') {
			this.currentChatChannel = area.channelId;
			socket.join(area.channelId);
			socket.leave('nearbyConversation');
		}
	}
}

module.exports = Being;