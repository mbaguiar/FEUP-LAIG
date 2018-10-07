/**
 * Cylinder
 * @constructor
 */
class NoBaseCylinder extends CGFobject {
	constructor(scene, base, top, height, slices, stacks) {
		super(scene);
		this.slices = slices;
		this.stacks = stacks;
		this.top = top;
		this.base = base;
		this.height = height;
		this.initBuffers();
	};

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		let delta_height = this.height / this.stacks;
		let delta = (this.top - this.base) / this.stacks;
		let angDelta = - Math.PI * 2 / this.slices;

		let incX = 1 / this.slices;
		let incY = 1 / this.stacks;

		let x = 0;
		let y = 0;


		for (let j = 0; j <= this.stacks; j++) {

			let inc = j * delta + this.base;

			for (let i = 0; i <= this.slices; i++) {
				this.vertices.push(inc * Math.cos(i * angDelta), inc * Math.sin(i * angDelta), j* delta_height);
				this.normals.push(Math.cos(i * angDelta), Math.sin(i * angDelta), 0);

				this.texCoords.push(x, y);
				x+= incX;
			}

			x = 0;
			y += incY;
		}


		let aux = this.slices + 1;

		for(let j = 0; j < this.stacks; j++) {
			for (let i = 0; i < this.slices; i++) {
				
				this.indices.push(aux*j+i, aux*(j+1) + i, aux*j+i+1);
				this.indices.push(aux*j+i+1, aux*(j+1)+i, aux*(j+1)+i+1);
				this.indices.push(aux*j+i, aux*j+i+1, aux*(j+1)+i);
				this.indices.push(aux*j+i+1, aux*(j+1)+i+1, aux*(j+1)+i);
			}
		}
	

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};