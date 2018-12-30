class Game {
	constructor() {
		this.api = new PrologAPI();
		this.eventCounter = 0;
	}

	eventStarted() {
		this.eventCounter++;
	}

	eventEnded() {
		this.eventCounter--;
	}

	allowPlay() {
		return this.eventCounter === 0;
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
		this.eventStarted();
		const startState = await this.api.createState();
		this.state = {...Game.parseState(JSON.parse(startState))};
		this.player1 = 0;
		this.player2 = 0;
		this.winner = 0;
		this.playHistory = [];
		this.initPieces(this.state);
		this.eventEnded();
		console.log(this.state);
	}

	initPieces({board}) {
		this.pieces = [];
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board.length; j++) {
				const piece = board[i][j];
				if (piece) {
					this.pieces.push(new Piece(this.scene, piece, i+1, j+1));
				}
			}
		}
		this.renewPiece(1);
		this.renewPiece(2);
	}

	renewPiece(color) {
		const pieceColor = color === 1? 'redPiece': 'bluePiece';
		this[pieceColor] = new Piece(this.scene, color);
		this[pieceColor].dispense();
		this.pieces.push(this[pieceColor]);
	}

	getPiece(color) {
		return color === 1 ? this.redPiece: this.bluePiece;
	}

	undoMove() {
		//this.state = this.playHistory[0]? this.playHistory[0]: this.state;
		alert('Good try bro');
	}

	async move(row, col) {
		if (!this.allowPlay()) return;
		this.eventStarted();
		const valid = await this.api.validMove({move: [row, col], board:this.state.board});
		this.eventEnded();
		if (!parseInt(valid)) return;
		let state = [this.state.board, this.state.player, this.state.score];
		this.eventStarted();
		const newState = await this.api.move({move: [row, col], state: state});
		this.eventEnded();
		this.getPiece(this.state.player).moveTo(row, col);
		this.renewPiece(this.state.player);
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
			p.update(delta)
		}

	}
}