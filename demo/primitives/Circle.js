class Circle extends CGFobject
{
	constructor(scene, slices) {
        super(scene);
        this.slices = slices;
		this.initBuffers();
	};

	initBuffers() 
	{
		this.vertices = [];
		this.indices = [];
		this.normals = [];
        this.texCoords = [];

        this.vertices.push(0, 0, 0);
        this.texCoords.push(0.5, 0.5);
	    this.normals.push(0, 0, 1);
        
        
        let angDelta = Math.PI * 2 / this.slices;
        for (let i = 0; i < this.slices; i++){
            this.vertices.push(Math.cos(i * angDelta), Math.sin(i * angDelta), 0);
            this.normals.push(0, 0, 1);
			this.texCoords.push(0.5 + Math.cos(i * angDelta), 0.5 - Math.sin(i * angDelta));
 	    }

        for(let i = 0; i < this.slices - 1 ; i++){
            this.indices.push(i+1, i+2, 0);
        }

	    this.indices.push(this.slices, 1, 0);

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};