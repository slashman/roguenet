module.exports = {
	lastActions: {},
	limitAction (socket) {
		const lastPlayerAction = this.lastActions[socket.id];
		if (lastPlayerAction && new Date().getTime() - lastPlayerAction < 30){
			socket.emit('actionFailed');
			return true;
		}
		return false;
	},
	update (socket) {
		this.lastActions[socket.id] = new Date().getTime();
	}
}