//TODO: Construct these definitions from server data
module.exports = {
	FLOOR: {
		tile: new ut.Tile('.', 128, 0, 0),
		darkTile: new ut.Tile('.', 128, 128, 128),
		solid: false,
		opaque: false
	},
	WALL: {
		tile: new ut.Tile('#', 255, 0, 0),
		darkTile: new ut.Tile('#', 128, 128, 128),
		solid: true,
		opaque: true
	},
	GRASS: {
		tile: new ut.Tile('.', 0, 128, 0),
		darkTile: new ut.Tile('.', 128, 128, 128),
		solid: false,
		opaque: false
	},
	STAIRS_DOWN: {
		tile: new ut.Tile('>', 255, 255, 255),
		darkTile: new ut.Tile('>', 128, 128, 128),
		solid: false,
		opaque: false
	},
	STAIRS_UP: {
		tile: new ut.Tile('<', 255, 255, 255),
		darkTile: new ut.Tile('<', 128, 128, 128),
		solid: false,
		opaque: false
	},
	BUSH: {
		tile: new ut.Tile('&', 0, 128, 0),
		darkTile: new ut.Tile('&', 128, 128, 128),
		solid: true,
		opaque: true
	},
	WATER: {
		tile: new ut.Tile('~', 0, 0, 255),
		darkTile: new ut.Tile('~', 128, 128, 128),
		solid: true,
		opaque: false
	}
}