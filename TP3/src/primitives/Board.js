class Board {
	constructor(scene) {
		this.scene = scene;
		this.initAuxComponents();
		this.setupVisuals();
	}

	initAuxComponents() {
		this.counter = new Counter(this.scene);
		this.timer = new Timer(this.scene);
		this.redDispenser = new Dispenser(this.scene, 1);
		this.blueDispenser = new Dispenser(this.scene, 2);
		this.box = new Box(this.scene);
		this.cube = new Cube(this.scene);
		this.pickSquare = new Rectangle(this.scene, -2.5, -2.5, 2.5, 2.5);
	}

	setupVisuals() {
		this.noTexture = Game.getInstance().visuals.noTexture;
		this.tileTexture = Game.getInstance().visuals.tileTexture;
		this.boardTexture = Game.getInstance().visuals.lightWood;
		this.redMaterial = Game.getInstance().visuals.redMaterial;
		this.blueMaterial = Game.getInstance().visuals.blueMaterial;
		this.greenMaterial = Game.getInstance().visuals.greenMaterial;
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
		this.scene.pushMatrix();
			this.scene.translate(0, -21.5, 0);
			this.displayAuxComponents();
			this.tileTexture.apply();
			this.setupPicking();
			this.boardTexture.apply();
			this.displayBoard();
			this.noTexture.apply();
			this.displayGame();
		this.scene.popMatrix();
	}

	displayGame() {
		if (Game.getInstance().hasOwnProperty('pieces')) {
			const pieces = Game.getInstance().pieces;
			pieces.forEach(p => {
				if (!p) return;
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

	displayAuxComponents() {
		this.scene.pushMatrix();
			this.counter.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.timer.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.redDispenser.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.blueDispenser.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.box.display();
		this.scene.popMatrix();
	}

	update(delta) {
		this.counter.update(delta);
		this.timer.update(delta);
		this.redDispenser.update(delta);
		this.blueDispenser.update(delta);
		this.box.update(delta);
	}

	openBox() {
		this.box.addPlacementAnimation();
		Game.getInstance().eventQueue.push(() => {
			this.counter.addPlacementAnimation(), 
			this.timer.addPlacementAnimation(),
			this.redDispenser.addPlacementAnimation(),
			this.blueDispenser.addPlacementAnimation()
		});
		Game.getInstance().eventQueue.push(() => this.scene.panToGame());
	}
}