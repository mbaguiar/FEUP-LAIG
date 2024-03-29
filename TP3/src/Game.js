/**
 * Game
 * @constructor
 */
class Game {
	constructor() {
		this.api = new PrologAPI();
		this.initInterfaceValues();
		this.timerStopped = true;
		this.eventCounter = 0;
		this.eventQueue = [];
		this.stopped = false;
	}

	/**
	 * Static getter to use Game as Singleton
	 */
	static getInstance() {
		if (!Game.self) {
			Game.self = new Game();
		}
		return Game.self;
	}

	/**
	 * Parses Prolog state to JS state
	 * @param  {} state
	 */
	static toJsState(state) {
		return {
			board: [...state[0]],
			player: state[1],
			score: [...state[2]]
		};
	}

	/**
	 * Parses JS state to Prolog state
	 * @param  {} state
	 */
	static toPrologState(state) {
		return [state.board, state.player, state.score];
	}

	/**
	 * Returns object containing game functions 
	 */
	getGameOptions() {
		return {
			'Start new game': () => this.newGameEvent(),
			'Undo move': () => this.undoMoveEvent(),
			'Pause game': () => this.pauseGameEvent(),
			'Replay game': () => this.replayGameEvent(),
			'Open box': () => this.openBoxEvent(),
			'View instructions': () => this.changeCameraEvent(),
		};
	}

	/**
	 * Returns static object mapping player types to ints since there is no static data members in JS
	 */
	static getPlayerOptions() {
		return {
			'Human': 0,
			'Random CPU': 1,
			'AI': 2
		};
	}

	/**
	 *  Calculate piece id based on row and col
	 * @param  {} row
	 * @param  {} col
	 */
	static calculateId(row, col) {
		return row * 13 + col;
	}

	/**
	 * Initializes data members correpsonding to the interface's variables
	 */
	initInterfaceValues() {
		this.interface = {};
		this.interface['Player 1 (Red)'] = 'Human';
		this.interface['Player 2 (Blue)'] = 'Human';
		this.interface['Camera rotation'] = true;
		this.interface['Turn timer'] = 15;
	}

	/**
	 * Register a event
	 */
	eventStarted() {
		this.eventCounter++;
	}

	/**
	 * Unregister an event
	 */
	eventEnded() {
		this.eventCounter--;
	}

	/**
	 * Checks if playing is allowed based on game state
	 */
	allowPlay() {
		return this.allowEvent() && this.eventQueue.length === 0 && !this.stopped;
	}

	/**
	 * Checks if an event can start based on game state
	 */
	allowEvent() {
		return this.eventCounter === 0;
	}
	
	/**
	 * Fetches game options from datGUI values at the interface
	 */
	getCurrentGameOptions() {
		this.currGameOptions = {
			player1: Game.getPlayerOptions()[this.interface['Player 1 (Red)']],
			player2: Game.getPlayerOptions()[this.interface['Player 2 (Blue)']],
			turnTimer: Math.trunc(this.interface['Turn timer']),
			cameraAnimation: this.interface['Camera rotation']
		};
	}

	/**
	 * Event triggering a new game start
	 */
	newGameEvent() {
		this.stopped = false;
		this.eventQueue = [() => this.startNewGame()];
	}

	/**
	 * Event triggering a move undo
	 */
	undoMoveEvent() {
		if (this.replay || this.stopped || this.winner) return;
		this.eventQueue = [() => this.undoMove()];
	}

	/**
	 * Event triggering a game replay
	 */
	replayGameEvent() {
		if (this.replay)
			return;
		this.stopped = false;
		this.eventQueue = [() => this.startGameReplay()];
	}

	/**
	 * Event triggering opening the game box
	 */
	openBoxEvent() {
		this.scene.interface.removeBox();
		this.board.openBox();
		this.eventQueue.push(() => this.scene.interface.addGameGroup());
		this.camera = 'player';
	}

	/**
	 * Event triggering a camera change (Game<->Instructions)
	 */
	changeCameraEvent() {
		if (this.replay)
			return;
		this.eventQueue.push(() => this.changeCamera());
	}

	/**
	 * Changes camera based on previous position
	 */
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
	
	/**
	 * Pauses or unpauses the game
	 */
	pauseGameEvent() {
		if (this.winner) return;
		if (!this.stopped){
			this.timerStopped = true;
			this.stopped = true;
		} else {
			this.timerStopped = false;
			this.stopped = false;
		}
		this.scene.interface.updatePause(this.stopped);
	}
	
