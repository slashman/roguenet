module.exports = {
    loadAudio(game) {
        this.audio = game.audio;

        // Register the music
		this.audio.registerMx({
			key: 'party',
			src: 'party.ogg',
			volume: 0.6,
			loop: true
		});

		this.audio.registerMx({
			key: 'temple',
			src: 'temple.ogg',
			volume: 0.6,
			loop: true
		});

		this.audio.registerMx({
			key: 'museum',
			src: 'museum.ogg',
			volume: 0.6,
			loop: true
		});

		// Register the sound effects
		this.audio.registerSfx({ key: 'pickup', src: 'sfx_pickup.ogg', stereo: 0 });
		
		//Footsteps
		this.audio.registerSfx({ key: 'grass1', src: 'fs_grass_01.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'grass2', src: 'fs_grass_02.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'grass3', src: 'fs_grass_03.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'grass4', src: 'fs_grass_04.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'grass5', src: 'fs_grass_05.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'grass6', src: 'fs_grass_06.ogg', stereo: 0 });
		
		this.audio.registerSfx({ key: 'rock1', src: 'fs_rock_01.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'rock2', src: 'fs_rock_02.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'rock3', src: 'fs_rock_03.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'rock4', src: 'fs_rock_04.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'rock5', src: 'fs_rock_05.ogg', stereo: 0 });
		this.audio.registerSfx({ key: 'rock6', src: 'fs_rock_06.ogg', stereo: 0 });
	}
}