class Game {
	constructor() {
		this.api = new PrologAPI();
		this.state = {};
		this.playHistory = [];
		this.startNewGame();
	}

	startNewGame() {
		const startState = this.api.createState();
		console.log(JSON.parse(startState));
	}
}