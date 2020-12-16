module.exports = {
	inputEnabled: true,
	init: function(game, client){
		this.game = game;
		this.client = client;
		ut.initInput(this.onKeyDown.bind(this));
		this.setMode('TITLE');
		document.addEventListener('keydown', e => { 
			if (!this.inputEnabled)
				return
			// Used for a better delay before repeating, works better for "typed" keys (instead of held down)
			if (this.mode === 'TITLE') {
				if (e.key === "a" || e.key === "A") {
					this.game.display.setMode('CREATE');
					this.game.display.usernameBox.activate();
					this.setMode('CREATE');
				} else if (e.key === "b" || e.key === "B") {
					this.game.display.setMode('LOGIN');
					this.game.display.usernameBox.activate();
					this.setMode('LOGIN');
				}
			} else if (this.mode === 'TALK' || this.mode === 'CREATE' || this.mode === 'LOGIN'){
				if (e.key.length == 1) {
					this.activeInputBox.addCharacter(e.key);
				} else if (e.key === "Enter"){
					this.activeInputBox.submit();
				}
			}
			if (this.mode === 'PROMPT_CHAT') {
				if (e.key === "y" || e.key === "Y"){
					this.game.client.acceptChatRequest();
				} else if (e.key === "n" || e.key === "N"){
					this.game.client.rejectChatRequest();
				}
			} else if (this.mode === 'WAIT_CHAT') {
				if (e.key === "Escape") {
					this.game.client.cancelChatRequest();
				}
			} else if (this.mode === 'MOVEMENT'){
				if (e.key === "Escape") {
					this.game.talkManager.endChat();
					this.game.display.message("Conversation Ended.");
					this.game.client.leaveChat();
					this.updateCommands();
				} else if (this.game.talkManager.isTalkActive && e.key === "Enter") {
					this.game.display.chatBox.activate();
					this.game.input.setMode('TALK');
					this.game.display.message("You start talking.");
				} else if (e.key === "Tab") {
					this.game.client.changeColor();
					return;
				} else if (e.key === "S") {
					this.game.client.smite(this.lastMoveDir);
					return;
				}
			} else if (this.mode === 'TALK') {
				if (e.key === "Escape"){
					this.setMode('MOVEMENT');
					this.game.display.message("Movement Mode Activated.");
					this.activeInputBox.cancelMessage();
					this.activeInputBox = null;
				}
			}
		});
	},
	movedir: { x: 0, y: 0 },
	onKeyDown: function(k){
		if (!this.inputEnabled)
			return;
		if (this.mode === 'TALK'){
			if (k === ut.KEY_BACKSPACE){
				this.activeInputBox.removeCharacter();
			}
		} else if (this.mode === 'CREATE' || this.mode === 'LOGIN'){
			if (k === ut.KEY_BACKSPACE){
				this.activeInputBox.removeCharacter();
			} else if (k === ut.KEY_ESCAPE) {
				this.game.display.setMode('TITLE');
				this.setMode('TITLE');
			}
		} else if (this.mode === 'MOVEMENT'){
			if (k === ut.KEY_COMMA){
				this.game.player.tryPickup();
				return;
			}
			if (k === ut.KEY_I){
				if (this.game.player.items.length === 0){
					this.game.display.message("You don't have any items");
					return;
				}
				this.setMode('INVENTORY');
				this.selectedItemIndex = 0;
				this.selectedItem = this.game.player.items[0];
				this.game.display.showInventory();
				return;
			}
			this.movedir.x = 0;
			this.movedir.y = 0;
			if (k === ut.KEY_LEFT || 
				k === ut.KEY_H || 
				k === ut.KEY_NUMPAD4 || k === ut.KEY_NUMPAD1 || k === ut.KEY_NUMPAD7 ||
				k === ut.KEY_Q || k === ut.KEY_A || k === ut.KEY_Z
				) {
				this.movedir.x = -1;
			}
			if (k === ut.KEY_RIGHT || 
				k === ut.KEY_L || 
				k === ut.KEY_NUMPAD6 || k === ut.KEY_NUMPAD9 || k === ut.KEY_NUMPAD3 ||
				k === ut.KEY_E || k === ut.KEY_D || k === ut.KEY_C
				) {
				this.movedir.x = 1;
			}
			if (k === ut.KEY_UP || 
				k === ut.KEY_K || 
				k === ut.KEY_NUMPAD8 || k === ut.KEY_NUMPAD7 || k === ut.KEY_NUMPAD9 ||
				k === ut.KEY_Q || k === ut.KEY_W || k === ut.KEY_E
				) {
				this.movedir.y = -1;
			}
			if (k === ut.KEY_DOWN || 
				k === ut.KEY_J || 
				k === ut.KEY_NUMPAD2 || k === ut.KEY_NUMPAD1 || k === ut.KEY_NUMPAD3 ||
				k === ut.KEY_Z || k === ut.KEY_X || k === ut.KEY_C
				) {
				this.movedir.y = 1;
			}
			if (this.movedir.x === 0 && this.movedir.y === 0){
				return;
			}
			this.inputEnabled = false;
			this.lastMoveDir = { dx: this.movedir.x, dy: this.movedir.y };
			this.game.player.tryMove(this.movedir);
		} else if (this.mode === 'INVENTORY'){
			if (k === ut.KEY_ESCAPE){
				this.game.display.hideInventory();
				this.setMode('MOVEMENT');
			} else if (k === ut.KEY_UP || k === ut.KEY_K){
				if (this.selectedItemIndex > 0){
					this.selectedItemIndex --;
				}
				this.selectedItem = this.game.player.items[this.selectedItemIndex];
				this.game.display.showInventory();
			} else if (k === ut.KEY_DOWN || k === ut.KEY_J){
				if (this.selectedItemIndex < this.game.player.items.length - 1){
					this.selectedItemIndex ++;
				}
				this.selectedItem = this.game.player.items[this.selectedItemIndex];
				this.game.display.showInventory();
			} else if (k === ut.KEY_D){
				this.game.player.tryDrop(this.selectedItem);
				this.game.display.hideInventory();
				this.setMode('MOVEMENT');
			} else if (k === ut.KEY_ENTER || k === ut.KEY_U){
				if (this.selectedItem.def.targetted || this.selectedItem.def.type.targetted){
					this.game.display.message("Select a direction.");
					this.game.display.hideInventory();
					this.setMode('SELECT_DIRECTION');
					this.directionAction = 'USE_ITEM';
				} else {
					this.game.player.tryUse(this.selectedItem);
					this.game.display.hideInventory();
					this.setMode('MOVEMENT');
				}
			}
		} else if (this.mode === 'SELECT_DIRECTION'){
			if (k === ut.KEY_ESCAPE){
				this.setMode('INVENTORY');
				this.game.display.showInventory();
				this.game.display.message("Cancelled.");
				return;
			}
			this.movedir.x = 0;
			this.movedir.y = 0;
			if (k === ut.KEY_LEFT || k === ut.KEY_H) this.movedir.x = -1;
			else if (k === ut.KEY_RIGHT || k === ut.KEY_L) this.movedir.x = 1;
			else if (k === ut.KEY_UP || k === ut.KEY_K) this.movedir.y = -1;
			else if (k === ut.KEY_DOWN || k === ut.KEY_J) this.movedir.y = 1;
			else return;
			this.game.player.tryUse(this.selectedItem, this.movedir.x, this.movedir.y);
			this.setMode('MOVEMENT');
		}
	},
	setMode (mode) {
		this.mode = mode;
		this.updateCommands();
	},
	updateCommands () {
		switch (this.mode) {
			case 'MOVEMENT':
				let availableCommands = "";
				if (this.game.talkManager.isTalkActive) {
					availableCommands += "[ESC] - Leave Chat | [Enter] Switch to Talking";
				} else {
					availableCommands += "Bump people to talk | [Tab] Change color";
				}
				this.game.display.setCommands(availableCommands);
			break;
			case 'TALK':
				this.game.display.setCommands("[ESC] - Switch to Movement | [Enter] Send Message");
			break;
		}
		this.game.display.refresh();
	},
	conversationOver () {
		if (this.mode == 'TALK') {
			this.setMode('MOVEMENT');
            this.activeInputBox.cancelMessage();
            this.activeInputBox = null;
			this.updateCommands();
		}
	},
	disconnect () {
		this.mode = 'DISCONNECTED';
	}

}