	/**
	 * Sets game scene and intializes visual components which require the scene
	 * @param  {} scene
	 */
	setScene(scene) {
		this.scene = scene;
		this.loadVisuals();
		this.board = new Board(this.scene);
		this.initPieces();
	}

	/**
	 * Async function which resets the needed values and fetches initial state from the Prolog API
	 */
	async startNewGame() {
		this.hideGameOverPanel();
		this.eventStarted();
		this.getCurrentGameOptions();
		this.scene.lockedCam = !this.currGameOptions['cameraAnimation'];
		this.reset();
		const startState = await this.api.createState();
		this.state = { ...Game.toJsState(JSON.parse(startState)) };
		this.eventEnded();
		this.eventQueue.push(() => this.startTurnTimer());
	}

	/**
	 * Resets game state values
	 */
	reset() {
		this.timerStopped = true;
		this.stopped = false;
		this.eventQueue = [];
		this.replay = false;
		this.scene.interface.updatePause(false);
		this.scene.interface.updateReplay(false);
		this.scene.rotateCamera(1);
		this.setStartPieces();
		this.winner = 0;
		this.lastPlayIndex = -1;
		this.playHistory = [];
	}

	/**
	 * Initializes and places default pieces on the board
	 */
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

	/**
	 * Creates a new piece given the color and dispenses it (with animation)
	 * @param  {} color
	 */
	renewPiece(color) {
		this.pieces[color] = new Piece(this.scene, color);
		this.pieces[color].dispense();
	}

	/**
	 * Fetches the current piece at the dispenser for the given color
	 * @param  {} color
	 */
	getDispenserPiece(color) {
		return this.pieces[color];
	}

