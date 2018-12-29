class Game {
	constructor() {
		this.api = new PrologAPI();
		this.allowPlay = false;
		this['player1'] = 'Human';
		this['player2'] = 'Human';
		this.playerOptions = {'Human': 0, 'AI1': 1, 'AI2': 2};
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

	setScene(scene) {
		this.scene = scene;
	}

	async startNewGame() {
		const startState = await this.api.createState();
		this.state = {...Game.parseState(JSON.parse(startState))};
		this.player1 = this.playerOptions[this['player1']];
		this.player2 = this.playerOptions[this['player2']];
		this.winner = 0;
		this.initPieces(this.state);
		this.playHistory = [];
		this.allowPlay = true;
		console.log(this.state);
	}

	initPieces({board}) {
		this.pieces = [];
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board.length; j++) {
				const piece = board[i][j];
				if (piece) {
					this.pieces.push(new Piece(this.scene, i+1, j+1, piece));
				}
			}
		}
	}

	undoMove() {
		//this.state = this.playHistory[0]? this.playHistory[0]: this.state;
		alert('Good try bro');
	}

	async move(row, col) {
		if (!this.allowPlay) return;
		const valid = await this.api.validMove({move: [row, col], board:this.state.board});
		if (!parseInt(valid)) return;
		this.allowPlay = false;
		let state = [this.state.board, this.state.player, this.state.score];
		const newState = await this.api.move({move: [row, col], state: state});
		this.pieces.push(new Piece(this.scene, row, col, this.state.player));
		this.playHistory.unshift(this.playHistory);
		this.state = {...Game.parseState(JSON.parse(newState))};
		console.log(this.state);
	}

	async gameOver() {
		let state = [this.state.board, this.state.player, this.state.score];
		const newWinner = await this.api.gameOver({state: state});
		this.winner = parseInt(newWinner);
		if (this.winner !== 0) {
			alert("game over, todo fazer cenas bonitas com isto");
			return;
		}
	}

	static parseState(o) {
		return {
			board: [...o[0]],
			player: o[1],
			score: [...o[2]]
		};
	}

	update(delta) {
		if (!this.pieces) return;
		for (const p of this.pieces) {
			p.update(delta);
		}
	}
}