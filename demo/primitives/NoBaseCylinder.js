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

		let ang = 0;
		let angDelta = Math.PI * 2 / this.slices;

		let z = 0;
		let zDelta = this.height / this.stacks;

		let delta = (this.top - this.base) / this.stacks;

		z = 0
		for (let j = 0; j < this.stacks; j++) {
			
			let inc = j * delta + this.base;

			for (let i = 0; i < this.slices; i++) {
				this.vertices.push((inc + delta)*Math.cos(ang), (inc + delta)*Math.sin(ang), z + zDelta);
				this.vertices.push(inc * Math.cos(ang), inc * Math.sin(ang), z);
				
				this.normals.push(Math.cos(ang), Math.sin(ang), 0);
				this.normals.push(Math.cos(ang), Math.sin(ang), 0);
				
				ang += angDelta;
			}

			z += zDelta;

			let aux = 2 * j * this.slices;

			for (let i = aux; i < aux + 2 * this.slices - 2; i += 2) {
				this.indices.push(i, i + 1, i + 2);
				this.indices.push(i + 2, i + 1, i + 3);
			}

			this.indices.push(aux + 2 * this.slices - 1, aux + 1, aux);
			this.indices.push(aux + 2 * this.slices - 2, aux + 2 * this.slices - 1, aux);
		}


		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};