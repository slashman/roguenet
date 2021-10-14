module.exports = {
	setData (itemsData) {
		Object.keys(itemsData).forEach(key => {
			const t = itemsData[key];
			this[key] = {
				tile: new ut.Tile(t.character, t.color[0], t.color[1], t.color[2]),
				name: t.name
			}
		});
	}
}