const TextBox = require('./TextBox.class');

function ChatBox (term, height, width, position, display) {
    this.textBox = new TextBox(term, height - 1, width, { x: position.x, y: position.y + 1 }, display);
    this.display = display;
	this.term = term;
	this.height = height;
	this.width = width;
    this.position = position;
}

ChatBox.prototype.setPlayer = function(p){
    this.player = p;
};

ChatBox.prototype.draw = function(){
    if (!this.player) return;
    this.term.put(this.player.tile, this.position.x, this.position.y);
    this.term.putString("- " + this.player.playerName, this.position.x + 2, this.position.y, 170, 170, 170);
    this.textBox.draw();
    this.term.render();
};

ChatBox.prototype.setText = function(t){
    this.textBox.setText(t);
};

module.exports = ChatBox;