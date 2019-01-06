class Cube {
	constructor(scene) {
		this.scene = scene;
		this.square = new Rectangle(this.scene, -0.5, -0.5, 0.5, 0.5);
	};

	display() {
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
			this.scene.translate(-0.5, 0, 0);
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
	}
}