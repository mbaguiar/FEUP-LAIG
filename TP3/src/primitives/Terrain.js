class Terrain extends Plane {
	
	constructor(scene, graph, idtexture, idheightmap, parts, heightscale){
		super(scene, parts, parts);
		this.setupShader(graph, idtexture, idheightmap, heightscale);
	}

	setupShader(graph, idtexture, idheightmap, heightscale) {
		this.shader = new CGFshader(this.scene.gl, "../shaders/terrain.vert", "../shaders/terrain.frag");
		this.texture = graph.textures[idtexture];
		this.heightMap = graph.textures[idheightmap];
		//this.texture = new CGFtexture(this.scene, "../scenes/images/terrain.jpg");
		//this.heightMap = new CGFtexture(this.scene, "../scenes/images/terrain-height-map.jpg");
		this.shader.setUniformsValues({textureSampler: 0});
		this.shader.setUniformsValues({heightMapSampler: 1});
		this.shader.setUniformsValues({heightScale: heightscale});

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

