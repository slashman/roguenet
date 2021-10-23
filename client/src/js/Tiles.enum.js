module.exports = {
	setData (tileData) {
		Object.keys(tileData).forEach(key => {
			const t = tileData[key];
			this[key] = {
				tile: new ut.Tile(t.character, t.color[0], t.color[1], t.color[2]),
				solid: t.solid,
				opaque: t.opaque,
				stepSFX: t.stepSFX
			}
		});
	}
}