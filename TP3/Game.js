class Game {
	constructor() {
		this.api = new PrologAPI();
		this.initInterfaceValues();
		this.timerStopped = true;
		this.eventCounter = 0;
		this.eventQueue = [];
		this.stopped = false;
	}

	static getInstance() {
		if (!Game.self) {
			Game.self = new Game();
		}
		return Game.self;
	}

	static toJsState(state) {
		return {
			board: [...state[0]],
			player: state[1],
			score: [...state[2]]
		};
	}

	static toPrologState(state) {
		return [state.board, state.player, state.score];
	}

	static getGameOptions() {
		return {
			'Start new game': () => Game.getInstance().newGameEvent(),
			'Undo move': () => Game.getInstance().undoMoveEvent(),
			'Pause game': () => Game.getInstance().pauseGameEvent(),
			'Replay game': () => Game.getInstance().replayGameEvent(),
			'Open box': () => Game.getInstance().openBoxEvent(),
			'View instructions': () => Game.getInstance().changeCameraEvent(),
		};
	}

	static getPlayerOptions() {
		return {
			'Human': 0,
			'Random CPU': 1,
			'AI': 2
		};
	}

	static calculateId(row, col) {
		return row * 13 + col;
	}

	initInterfaceValues() {
		this.interface = {};
		this.interface['Player 1 (Red)'] = 'Human';
		this.interface['Player 2 (Blue)'] = 'Human';
		this.interface['Camera rotation'] = true;
		this.interface['Turn timer'] = 15;
	}

	eventStarted() {
		this.eventCounter++;
	}

	eventEnded() {
		this.eventCounter--;
	}

	allowPlay() {
		return this.allowEvent() && this.eventQueue.length === 0 && !this.stopped;
	}

	allowEvent() {
		return this.eventCounter === 0;
	}

	getCurrentGameOptions() {
		this.currGameOptions = {
			player1: Game.getPlayerOptions()[this.interface['Player 1 (Red)']],
			player2: Game.getPlayerOptions()[this.interface['Player 2 (Blue)']],
			turnTimer: Math.trunc(this.interface['Turn timer']),
			cameraAnimation: this.interface['Camera rotation']
		};
	}

	newGameEvent() {
		this.stopped = false;
		this.eventQueue = [() => this.startNewGame()];
	}

	undoMoveEvent() {
		if (this.replay) return;
		this.eventQueue = [() => this.undoMove()];
	}

	replayGameEvent() {
		this.eventQueue = [() => this.startGameReplay()];
	}

	openBoxEvent() {
		this.scene.interface.removeBox();
		this.board.openBox();
		this.eventQueue.push(() => this.scene.interface.addGameGroup());
		this.camera = 'player';
	}

	changeCameraEvent() {
		this.eventQueue.push(() => this.changeCamera());
	}

	changeCamera() {
		if (this.camera === 'player'){
			this.pauseGameEvent();
			this.scene.panToInstructions();
			this.camera = 'instructions';
		} else {
			this.camera = 'player';
			this.scene.panToGame();
			this.eventQueue.push(() => this.pauseGameEvent());
		}
		this.scene.interface.updateView(this.camera !== 'player');
	}

	pauseGameEvent() {
		if (!this.stopped){
			this.timerStopped = true;
			this.stopped = true;
		} else {
			this.timerStopped = false;
			this.stopped = false;
		}
		this.scene.interface.updatePause(this.stopped);
	}
 
	setScene(scene) {
		this.scene = scene;
		this.board = new Board(this.scene);
		this.initPieces();
	}

	async startNewGame() {
		this.eventStarted();
		this.getCurrentGameOptions();
		this.scene.lockedCam = !this.currGameOptions['cameraAnimation'];
		this.reset();
		const startState = await this.api.createState();
		this.state = { ...Game.toJsState(JSON.parse(startState)) };
		this.eventEnded();
		this.eventQueue.push(() => this.startTurnTimer());
		console.log(this.state);
	}

	reset() {
		this.timerStopped = true;
		this.stopped = false;
		this.eventQueue = [];
		this.scene.rotateCamera(1);
		this.setStartPieces();
		this.winner = 0;
		this.lastPlayIndex = -1;
		this.playHistory = [];
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
	}

	renewPiece(color) {
		this.pieces[color] = new Piece(this.scene, color);
		this.pieces[color].dispense();
	}

	getDispenserPiece(color) {
		return this.pieces[color];
	}

	undoMove() {
		if (this.lastPlayIndex >= 0 && this.playHistory[this.lastPlayIndex]) {
			const play = this.playHistory[this.lastPlayIndex];
			this.state = play.oldState;
			const move = play.move;
			const id = Game.calculateId(move[0], move[1]);
			this.pieces[id].remove();
			this.playHistory.splice(this.lastPlayIndex--, 1);
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
		if (this.dispensers[color - 1][0]) {
			this.dispensers[color - 1][0].remove(true);
			this.dispensers[color - 1].splice(0, 1);
		}
	}

	setDispenserReady(color, lastPieceRow, lastPieceCol) {
		this.removePieceToDispenser(color);
		this.pieces[Game.calculateId(lastPieceRow, lastPieceCol)] = undefined;
	}

	movePiece(piece, row, col) {
		const id = row * 13 + col;
		this.pieces[id] = piece;
		piece.moveTo(row, col);
	}

	async move(row, col) {
		if (!this.allowPlay()) return;
		this.eventStarted();
		this.timerStopped = true;
		const valid = await this.api.validMove({ move: [row, col], board: this.state.board });
		if (!parseInt(valid)) {
			this.eventEnded();
			return;
		}

		this.movePiece(this.getDispenserPiece(this.state.player), row, col);
		this.renewPiece(this.state.player);
		const oldPrologState = Game.toPrologState(this.state);
		const newPrologState = await this.api.move({ move: [row, col], state: oldPrologState });
		const newState = { ...Game.toJsState(JSON.parse(newPrologState)) };
		this.playHistory.push({ oldState: this.state, newState: newState, move: [row, col] });
		this.lastPlayIndex++;
		this.state = newState;
		this.gameOver();
		if (oldPrologState[1] !== this.state.player) {
			this.eventQueue.push(() => this.scene.rotateCamera(this.state.player));
		} else {
			this.checkConnections(row, col);
		}
		this.eventQueue.push(() => this.startTurnTimer());
		this.eventEnded();
		console.log(this.state);
	}

	async moveAI(player) {
		this.timerStopped = true;
		this.eventStarted();
		const move = await this.api.getMove({ board: this.state.board, player: player });
		this.eventEnded();
		const AIMove = JSON.parse(move);
		this.move(AIMove[0], AIMove[1]);
	}

	async gameOver() {
		const state = [this.state.board, this.state.player, this.state.score];
		const newWinner = await this.api.gameOver({ state: state });
		this.winner = parseInt(newWinner);
		if (this.winner !== 0) {
			alert("game over, todo fazer cenas bonitas com isto");
			return;
		}
	}

	startTurnTimer() {
		this.timerStopped = false;
		this.currTimer = this.currGameOptions.turnTimer;
	}

	expireTurn() {
		this.moveAI(1);
	}

	startGameReplay() {
		if (this.playHistory.length){
			this.replay = true;
			this.timerStopped = true;
			this.state.score = [0, 0];
			this.initPieces();
			this.setStartPieces();
			this.eventQueue.push(() => this.replayMove());
		}
	}

	replayMove() {
		if (this.replay && this.playHistory[0]) {
			this.eventStarted();
			const play = this.playHistory[0];
			this.state = play.oldState;
			const move = play.move;
			this.movePiece(this.getDispenserPiece(this.state.player), move[0], move[1]);
			this.renewPiece(this.state.player);
			this.state = play.newState;
			this.playHistory.splice(0, 1);
			this.eventQueue.push(() => this.replayMove());
			this.eventEnded();
		}
	}

	checkConnections(row, col) {
		const id = Game.calculateId(row, col);
		const adj = [-13, 1, 13, -1];
		for (const offset of adj) {
			const newId = id + offset;
			if (this.pieces.hasOwnProperty(newId)) {
				const piece = this.pieces[newId];
				if (piece)
					this.eventQueue.push(() => piece.addGlowAnimation());
			}
		}
	}

	update(delta) {
		if (this.allowEvent() && this.eventQueue[0]) {
			this.eventQueue[0].call();
			this.eventQueue.splice(0, 1);
		}

		if (this.stopped)
			return;

		if (!this.timerStopped) {
			this.currTimer -= delta * MILIS_TO_SECS;
			if (this.currTimer <= 0) {
				this.expireTurn();
			}
		}

		if (this.allowPlay() && this.state) {
			if (this.winner <= 0) {
				if (this.state.player === 1 && this.currGameOptions.player1 > 0) {
					this.moveAI(this.currGameOptions.player1);
				} else if (this.state.player === 2 && this.currGameOptions.player2 > 0) {
					this.moveAI(this.currGameOptions.player2);
				}
			}
		}

		if (this.pieces)
			for (const k in this.pieces) {
				const p = this.pieces[k];
				if (p)
					p.update(delta)
			}
		if (this.board)
			this.board.update(delta);
	}

	display() {
		if (this.board)
			this.board.display();
	}
}