class Water extends Plane {
	constructor(scene){
		super(scene, 50, 50);
		this.setupShader();
		this.time = 0;
	}

	setupShader() {
		this.shader = new CGFshader(this.scene.gl, "../shaders/water.vert", "../shaders/water.frag");
		this.texture = new CGFtexture(this.scene, "../scenes/images/water2.jpg");
		this.heightMap = new CGFtexture(this.scene, "../scenes/images/wave-height-map.png");
		this.shader.setUniformsValues({textureSampler: 0});
		this.shader.setUniformsValues({heightMapSampler: 1});
	}

	update(delta){
		this.time += delta;
		this.shader.setUniformsValues({timeFactor: this.time});
	}

	display() {
		this.scene.setActiveShader(this.shader);
		this.texture.bind(0);
		this.heightMap.bind(1);
		super.display();
		this.heightMap.unbind(1);
		this.texture.unbind(0);
		this.scene.setActiveShader(this.scene.defaultShader);
	}

}