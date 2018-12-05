class Light extends Sphere {
	constructor(scene) {
		super(scene, 1, 50, 50);
		this.shader = new CGFshader(this.scene.gl, "../shaders/light.vert", "../shaders/light.frag");
		this.time = 0;
	}

	update(delta){
		this.time += delta;
		this.shader.setUniformsValues({timeFactor: this.time});
	}

	display() {
		this.scene.setActiveShader(this.shader);
		super.display();
		this.scene.setActiveShader(this.scene.defaultShader)
	}
}