const TILES = {
	FLOOR: {
		solid: false,
		opaque: false
	},
	CONVERSATION_AREA: {
		solid: false,
		opaque: false
	},
	WALL: {
		solid: true,
		opaque: true
	},
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
	},
	CARPET: {
		solid: false,
		opaque: false
	},
	SIGN: {
		solid: true,
		opaque: false
	},
	SIGN_LEFT_WING: {
		solid: true,
		opaque: false
	},
	SIGN_RIGHT_WING: {
		solid: true,
		opaque: false
	},
	ALTAR_LEFT: {
		solid: true,
		opaque: false
	},
	ALTAR_MIDDLE: {
		solid: true,
		opaque: false
	},
	ALTAR_RIGHT: {
		solid: true,
		opaque: false
	},
	WOOD_BARRIER: {
		solid: true,
		opaque: false
	},
	DIRT: {
		solid: false,
		opaque: false
	},
	WINDOW: {
		solid: true,
		opaque: false
	}
}

Object.keys(TILES).forEach(key => TILES[key].tileId = key);

module.exports = TILES;