const Items = require('../Items.enum');

module.exports = {
	itemGivers: [
		{
			x: 30,
			y: 21,
			def: Items.ROGUELIKECEL_BADGE
		},
		{
			x: 31,
			y: 21,
			def: Items.ROGUELIKECEL_SOCKS
		},
		{
			x: 32,
			y: 21,
			def: Items.ROGUELIKECEL_PIN
		},
		{
			x: 33,
			y: 21,
			def: Items.ROGUELIKECEL_TSHIRT
		}
	],
	areas: [
		{ x: 18, y:42, w: 4, h: 4, type: 'talk', enterMessage: 'You enter a private conversation area. Topic is: Favorite Roguelike.', channelId: 'private1' },
		{ x: 28, y:42, w: 4, h: 4, type: 'talk', enterMessage: 'You enter a private conversation area. Topic is: First Roguelike.', channelId: 'private2' },
		{ x: 36, y:48, w: 4, h: 4, type: 'talk', enterMessage: 'You enter a private conversation area. Topic is: What is a Roguelike.', channelId: 'private3' },
		{ x: 27, y:55, w: 4, h: 4, type: 'talk', enterMessage: 'You enter a private conversation area. Topic is: Roguelike Celebration.', channelId: 'private4' },
		{ x: 18, y:55 , w: 4, h: 4, type: 'talk', enterMessage: 'You enter a private conversation area. Topic is: YASD.', channelId: 'private5' },
		{ x: 10, y:48, w: 4, h: 4, type: 'talk', enterMessage: 'You enter a private conversation area. Topic is: Metaprogression.', channelId: 'private6' },
		{ x: 104, y: 29, w: 5, h: 2, type: 'video', enterMessage: "Rogue (1980) by Michael Toy, Glenn Wichman, and Ken Arnold.", videoTitle: "Rogue", videoId: "T7ZVeJVOYe0", playURL: ""},
		{ x: 98, y: 23, w: 2, h: 5, type: 'video', enterMessage: "Hack (1984) by Jay Fenlason, Kenny Woodland, Mike Thome, and Jonathan Payne.", videoTitle: "Hack", videoId: "", playURL: ""},
		{ x: 98, y: 12, w: 2, h: 5, type: 'video', enterMessage: "NetHack (1987) by Mike Stephenson, Izchak Miller, and Janet Walz.", videoTitle: "Nethack", videoId: "", playURL: ""},
		{ x: 113, y: 23, w: 2, h: 5, type: 'video', enterMessage: "Moria (1983) by Robert Alan Koeneke.", videoTitle: "Moria", videoId: "MnKyvlexxgM", playURL: ""},
		{ x: 113, y: 12, w: 2, h: 5, type: 'video', enterMessage: "Angband (1990) by Alex Cutler and Andy Astrand.", videoTitle: "Angband", videoId: "BDidsq-HQP8", playURL: ""},
		{ x: 104, y: 26, w: 5, h: 2, type: 'video', enterMessage: "Larn (1986) by Noah Morgan.", videoTitle: "Larn ", videoId: "", playURL: ""},
		{ x: 104, y: 5, w: 5, h: 2, type: 'video', enterMessage: "ADOM (1994) by Thomas Biskup.", videoTitle: "ADOM", videoId: "", playURL: ""},
	],
	soundAreas: [
		{ x: 4, y: 18, w: 36, h: 45, sound: 'party' },
		{ x: 53, y: 4, w: 17, h: 33 , sound: 'temple' },
		{ x: 97, y: 4, w: 19, h: 32, sound: 'museum' }
	]
}