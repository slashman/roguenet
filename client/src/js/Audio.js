const Random = require("./Random");

module.exports = {
  mx: {},
  sfx: {},
  currentMx: '',
  init: function(game) {
    this.game = game;
  },
  registerSfx: function({ key, ...cfg }) {
    this.sfx[key] = this.createSound({
      ...cfg,
      src: `assets/audio/sfx/${cfg.src}`
    });

    if (cfg.stereo) { this.sfx[key].stereo(cfg.stereo); }
  },
  registerMx: function({ key, loop = true, ...cfg }) {
    this.mx[key] = this.createSound({
      ...cfg,
      src: `assets/audio/mx/${cfg.src}`,
      loop: loop
    });

    if (cfg.stereo) { this.mx[key].stereo(cfg.stereo); }
  },
  createSound: function({ key, src, volume, loop, autoplay }) {
    return new Howl({
      src: src,
      volume: volume, // TODO: Voume range is 0.0 to 1.0
      loop: loop,
      autoplay: autoplay
    });
  },
  getKeyFromString: function(str) {
    let keys = str.split(',');
    return (keys.length === 1)
      ? keys[0]
      : keys[Random.n(0, keys.length - 1)];
  },
  playSfx: function(src) {
    const key = this.getKeyFromString(src);
    if (this.sfx[key]) this.sfx[key].play();
    else console.log(`No SFX registered for ${key}...`);
  },
  playAmbience: function(src) {
    const key = this.getKeyFromString(src);
    if (this.currentAmbience === key) return;
    if (this.currentAmbience) this.mx[this.currentAmbience].stop();
    this.currentAmbience = key;
    if (this.mx[key]) this.mx[key].play();
    else console.log(`No Ambience registered for ${key}...`);
  },
  playMx: function(src) {
    const key = this.getKeyFromString(src);
    if (this.currentMx === key) return;
    if (this.currentMx) this.mx[this.currentMx].stop();
    this.currentMx = key;
    if (this.mx[key]) this.mx[key].play();
    else console.log(`No MX registered for ${key}...`);
  },
  playRandomMx: function() {
    const mx_array = Object.keys(this.mx);
    this.playMx(mx_array[Random.n(0, mx_array.length)]);
  },
  stopCurrentAmbience: function() {
    if (this.currentAmbience) {
      this.sfx[this.currentAmbience].stop();
      delete this.currentAmbience;
    }
  },
  stopCurrentMx: function() {
    if (this.currentMx) {
      this.mx[this.currentMx].stop();
      delete this.currentMx;
    }
  },
  stopMx: function(src) {
    const key = this.getKeyFromString(src);
    if (this.mx[key]) this.mx[key].stop();
    else console.log(`No MX registered for ${key}...`);
  },
  stopSfx: function(src) {
    const key = this.getKeyFromString(src);
    if (this.sfx[key]) this.sfx[key].stop();
    else console.log(`No SFX registered for ${key}...`);
  },
  setSfxPan: function( key, pan ) {
    this.sfx[key].stereo(pan);
  },
  
  setSfxVolume: function( key, val ) {
    this.sfx[key].volume(val);
  },
};