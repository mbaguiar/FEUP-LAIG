/**
 * MyQuad
 * @constructor
 */
class MyCylinder extends CGFobject
{
	constructor(scene, slices, stacks) 
	{
		super(scene);
		this.slices = slices;
		this.stacks = stacks;

		this.initBuffers();
	};

	initBuffers() 
	{	
		this.vertices = [];
		this.indices = [];
		this.normals = [];

		let ang = 0;
		let angDelta = Math.PI * 2 / this.slices;
		
		let z = 0;
		let zDelta = 1.0/this.stacks;

		for (let j = 0; j < this.stacks; j++){

			for (let i = 0; i < this.slices; i++){
				this.vertices.push(Math.cos(ang) / 2, Math.sin(ang) / 2, z + zDelta);
				this.vertices.push(Math.cos(ang) / 2, Math.sin(ang) / 2, z);
				for (let j = 0; j < 2; j++){
					this.normals.push(Math.cos(ang), Math.sin(ang), 0);
				}
				ang += angDelta;
			}

			z += zDelta;
			let aux = 2 * j * this.slices;

			for (let i = aux; i < aux + 2 * this.slices - 2 ; i += 2){
				this.indices.push(i, i+1, i+2);
				this.indices.push(i+2, i+1, i+3);
			}

			this.indices.push(aux + 2 * this.slices - 1, aux + 1,aux);
			this.indices.push(aux + 2 * this.slices - 2, aux + 2 * this.slices - 1, aux);
	}

	
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};
