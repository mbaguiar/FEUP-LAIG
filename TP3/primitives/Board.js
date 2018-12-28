class Board {
	constructor(scene) {
		this.scene = scene;
		this.square = new Rectangle(this.scene, -0.5, -0.5, 0.5, 0.5);
		this.pickSquare = new Rectangle(this.scene, -2.5, -2.5, 2.5, 2.5);
		this.noTexture = new CGFappearance(this.scene);
		this.testTexture = new CGFappearance(this.scene);
		this.piece = new Piece(this.scene);
		this.testTexture.loadTexture('../scenes/images/grid.jpg');
		this.redMaterial = new CGFappearance(this.scene);
		this.redMaterial.setDiffuse(1, 0, 0, 1);
		this.blueMaterial = new CGFappearance(this.scene);
		this.blueMaterial.setDiffuse(0, 0, 1, 1);
		this.greenMaterial = new CGFappearance(this.scene);
		this.greenMaterial.setDiffuse(0, 1, 0, 1);
	}

	displayBoard() {
		this.scene.pushMatrix();
			this.scene.scale(75, 2, 75);
			this.scene.pushMatrix();
				this.scene.translate(0.5, 0, 0);
				this.scene.rotate(Math.PI/2, 0, 1, 0);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(0, 0, 0.5);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(0, 0, -0.5);
				this.scene.rotate(-Math.PI, 0, 1, 0);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(0.5, 0, 0);
				this.scene.rotate(-Math.PI/2, 0, 1, 0);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(0, 0.5, 0);
				this.scene.rotate(-Math.PI/2, 1, 0, 0);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(0, -0.5, 0);
				this.scene.rotate(Math.PI/2, 1, 0, 0);
				this.square.display();
			this.scene.popMatrix();
		this.scene.popMatrix();
	}

	setupPicking() {
		this.scene.pushMatrix();
		this.scene.translate(-30, 1.05, -30);
		for (let i = 0; i < 13; i++) {
			for (let j = 0; j < 13; j++) {
				const id = 13*i+j;
				this.scene.registerForPick(id, this.pickSquare);
				this.scene.pushMatrix();
				this.scene.translate(5*j, 0, 5*i);
				this.scene.rotate(-Math.PI/2, 1, 0, 0);
				this.pickSquare.display();
				this.scene.popMatrix();
			}
		}
		
		this.scene.popMatrix();
	}

	display() {
		/* if (this.scene.pickMode)
		else */
			this.testTexture.apply();
			this.setupPicking();
			this.noTexture.apply();
			this.displayBoard();
			this.displayGame();
	}

	displayGame() {
		if (Game.getInstance().state) {
			let board = Game.getInstance().state.board;
			this.scene.pushMatrix();
			this.scene.translate(-30, 2, -30);
			for (let i = 0; i < 13; i++) {
				for (let j = 0; j < 13; j++) {
					if (board[i][j] > 0) {
						this.scene.pushMatrix();
						this.scene.translate(5*j, 0, 5*i);
						this.setMaterial(board[i][j]);
						this.piece.display();
						this.scene.popMatrix();
					}
				}
			}

			this.scene.popMatrix();
		}
	}

	setMaterial(color) {
		if (color === 1) {
			this.redMaterial.apply();
		} else if (color === 2) {
			this.blueMaterial.apply();
		} else if (color === 3) {
			this.greenMaterial.apply();
		}
	}
}