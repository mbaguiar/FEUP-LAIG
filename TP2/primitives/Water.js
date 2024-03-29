class Water extends Plane {
	constructor(scene, graph, idtexture, idwavemap, parts, heightscale, texscale){
		super(scene, parts, parts);
		this.setupShader(graph, idtexture, idwavemap, heightscale, texscale);
		this.time = 0;
	}

	setupShader(graph, idtexture, idwavemap, heightscale, texscale) {
		this.shader = new CGFshader(this.scene.gl, "../shaders/water.vert", "../shaders/water.frag");
		this.texture = graph.textures[idtexture];
		this.heightMap = graph.textures[idwavemap];
		this.shader.setUniformsValues({textureSampler: 0});
		this.shader.setUniformsValues({heightMapSampler: 1});
		this.shader.setUniformsValues({heightScale: heightscale});
		this.shader.setUniformsValues({texScale: texscale});
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