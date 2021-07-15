/** Represents a text box which can be updated to
 * show a new text along with the old one until
 * it is full, in which case it shows a [More]
 * prompt, waits for a player keypress, erases it
 * selfs and continues exhibiting the same behaviour.
 * @author Santiago Zapata
 * @author Eben Howard
 */
 
function TextBox (term, height, width, position, display) {
	this.display = display;
	this.term = term;
	this.curx = 0;
	this.cury = 0;
	this.height = height;
	this.width = width;

	this.lines = new Array();
	this.position = position;
	for (var i = 0; i < height; i++){
		this.lines[i] = [];
	}
	this.lastUpdateMillis = 0;
}

TextBox.prototype.draw = function(){
	const space = new ut.Tile(" ");
	for (var i = 0; i < this.lines.length; i++) {
		const line = this.lines[i];
		for (var c = 0; c < this.width; c++) {
			const char = c < line.length ? line[c] : space;
			this.term.unsafePut(char, this.position.x + c, this.position.y + i);
		}
     }
};


TextBox.prototype.overgrown = function(){
	return this.lines.length > this.height;
}

TextBox.prototype.checkFaint = function(){
	var currentTime = new Date().getTime();
	if (this.overgrown() && currentTime - this.lastUpdateMillis > 200){
		this.clear();
		this.display.refresh();
	}
}

TextBox.prototype.addText = function(text, r, g, b, br, bg, bb){
	if (!Number.isInteger(r)) r = 170;
	if (!Number.isInteger(g)) g = 170;
	if (!Number.isInteger(b)) b = 170;

	var currentTime = new Date().getTime();
	if (this.cury >= this.height - 1 && currentTime - this.lastUpdateMillis > 200){
		this.clear();
		this.display.refresh();
	}
	this.lastUpdateMillis = currentTime; 

	var textTiles = [];
	var tokens = text.split(" ");
	for (var i = 0; i < tokens.length; i++) {
		if (tokens[i].length + 1 > this.width) {
			// If this single token is longer than a whole line, break it up.
			tokens.splice(i + 1, 0, tokens[i].substr(this.width));
			tokens[i] = tokens[i].substr(0, this.width);
		} else if (i < tokens.length - 1) {
			tokens[i] += ' ';
		}

        var distance = this.width - this.curx;

		if (distance < tokens[i].length) {
			this.curx = 0;
			this.cury++;
		}
		if (!this.lines[this.cury]) {
			this.lines[this.cury] = [];
		}
		for (var c = 0; c < tokens[i].length; c++) {
			const tile = new ut.Tile(tokens[i][c], r, g, b, br, bg, bb);
			this.lines[this.cury][this.curx++] = tile;
			textTiles.push(tile);
		}
    }

	return textTiles;
};

TextBox.prototype.isFull = function() {
	return this.cury == this.height - 1 && this.curx == this.width;
}

// Note, this is raw remaining space, some of which may be reserved for graceful
// wrapping of the added text.
TextBox.prototype.getRemainingSpace = function() {
	return this.width * (this.height - this.cury - 1) + (this.width - this.curx);
}

TextBox.prototype.setText = function(text, r, g, b, br, bg, bb) {
	this.clear();
	const textTiles = this.addText(text, r, g, b, br, bg, bb);
	this.draw();
	this.term.render();
	return textTiles;
};

TextBox.prototype.clear = function() {
	const space = new ut.Tile(" ");
	for (var i = 0; i < this.lines.length; i++) {
		this.lines[i] = [];
		for (var c = 0; c < this.width; c++) {
			this.term.unsafePut(space, this.position.x + c, this.position.y + i);
		}
	}
	this.lines.length = this.height;
	this.curx = 0;
	this.cury = 0;
};

module.exports = TextBox;