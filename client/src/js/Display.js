var TextBox = require('./ui/TextBox.class');
var ChatBox = require('./ui/ChatBox.class');
var InputBox = require('./ui/InputBox.class');
const List = require('./ui/List.class');
var Box = require('./ui/Box.class');

module.exports = {
	BLANK_TILE: new ut.Tile(' ', 255, 255, 255),
	CURSOR_TILE: new ut.Tile('*', 255, 255, 255),
	init: function(game, config){
		this.game = game;
		this.term = new ut.Viewport(document.getElementById("game"), 80, 25);
		this.eng = new ut.Engine(this.term, this.getDisplayedTile.bind(this));

		this.darkTiles = {};
		
		this.textBox = new TextBox(this.term, 2, 80 - 25, {x: 25, y: 0}, this);
		this.commandsBox = new TextBox(this.term, 2, 80 - 25, {x: 25, y: 23}, this);

		this.chatBoxes = [];
		this.chatboxesMap = {};
		this.chatBox = new InputBox(
			this.game.input,
			new TextBox(this.term, 4, 25, { x: 0, y: 1}, this),
			message => {
				this.game.talkManager.sendMessage(message);
			}
		);
		this.chatBox.clearOnSent = true;

		this.peopleList = new List (this.term, this.peopleCellRenderer, 1, { x: 55, y: 5});

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
				if (this.game.input.mode == 'CREATE') {
					this.game.create(this.savedUsername, password);
				} else if (this.game.input.mode == 'LOGIN') {
					this.game.login(this.savedUsername, password);
				}
			}
		);
		this.passwordBox.masked = true;

		this.inventoryBox = new Box(this.term, 15, 40, {x:19, y:4});
		this.centered = config && config.centered;
		this.centered = true;
		this.mode = 'TITLE';
	},
	setMode: function (mode) {
		this.mode = mode;
	},
	loginFailed: function () {
		this.usernameBox.activate();
		this.term.putString("Login Failed", 5, 15, 255, 0, 0);
		this.term.render();
	},
	createFailed: function () {
		this.usernameBox.activate();
		this.term.putString("Create Failed", 5, 15, 255, 0, 0);
		this.term.render();
	},
	getDisplayedTile: function(x,y){
		var level = this.game.world.level;
		if (x === level.player.being.x && y === level.player.being.y){
			return level.player.being.tile;
		}
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
			this.term.clear();
			this.term.putString(":: Roguenet ::", 5, 5, 255, 85, 85);
			this.term.putString("a. Create character", 5, 7, 170, 170, 170);
			this.term.putString("b. Login", 5, 8, 170, 170, 170);
		} else if (this.mode == 'CREATE') {
			this.term.clear();
			this.term.putString(":: Create Character ::", 5, 5, 255, 85, 85);
			this.term.putString("User:", 5, 7, 170, 170, 170);
			this.term.putString("Password:", 5, 8, 170, 170, 170);
			this.usernameBox.draw();
			this.passwordBox.draw();
		} else if (this.mode == 'LOGIN') {
			this.term.clear();
			this.term.putString(":: Login ::", 5, 5, 255, 85, 85);
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
			if (this.game.talkManager.isTalkActive || this.game.talkManager.isYellActive) {
				if (this.game.input.mode == 'TALK') {
					this.game.display.term.putString("Type your message:", 0, 0, 170, 170, 170);
					this.chatBox.draw();
				}
			}
			this.chatBoxes.forEach(c => c.draw());
			const level = this.game.world.level;
			const area = level.getArea(level.player.being.x, level.player.being.y);
			this.peopleList.draw();
			this.commandsBox.draw();
			if (area) {
				this.showAreaInfo(area);
			} else {
				this.hideAreaInfo();
			}
		}
		this.term.render();
	},
	hideAreaInfo: function () {
		if (!this.currentArea) {
			return;
		}
		delete this.currentArea;
		document.getElementById("areaInfo").style.display = 'none';
	},
	showAreaInfo: function (area) {
		if (this.currentArea == area) {
			return;
		}
		this.currentArea = area;
		document.getElementById("areaInfo").style.display = 'block';
		this.message('You are in the "' + area.name  + '" booth. '+ area.gameDetails, 0, 0, 170, 170, 170);

		/*
		document.getElementById("areaTitle").innerHTML = 'You are in the [' + area.name  + '] booth';
		document.getElementById("gameDetails").innerHTML = area.gameDetails;*/
		document.getElementById("gamePlay").innerHTML = area.name + ' by ' + area.author  + ' <a class = "whiteLink" href = "' + area.playURL + '" target = "_blank">Play Now!</a>';
		const video = document.getElementById("videoFrame");
		const videoContainer = document.getElementById("videoContainer");
		if (area.videoId) {
			video.setAttribute( "src", "https://www.youtube.com/embed/"+ area.videoId);
			console.log("set source");
			videoContainer.style.display = 'block';
		} else {
			videoContainer.style.display = 'none';
		}

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
	getLastChatboxForPlayer: function (player) {
		return this.chatboxesMap[player.playerId];
	},
	spawnChatbox: function (player, message) {
		const lastChatbox = this.getLastChatboxForPlayer(player);
		if (lastChatbox) {
			lastChatbox.setIsTyping(false);
		}
		if (this.lastSpawnedChatbox) {
			this.chatboxCursorY += this.lastSpawnedChatbox.getFilledHeight();
			if (this.chatboxCursorY > 19) {
				// Overflow
				this.chatboxCursorY = 5;
			}
		} else {
			this.chatboxCursorY = 5;
		}
		const chatBox = new ChatBox(this.term, 5, 25, {x:0, y: this.chatboxCursorY}, this);
		this.chatboxesMap[player.playerId] = chatBox;
		this.chatBoxes.push(chatBox);
		chatBox.setPlayer(player);
		chatBox.setText(message);
		chatBox.draw();
		// Check if the new chatBox overlaps other chatboxes including a vertical padding
		let overlap = false;
		for (let i = 0; i < this.chatBoxes.length; i++) {
			const theChatBox = this.chatBoxes[i];
			if (theChatBox == chatBox) {
				continue;
			}
			const x1 = theChatBox.position.y;
			const x2 = theChatBox.position.y + theChatBox.getFilledHeight() - 1;
			const y1 = chatBox.position.y;
			const y2 = chatBox.position.y + chatBox.getFilledHeight() + 2;
			if (x1 <= y2 && y1 <= x2) {
				if (this.chatboxesMap[theChatBox.player.playerId] == theChatBox) {
					delete this.chatboxesMap[theChatBox.player.playerId];
				}
				theChatBox.reset();
				theChatBox.draw();
				this.chatBoxes.splice(i, 1);
				i--;
				overlap = true;
			}
		}
		if (overlap) {
			this.refresh();
		}
		this.lastSpawnedChatbox = chatBox;
		return chatBox;
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
	},

	peopleCellRenderer (term, being, x, y) {
		term.put(being.tile, x, y);
		term.putString("- " + being.playerName, x + 2, y, 170, 170, 170);
	}

}
