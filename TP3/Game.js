class Game {
	constructor() {
		this.api = new PrologAPI();
		this['Player 1 (Red)'] = 'Human';
		this['Player 2 (Blue)'] = 'Human';
		this['Camera animation'] = true;
		this['Turn timer'] = 15;
		this.timerStopped = true;
		this.firstTime = true;
		this.eventCounter = 0;
		this.eventQueue = [];
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
			'Start new game': () => Game.getInstance().newGameEvent(),
			'Undo move': () => Game.getInstance().undoMoveEvent(),
			'Pause/Resume timer': () => {Game.getInstance().timerStopped = !Game.getInstance().timerStopped}
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
			[Game.getInstance(), 'Turn timer', 5, 60],
			[Game.getInstance(), 'Player 1 (Red)', Object.keys(Game.getPlayerOptions())],
			[Game.getInstance(), 'Player 2 (Blue)', Object.keys(Game.getPlayerOptions())],
			[Game.getGameOptions(), 'Start new game'],
			[Game.getGameOptions(), 'Undo move'],
			[Game.getGameOptions(), 'Pause/Resume timer'],
		];
	}

	static calculateId(row, col) {
		return row*13 + col;
	}

	static getInstance() {
		if (!Game.self) {
			Game.self = new Game();
		}
		return Game.self;
	}

	newGameEvent() {
		this.eventQueue = [() => this.startNewGame()];
	}

	undoMoveEvent() {
		this.eventQueue = [() => this.undoMove()];
	}

	setScene(scene) {
		this.scene = scene;
	}

	async startNewGame() {
		this.eventStarted();
		this.timerStopped = true;
		this.eventQueue = [];
		this.scene.rotateCamera(1);
		if (this.firstTime) 
			this.initPieces();
		this.setStartPieces();
		const startState = await this.api.createState();
		this.state = {...Game.parseState(JSON.parse(startState))};
		this.player1 = Game.getPlayerOptions()[this['Player 1 (Red)']];
		this.player2 = Game.getPlayerOptions()[this['Player 2 (Blue)']];
		this.turnTimer = Math.trunc(this['Turn timer']);
		this.winner = 0;
		this.playHistory = [];
		this.eventEnded();
		this.eventQueue.push(() => this.startTurnTimer());
		console.log(this.state);
	}

	initPieces() {
		this.pieces = [];
		for (let i = 1; i <= 13; i++) {
			for (let j = 1; j <= 13; j++) {
				if (j === 1 || j === 13 || i === 1 || i === 13) {
					this.pieces[Game.calculateId(i, j)] = new Piece(this.scene, 3, i, j);	
				}
			}
		}
		this.firstTime = false;
	}

	renewPiece(color) {
		this.pieces[color] = new Piece(this.scene, color);
		this.pieces[color].dispense();
	}

	getDispenserPiece(color) {
		return this.pieces[color];
	}

	undoMove() {
		if (this.playHistory[0]){
			this.state = this.playHistory[0].state;
			const move = this.playHistory[0].move;
			const id = Game.calculateId(move[0], move[1]);
			this.pieces[id].remove();
			this.playHistory.splice(0, 1);
			this.eventQueue.push(() => this.scene.rotateCamera(this.state.player));
			this.eventQueue.push(() => this.startTurnTimer());
		}
	}

	setStartPieces() {
		this.renewPiece(1);
		this.renewPiece(2);
		this.dispensers = [[], []];
		for (const key in this.pieces) {
			if (key == 1 || key == 2) { //Dispenser pieces
				continue;
			} 
			const piece = this.pieces[key];
			if (!piece) continue;
			if (piece.color === 1) { 
				this.dispensers[0].push(piece);
			} else if (piece.color === 2) {
				this.dispensers[1].unshift(piece);
			}
		}
		this.removePieceToDispenser(1);
		this.removePieceToDispenser(2);
	}

	removePieceToDispenser(color) {
		if (this.dispensers[color-1][0]){
			this.dispensers[color-1][0].remove(true);
			this.dispensers[color-1].splice(0, 1);
		}
	}

	setDispenserReady(color, lastPieceRow, lastPieceCol) {
		this.removePieceToDispenser(color);
		this.pieces[Game.calculateId(lastPieceRow, lastPieceCol)] = undefined;
	}

	movePiece(piece, row, col) {
		const id = row*13 + col;
		this.pieces[id] = piece;
		piece.moveTo(row, col);
	}

	async move(row, col) {
		if (!this.allowPlay()) return;
		this.timerStopped = true;
		this.eventStarted();
		const valid = await this.api.validMove({move: [row, col], board:this.state.board});
		if (!parseInt(valid)) {
			this.eventEnded();
			return;
		}
		const oldState = [this.state.board, this.state.player, this.state.score];
		const newState = await this.api.move({move: [row, col], state: oldState});
		this.eventEnded();
		this.movePiece(this.getDispenserPiece(this.state.player), row, col);
		this.renewPiece(this.state.player);
		this.playHistory.unshift({state: this.state, move: [row, col]});
		this.state = {...Game.parseState(JSON.parse(newState))};
		this.gameOver();
		if (oldState[1] !== this.state.player) {
			this.eventQueue.push(() => this.scene.rotateCamera(this.state.player));
		}
		this.eventQueue.push(() => this.startTurnTimer());
		console.log(this.state);
	}

	async moveAI(player) {
		this.timerStopped = true;
		this.eventStarted();
		const move = await this.api.getMove({board: this.state.board, player: player});
		this.eventEnded();
		const AIMove = JSON.parse(move);
		this.move(AIMove[0], AIMove[1]);
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

	startTurnTimer() {
		this.timerStopped = false;
		this.currTimer = this.turnTimer;
	}

	expireTurn() {
		this.moveAI(1);
	}

	update(delta) {
		if (this.allowPlay() && this.eventQueue[0]){
			this.eventQueue[0].call();
			this.eventQueue.splice(0, 1);
		}

		if (!this.timerStopped) {
			this.currTimer -= delta * MILIS_TO_SECS;
			console.log('not stopped');
			if (this.currTimer <= 0) {
				this.expireTurn();
			}
		}

		if (this.allowPlay() && this.state) {
			if (this.winner <= 0) {
				if (this.state.player === 1 && this.player1 > 0) {
					this.moveAI(this.player1);
				} else if (this.state.player === 2 && this.player2 > 0) {
					this.moveAI(this.player2);
				}
			}
		}

		if (this.pieces)
			for (const k in this.pieces) {
				const p = this.pieces[k];
				if (p)
					p.update(delta)
			}
	}
}