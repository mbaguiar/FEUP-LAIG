/**
 * Sphere
 * @constructor
 */
class Sphere extends CGFobject
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

		let theta = Math.PI * 2 / this.slices;
		let phi = Math.PI / this.stacks;

		for(let i = 0; i <= this.stacks; i++) {
			for(let j = 0; j < this.slices; j++) {
				let x = 1*Math.cos(phi*i)*Math.cos(theta*j);
				let y = 1*Math.cos(phi*i)*Math.sin(theta*j);
				let z = 1*Math.sin(phi*i);
				this.vertices.push(x/ 2, y/2 , z);
				this.normals.push(x, y, z);
			}
		}
			
		for(let i = 0; i < this.stacks; i++) {
			for(let j = 0; j < this.slices - 1; j++) {
				this.indices.push(i*this.slices + j, i*this.slices + j+1, (i+1)*this.slices + j);
				this.indices.push(i*this.slices + j+1, (i+1)*this.slices + j+1, (i+1)*this.slices + j);
			}

			this.indices.push(i*this.slices + this.slices - 1, i*this.slices, (i+1)*this.slices + this.slices - 1);
			this.indices.push(i*this.slices, i*this.slices + this.slices, (i+1)*this.slices + this.slices - 1);
		}
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};
