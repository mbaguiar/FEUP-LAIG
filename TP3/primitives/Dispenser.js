class Dispenser {
	constructor(scene) {
		this.scene = scene;
		this.cube = new Cube(scene);
		this.noTexture = new CGFappearance(this.scene);
		this.woodTexture = new CGFappearance(this.scene);
		this.woodTexture.loadTexture('../scenes/images/light_wood.jpg');
	}

	display() {
		this.woodTexture.apply();
		this.scene.pushMatrix();
			this.scene.translate(0, 0.25, 0);
			this.scene.scale(10, 0.5, 5);
			this.cube.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.scene.translate(2.5, 1.5, 2.25);
			this.scene.scale(5, 3, 0.5);
			this.cube.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.scene.translate(2.5, 1.5, -2.25);
			this.scene.scale(5, 3, 0.5);
			this.cube.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.scene.translate(4.75, 1.5, 0);
			this.scene.scale(0.5, 3, 5);
			this.cube.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.scene.translate(2.5, 3, 0);
			this.scene.scale(5, 0.5, 5);
			this.cube.display();
		this.scene.popMatrix();
		this.noTexture.apply();
			
	}
}