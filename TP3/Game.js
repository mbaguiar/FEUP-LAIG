class Game {
	constructor() {
		this.api = new PrologAPI();
		this['Player 1 (Red)'] = 'Human';
		this['Player 2 (Blue)'] = 'Human';
		this['Camera animation'] = true;
		this.eventCounter = 0;
		this.animationQueue = [];
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

	static getPlayerOptions() {
		return {
			'Human': 0,
			'Random CPU': 1,
			'AI': 2
		};
	}

	static getGameInterface() {
		return [
			[Game.getInstance(), 'Camera animation'],
			[Game.getInstance(), 'Player 1 (Red)', Object.keys(Game.getPlayerOptions())],
			[Game.getInstance(), 'Player 2 (Blue)', Object.keys(Game.getPlayerOptions())],
			[Game.getGameOptions(), 'Start new game'],
			[Game.getGameOptions(), 'Undo move'],
		];
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
		this.scene.rotateCamera(1);
		const startState = await this.api.createState();
		this.state = {...Game.parseState(JSON.parse(startState))};
		this.player1 = Game.getPlayerOptions()[this['Player 1 (Red)']];
		this.player2 = Game.getPlayerOptions()[this['Player 2 (Blue)']];
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
		if (!parseInt(valid)) {
			this.eventEnded();
			return;
		}
		const oldState = [this.state.board, this.state.player, this.state.score];
		const newState = await this.api.move({move: [row, col], state: oldState});
		this.eventEnded();
		this.getPiece(this.state.player).moveTo(row, col);
		this.renewPiece(this.state.player);
		this.playHistory.unshift(this.playHistory);
		this.state = {...Game.parseState(JSON.parse(newState))};
		this.gameOver();
		if (oldState[1] !== this.state.player) {
			this.animationQueue.push(() => this.scene.rotateCamera(this.state.player));
		}
		console.log(this.state);
	}

	async moveAI(player) {
		this.eventStarted();
		const move = await this.api.getMove({board: this.state.board, player: player});
		this.eventEnded();
		let player_move = JSON.parse(move);
		this.move(player_move[0], player_move[1]);
		console.log(player_move);
	}

	async gameOver() {
		const state = [this.state.board, this.state.player, this.state.score];
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
		if (this.allowPlay() && this.state) {
			if (this.winner <= 0) {
				if (this.state.player === 1 && this.player1 > 0) {
					this.moveAI(this.player1);
				} else if (this.state.player === 2 && this.player2 > 0) {
					this.moveAI(this.player2);
				}
			}
		}
		if (!this.pieces) return;
		for (const p of this.pieces) {
			p.update(delta)
		}
		if (this.allowPlay() && this.animationQueue[0]){
			this.animationQueue[0].call();
			this.animationQueue.splice(0, 1);
		}

	}
}