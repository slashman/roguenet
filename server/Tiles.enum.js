const TILES = {
	GRASS: {
		solid: false,
		opaque: false
	},
	STAIRS_DOWN: {
		solid: false,
		opaque: false
	},
	STAIRS_UP: {
		solid: false,
		opaque: false
	},
	BUSH: {
		solid: true,
		opaque: true
	},
	WATER: {
		solid: true,
		opaque: false
	}
}

Object.keys(TILES).forEach(key => TILES[key].tileId = key);

module.exports = TILES;