	/**
	 * Undoes the latest move if there is any
	 */
	undoMove() {
		if (this.lastPlayIndex >= 0 && this.playHistory[this.lastPlayIndex]) {
			this.timerStopped = true;
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

	/**
	 * Removes all non start pieces form the board
	 */
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

	/** 
	 * Removes the first piece ready to be removed for the given color's dispenser
	 * @param  {} color
	 */
	removePieceToDispenser(color) {
		if (this.dispensers[color - 1][0]) {
			this.dispensers[color - 1][0].remove(true);
			this.dispensers[color - 1].splice(0, 1);
		}
	}

	/**
	 * Clears dispenser to receive another piece and removes the last piece from the pieces array
	 * @param  {} color
	 * @param  {} lastPieceRow
	 * @param  {} lastPieceCol
	 */
	setDispenserReady(color, lastPieceRow, lastPieceCol) {
		this.removePieceToDispenser(color);
		this.pieces[Game.calculateId(lastPieceRow, lastPieceCol)] = undefined;
	}

	/**
	 * Triggers a move from the given piece to [row, col]
	 * @param  {} piece
	 * @param  {} row
	 * @param  {} col
	 */
	movePiece(piece, row, col) {
		const id = row * 13 + col;
		this.pieces[id] = piece;
		piece.moveTo(row, col);
	}

	/**
	 * Main play function 
	 * Checks if the given move is valid and fetches the new state if so 
	 * Updates playHistory
	 * Checks game over
	 * Switches turn
	 * @param  {} row
	 * @param  {} col
	 */
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
		this.state = {...newState};
		this.gameOver();
		if (oldPrologState[1] !== this.state.player) {
			this.eventQueue.push(() => this.scene.rotateCamera(this.state.player));
		} else {
			this.checkConnections(row, col);
		}
		this.eventQueue.push(() => this.startTurnTimer());
		this.eventEnded();
	}

	/**
	 * Fetches an AI move given the AI type in player
	 * @param  {} player
	 */
	async moveAI(player) {
		this.timerStopped = true;
		this.eventStarted();
		const move = await this.api.getMove({ board: this.state.board, player: player });
		this.eventEnded();
		const AIMove = JSON.parse(move);
		this.move(AIMove[0], AIMove[1]);
	}

	/**
	 * Tests if game is over and updates state accordingly
	 */
	async gameOver() {
		const state = [this.state.board, this.state.player, this.state.score];
		const newWinner = await this.api.gameOver({ state: state });
		this.winner = parseInt(newWinner);
		if (this.winner > 0) {
			this.eventQueue.push(() => {
				this.timerStopped = true,
				this.stopped = true,
				this.showGameOverPanel()
			});
		}; 
	}

	/**
	 * Restarts turn timer
	 */
	startTurnTimer() {
		if (this.currGameOptions.turnTimer === 0)
			return;
		this.timerStopped = false;
		this.currTimer = this.currGameOptions.turnTimer;
	}

	/**
	 * Trigger a random move if time expires
	 */
	expireTurn() {
		if (!this.winner) this.moveAI(1);
	}

	/**
	 * Sets up game replay
	 * Removes board peices and updates state
	 */
	startGameReplay() {
		this.hideGameOverPanel();
		if (this.playHistory.length){
			this.currReplayIndex = 0;
			this.replay = true;
			this.stopped = false;
			this.timerStopped = true;
			this.state.score = [0, 0];
			this.scene.interface.updatePause(false);
			this.scene.interface.updateReplay(true);
			this.setStartPieces();
			this.eventQueue.push(() => this.replayMove());
		}
	}

	/**
	 * Replays a move
	 */
	replayMove() {
		if (this.replay && this.playHistory[this.currReplayIndex]) {
			this.eventStarted();
			const play = this.playHistory[this.currReplayIndex];
			this.state = play.oldState;
			const move = play.move;
			this.movePiece(this.getDispenserPiece(this.state.player), move[0], move[1]);
			this.renewPiece(this.state.player);
			this.state = play.newState;
			this.currReplayIndex++;
			this.eventQueue.push(() => this.replayMove());
			this.eventEnded();
		} else {
			this.startTurnTimer();
			this.gameOver();
			this.replay = false;
			this.scene.interface.updateReplay(false);
		}
	}

	/**
	 * Checks if move made >=3 connections and if so adds glow animation to pieces
	 * @param  {} row
	 * @param  {} col
	 */
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

	/**
	 * Main update function
	 * Triggers events, animations, AI moves and timer actions
	 * Also updates board elements
	 * @param  {} delta
	 */
	update(delta) {
		if (this.allowEvent() && this.eventQueue[0]) {
			this.eventQueue[0].call();
			this.eventQueue.splice(0, 1);
		}

		if (this.stopped)
			return;

		if (!this.timerStopped && this.currGameOptions.turnTimer !== 0) {
			this.currTimer -= delta/this.scene['Animation speed'] * MILIS_TO_SECS;
			if (this.currTimer <= 0) {
				this.expireTurn();
			}
		}

		if (this.allowPlay() && this.state) {
			if (!this.winner) {
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

	/**
	 * Triggers board display
	 */
	display() {
		if (this.board)
			this.board.display();
	}

	/**
	 * Show game over modal
	 */
	showGameOverPanel() {
		let panel = document.querySelector('.panel');
		panel.style.display = "initial";
		const color = this.winner === 1? 'Red': 'Blue';
		panel.querySelector('h4').innerHTML = `<span class="${color.toLowerCase()}">${color}</span> player won!`;
	}

	/**
	 * Hides game over panel
	 */
	hideGameOverPanel() {
		let panel = document.querySelector('.panel');
		panel.style.display = "none";
	}

	/**
	 * Loads all game visuals that don't vary from scene to scene
	 */
	loadVisuals() {
		this.visuals = {
			noTexture: new CGFappearance(this.scene),
			tileTexture: new CGFappearance(this.scene),
			lightWood : new CGFappearance(this.scene),
			redMaterial: new CGFtexture(this.scene, '../scenes/images/red_marble2.jpg'),
			blueMaterial: new CGFtexture(this.scene, '../scenes/images/blue_marble2.jpg'),
			greenMaterial: new CGFtexture(this.scene, '../scenes/images/green_marble2.jpg'),
			topTex: new CGFtexture(this.scene, '../scenes/images/box_top.jpg'),
			redTex: new CGFtexture(this.scene, '../scenes/images/box_red.jpg'),
			blueTex: new CGFtexture(this.scene, '../scenes/images/box_blue.jpg'),
			redTurn: new CGFtexture(this.scene, '../scenes/images/turn_red.jpg'),
			blueTurn: new CGFtexture(this.scene, '../scenes/images/turn_blue.jpg'),
			numbers: [],
			pieceShader: new CGFshader(this.scene.gl, '../shaders/connection.vert', '../shaders/connection.frag'),
			glowTexture: new CGFtexture(Game.getInstance().scene, '../scenes/images/yellow_marble.jpg'),
			numberShader: new CGFshader(this.scene.gl, '../shaders/number.vert', '../shaders/number.frag'),
		};
		for (let i = 0; i < 10; i++) {
            this.visuals.numbers.push(new CGFtexture(this.scene, `/scenes/images/numbers/${i}.png`));
        }

		this.visuals.tileTexture.loadTexture('scenes/images/tile.jpg'),
		this.visuals.lightWood.loadTexture('scenes/images/light_wood.jpg')
	}
}