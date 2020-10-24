var TextBox = require('./ui/TextBox.class');
var ChatBox = require('./ui/ChatBox.class');
var InputBox = require('./ui/InputBox.class');
var Box = require('./ui/Box.class');

module.exports = {
	BLANK_TILE: new ut.Tile(' ', 255, 255, 255),
	CURSOR_TILE: new ut.Tile('*', 255, 255, 255),
	init: function(game, config){
		this.game = game;
		this.term = new ut.Viewport(document.getElementById("game"), 80, 25);
		this.eng = new ut.Engine(this.term, this.getDisplayedTile.bind(this));

		this.darkTiles = {};
		
		this.textBox = new TextBox(this.term, 1, 29, {x:25, y:0}, this);
		this.commandsBox = new TextBox(this.term, 1, 29, {x:25, y: 23}, this);
		this.chatBoxes = [
			new ChatBox(this.term, 7, 25, {x:0, y:0}, this),
			new ChatBox(this.term, 7, 25, {x:0, y:7}, this),
			new ChatBox(this.term, 7, 25, {x:0, y:14}, this),
			new ChatBox(this.term, 7, 25, {x:54, y:0}, this),
			new ChatBox(this.term, 7, 25, {x:54, y:7}, this),
			new ChatBox(this.term, 7, 25, {x:54, y:14}, this)
		];
		this.chatboxesMap = {};
		this.chatBox = this.chatBoxes[0];
		this.chatBox = new InputBox(this.game.input, this.chatBoxes[0].textBox, message => {
			this.game.talkManager.sendMessage(message);
		});
		this.chatBox.clearOnSent = true;

		this.usernameBox = new InputBox(
			this.game.input,
			new TextBox(this.term, 1, 30, {x:20, y:7}, this),
			username => {
				this.usernameBox.active = false;
				this.savedUsername = username;
				this.passwordBox.activate();
			}
		);

		this.passwordBox = new InputBox(
			this.game.input, 
			new TextBox(this.term, 1, 30, {x:20, y:8}, this),
			password => {
				this.passwordBox.active = false;
				this.game.login(this.savedUsername, password);
			}
		);
		this.passwordBox.masked = true;

		this.inventoryBox = new Box(this.term, 15, 40, {x:19, y:4});
		this.centered = config && config.centered;
		this.centered = true;
		this.usernameBox.activate();
		this.mode = 'TITLE';
	},
	loginFailed: function () {
		this.term.putString("Login Failed", 5, 15, 255, 0, 0);
		this.usernameBox.activate();
		this.refresh();
	},
	getDisplayedTile: function(x,y){
		var level = this.game.world.level;
		/*if (x === level.player.being.x && y === level.player.being.y){
			return level.player.tile;
		}*/
		var xr = x - level.player.being.x;
		var yr = y - level.player.being.y;
		if (level.player.canSee(xr, yr) && !this.disconnected){
			if (level.beings[x] && level.beings[x][y]){
				return level.beings[x][y].tile;
			} else if (level.items[x] && level.items[x][y]){
				return level.items[x][y].def.tile;
			} else if (level.map[x] && level.map[x][y]){
				return level.map[x][y].tile;
			} else {
				return ut.NULLTILE;
			}
		} else if (level.player.remembers(x, y)){
			if (level.map[x] && level.map[x][y]){
				return this.darkTile(level.map[x][y].tile);
			} else {
				return ut.NULLTILE;
			}
		} else {
			return ut.NULLTILE;
		}
	},
	darkTile: function (tile) {
		const chara = tile.getChar();
		if (this.darkTiles[chara]) {
			return this.darkTiles[chara];
		}
		const darkTile = new ut.Tile(chara, 60, 60, 60);
		this.darkTiles[chara] = darkTile;
		return darkTile;
	},
	refresh: function(){
		if (this.mode == 'TITLE') {
			this.term.putString(":: Roguenet ::", 5, 5, 255, 85, 85);
			this.term.putString("User:", 5, 7, 170, 170, 170);
			this.term.putString("Password:", 5, 8, 170, 170, 170);
			this.usernameBox.draw();
			this.passwordBox.draw();
		} else if (this.mode == 'GAME') {
			if (this.centered) {
				this.eng.update(this.game.player.being.x, this.game.player.being.y);
			} else {
				this.eng.update(40, 12);
			}
			this.textBox.draw();
			// TODO: If player not in sight, mark chatbox as such? 
			this.chatBoxes.forEach(c => c.draw());
			this.commandsBox.draw();
		}
		this.term.render();
	},
	showInventory: function(){
		this.inventoryBox.draw();
		var xBase = 20;
		var yBase = 5;
		this.term.putString("Inventory", xBase, yBase, 255, 0, 0);
		for (var i = 0; i < this.game.player.items.length; i++){
			var item = this.game.player.items[i];
			if (item == this.game.input.selectedItem){
				this.term.put(this.CURSOR_TILE, xBase, yBase+1+i);
			} else {
				this.term.put(this.BLANK_TILE, xBase, yBase+1+i);
			}
			this.term.put(item.def.tile, xBase+2, yBase+1+i);
			this.term.put(item.def.tile, xBase+2, yBase+1+i);
			this.term.putString(item.def.name, xBase + 4, yBase+1+i, 255, 255, 255);
		}
		this.term.render();
	},
	hideInventory: function(){
		this.term.clear();
		this.refresh();		
	},
	message: function(str){
		this.textBox.addText(str);
		this.textBox.draw();
		this.term.render();
	},
	setCommands: function(str){
		this.commandsBox.setText(str);
		this.commandsBox.draw();
		this.term.render();
	},
	getOrAssignChatbox: function (player) {
		let chatbox = this.chatboxesMap[player.playerId];
		if (!chatbox) {
			for (let i = 1; i < this.chatBoxes.length; i++) {
				if (!this.chatBoxes[i].player) {
					this.chatboxesMap[player.playerId] = this.chatBoxes[i];
					this.chatBoxes[i].setPlayer(player);
					this.chatBoxes[i].draw();
					return this.chatBoxes[i];
				}
			}
		}
		return chatbox;
	},
	unassignChatbox: function (playerId) {
		let chatbox = this.chatboxesMap[playerId];
		if (chatbox) {
			delete this.chatboxesMap[playerId];
			chatbox.reset();
			chatbox.draw();
		}
	},

	unassignChatboxes: function () {
		for (let i = 1; i < this.chatBoxes.length; i++) {
			if (this.chatBoxes[i].player) {
				this.unassignChatbox(this.chatBoxes[i].player.playerId);
			}
		}
	},

	disconnect: function () {
		this.disconnected = true;
		this.commandsBox.setText("Disconnected.");
		this.refresh();
	}

}
