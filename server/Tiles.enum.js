const TILES = {
	FLOOR: {
		character: '.',
		color: [203, 203, 203],
		solid: false,
		opaque: false
	},
	WALL: {
		character: '#',
		color: [203, 203, 203],
		solid: true,
		opaque: true
	},
	GRASS: {
		character: ',',
		color: [0, 128, 0],
		solid: false,
		opaque: false
	},
	BUSH: {
		character: '*',
		color: [0, 128, 0],
		solid: true,
		opaque: true
	},
	WATER: {
		character: '=',
		color: [0, 0, 255],
		solid: true,
		opaque: false
	},
	SIGN: {
		character: '@',
		color: [51, 153, 255],
		solid: true,
		opaque: false
	},
	SIGN_LEFT_WING: {
		character: '╙',
		color: [51, 153, 255],
		solid: true,
		opaque: false
	},
	SIGN_RIGHT_WING: {
		character: '╜',
		color: [51, 153, 255],
		solid: true,
		opaque: false
	},
	ALTAR_LEFT: {
		character: '╔',
		color: [128, 0, 255],
		solid: true,
		opaque: false
	},
	ALTAR_MIDDLE: {
		character: '═',
		color: [128, 0, 255],
		solid: true,
		opaque: false
	},
	ALTAR_RIGHT: {
		character: '╗',
		color: [128, 0, 255],
		solid: true,
		opaque: false
	},
	WOOD_BARRIER: {
		character: '╥',
		color: [102, 51, 0],
		solid: true,
		opaque: false
	},
	WINDOW: {
		character: '+',
		color: [251, 0, 255],
		solid: true,
		opaque: false
	},
	PORTICULIS: {
		character: '#',
		color: [178, 0, 255],
		solid: true,
		opaque: false
	}
}

Object.keys(TILES).forEach(key => TILES[key].tileId = key);

module.exports = TILES;