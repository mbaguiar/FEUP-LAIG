class Game {
	constructor() {
		this.api = new PrologAPI();
	}

	static getGameOptions() {
		return {
			'Start new game': () => Game.getInstance().startNewGame(),
			'Undo move': () => Game.getInstance().undoMove()
		};
	}

	static getInstance() {
		if (!Game.self) {
			Game.self = new Game();
		}
		return Game.self;
	}

	async startNewGame() {
		const startState = await this.api.createState();
		this.state = {...Game.parseState(JSON.parse(startState))};
		this.playHistory = [];
		console.log(this.state);
	}

	undoMove() {
		//this.state = this.playHistory[0]? this.playHistory[0]: this.state;
		alert('Good try bro');
	}

	move(move) {
		const newState = this.api.move({move, state: this.state});
		this.playHistory.unshift(this.playHistory);
		console.log(JSON.parse(newState));
	}

	static parseState(o) {
		return {
			board: [...o[0]],
			player: o[1],
			score: [...o[2]]
		};
	}
}