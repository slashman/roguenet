const fs = require("fs");
const rexpaintjs = require('rexpaintjs')
const iconv = require("iconv-lite");
const Tiles = require('./Tiles.enum');

const TILE_MAP = {};
TILE_MAP[',006600'] = Tiles.GRASS;
TILE_MAP['#666666'] = Tiles.WALL;
TILE_MAP['.CBCBCB'] = Tiles.FLOOR;
TILE_MAP['*006600'] = Tiles.BUSH;
TILE_MAP['=0000B2'] = Tiles.WATER;
TILE_MAP['@3399FF'] = Tiles.SIGN;
TILE_MAP['Ó3399FF'] = Tiles.SIGN_LEFT_WING; // ╙
TILE_MAP['½3399FF'] = Tiles.SIGN_RIGHT_WING; // ╜
TILE_MAP['É8000FF'] = Tiles.ALTAR_LEFT; // ╔
TILE_MAP['Í8000FF'] = Tiles.ALTAR_MIDDLE; // ═
TILE_MAP['»8000FF'] = Tiles.ALTAR_RIGHT; // ╗
TILE_MAP['Ò663300'] = Tiles.WOOD_BARRIER; //╥
TILE_MAP['+FB00FF'] = Tiles.WINDOW;
TILE_MAP['#B20000'] = Tiles.PORTICULIS;

module.exports = {
	loadLevel: async function(level){
		var fileBuffer = fs.readFileSync('maps/esplanade.xp');
		const map = await rexpaintjs.fromBuffer(fileBuffer);
		const layer = map.layers[0];
		for (var x = 0; x < layer.width; x++){
			level.map[x] = [];
			for (var y = 0; y < layer.height; y++){
				const tile = layer.raster[y * layer.width + x];
				let char = String.fromCharCode(tile.asciiCode);
				if (tile.asciiCode == 21) {
					char = "§";
				}
				const tileKey = char + tile.fg.hex.toUpperCase();
				let tileType = TILE_MAP[tileKey];
				if (!tileType) {
					const characterByte = new Uint8Array(1);
					characterByte[0] = tile.asciiCode;
					tileType = {
						tileId: tileKey,
						character: iconv.decode(characterByte, "cp437"),
						color: [tile.fg.r, tile.fg.g, tile.fg.b],
						solid: false,
						opaque: false
					}
					if (tile.asciiCode == 21) {
						tileType.character = "§";
					}
					console.log("Created tile " + tileKey + "["+tileType.character+"] from tile ["+tile.asciiCode+"]");
					Tiles[tileKey] = tileType;
					TILE_MAP[tileKey] = tileType;
				}
				level.map[x][y] = tileType;
			}
		}
	}
}