module.exports = {
	n: function(a, b){
		return Math.floor(Math.random() * (b - a + 1))+a;
	},
	chance: function(c) {
		return Math.random() * 100 <= c;
	},
	from: function(array){
		return array[this.n(0, array.length-1)];
	}
}