function List (term, cellRenderer, rowHeight, position) {
	this.term = term;
	this.cellRenderer = cellRenderer;
	this.rowHeight = rowHeight;
	this.x = position.x;
	this.y = position.y;
}

List.prototype = {
	setData(data) {
		this.data = data;
	},
	draw() {
		if (!this.data || !this.cellRenderer) return;
		this.data.forEach((item, index) => {
			const y = this.y + index * this.rowHeight;
			this.cellRenderer(this.term, item, this.x, y);
		});
	}
}

module.exports = List;