class Board {
	constructor(scene) {
		this.scene = scene;
		this.cube = new Cube(this.scene);
		this.pickSquare = new Rectangle(this.scene, -2.5, -2.5, 2.5, 2.5);
		this.noTexture = new CGFappearance(this.scene);
		this.testTexture = new CGFappearance(this.scene);
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
			this.cube.display();
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
			const pieces = Game.getInstance().pieces;
			pieces.forEach(p => {
				this.setMaterial(p.color);
				p.display();
			});
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