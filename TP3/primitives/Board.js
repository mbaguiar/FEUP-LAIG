class Board {
	constructor(scene) {
		this.scene = scene;
		this.square = new Rectangle(this.scene, -0.5, -0.5, 0.5, 0.5);
		this.pickSquare = new Rectangle(this.scene, -2.5, -2.5, 2.5, 2.5);
		this.noTexture = new CGFappearance(this.scene);
		this.testTexture = new CGFappearance(this.scene);
		this.testTexture.loadTexture('../scenes/images/grid.jpg');
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
	}
}