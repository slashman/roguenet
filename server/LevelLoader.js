const fs = require("fs");
const rexpaintjs = require('rexpaintjs')
const Tiles = require('./Tiles.enum');

const TILE_MAP = {};
TILE_MAP[',006600'] = Tiles.GRASS;
TILE_MAP['#CBCBCB'] = Tiles.WALL;
TILE_MAP['.CBCBCB'] = Tiles.FLOOR;
TILE_MAP['*204000'] = Tiles.BUSH;
TILE_MAP['=0080FF'] = Tiles.WATER;
TILE_MAP['=B20000'] = Tiles.CARPET;
TILE_MAP['@3399FF'] = Tiles.SIGN;
TILE_MAP['Ó3399FF'] = Tiles.SIGN_LEFT_WING; // ╙
TILE_MAP['½3399FF'] = Tiles.SIGN_RIGHT_WING; // ╜
TILE_MAP['É8000FF'] = Tiles.ALTAR_LEFT; // ╔
TILE_MAP['Í8000FF'] = Tiles.ALTAR_MIDDLE; // ═
TILE_MAP['»8000FF'] = Tiles.ALTAR_RIGHT; // ╗
TILE_MAP['Ò663300'] = Tiles.WOOD_BARRIER; //╥
TILE_MAP[',4D3D26'] = Tiles.DIRT;
TILE_MAP['+FB00FF'] = Tiles.WINDOW;

module.exports = {
	loadLevel: async function(level){
		var fileBuffer = fs.readFileSync('maps/temple.xp');
		const map = await rexpaintjs.fromBuffer(fileBuffer);
		const layer = map.layers[0];
		for (var x = 0; x < layer.width; x++){
			level.map[x] = [];
			for (var y = 0; y < layer.height; y++){
				const tile = layer.raster[y * layer.width + x];
				const char = String.fromCharCode(tile.asciiCode);
				const tileType = TILE_MAP[char + tile.fg.hex.toUpperCase()] || Tiles.FLOOR;
				level.map[x][y] = tileType;
			}
		}
	}
}