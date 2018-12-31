class Dispenser {
	constructor(scene) {
		this.scene = scene;
		this.cube = new Cube(scene);
	}

	display() {
		this.scene.pushMatrix();
			this.scene.scale(2.5, 2, 2.5);
			this.cube.display();
		this.scene.popMatrix();
	}
}