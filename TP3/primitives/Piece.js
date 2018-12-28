class Piece {
	constructor(scene) {
		this.scene = scene;
		this.sphere = new Sphere(this.scene, 1.5, 30, 30);
		//this.shader = new CGFshader(this.scene.gl, '../shaders/piece.vert', '../shaders/piece.frag');
		/* this.pickSquare = new Rectangle(this.scene, -2.5, -2.5, 2.5, 2.5);
		this.noTexture = new CGFappearance(this.scene);
		this.testTexture = new CGFappearance(this.scene); */
	}

	display() {
		this.scene.pushMatrix();
			//this.scene.setActiveShader(this.shader);
			this.scene.scale(1, 0.5, 1);
			this.sphere.display();
			//this.scene.setActiveShader(this.scene.defaultShader);
		this.scene.popMatrix();
	}

}