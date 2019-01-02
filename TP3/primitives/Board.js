class Board {
	constructor(scene) {
		this.scene = scene;
		this.cube = new Cube(this.scene);
		this.pickSquare = new Rectangle(this.scene, -2.5, -2.5, 2.5, 2.5);
		this.noTexture = new CGFappearance(this.scene);
		this.tileTexture = new CGFappearance(this.scene);
		this.tileTexture.loadTexture('../scenes/images/tile.jpg');
		this.boardTexture = new CGFappearance(this.scene);
		this.boardTexture.loadTexture('../scenes/images/light_wood.jpg');
		this.redMaterial = new CGFtexture(this.scene, '../scenes/images/red_marble2.jpg');
		this.blueMaterial = new CGFtexture(this.scene, '../scenes/images/blue_marble2.jpg');
		this.greenMaterial = new CGFtexture(this.scene, '../scenes/images/green_marble2.jpg');
		this.material = new CGFappearance(this.scene);
        this.material.setEmission(0, 0, 0, 1);
        this.material.setAmbient(0.1, 0.1, 0.1, 1);
        this.material.setDiffuse(1, 1, 1, 1);
		this.material.setSpecular(0.03, 0.03, 0.03, 1);
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
			this.tileTexture.apply();
			this.setupPicking();
			this.boardTexture.apply();
			this.displayBoard();
			this.noTexture.apply();
			this.displayGame();
	}

	displayGame() {
		if (Game.getInstance().state) {
			const pieces = Game.getInstance().pieces;
			pieces.forEach(p => {
				this.setMaterial(p.color);
				this.material.apply();
				p.display();
			});
		}
	}

	setMaterial(color) {
		if (color === 1) {
			this.material.setTexture(this.redMaterial);
		} else if (color === 2) {
			this.material.setTexture(this.blueMaterial);
		} else if (color === 3) {
			this.material.setTexture(this.greenMaterial);
		}
	}
}