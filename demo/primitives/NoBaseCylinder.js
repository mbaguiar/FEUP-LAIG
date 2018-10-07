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
		//this.texCoords = [];
		this.initBuffers();
	};

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		//this.texCoords = [];

		let ang = 0;
		let angDelta = Math.PI * 2 / this.slices;

		let z = 0;
		let zDelta = this.height / this.stacks;

		let delta = (this.top - this.base) / this.stacks;

		z = 0
		for (let j = 0; j < this.stacks; j++) {

			let inc = j * delta + this.base;

			for (let i = 0; i < this.slices; i++) {
				this.vertices.push((inc + delta) * Math.cos(ang), (inc + delta) * Math.sin(ang), z + zDelta);
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

		/*
		var s = 0;
		var t = 0;
		var s_inc = 1 / this.slices;
		var t_inc = 1 / this.stacks;
		for (var i = 0; i <= this.stacks; i++) {
			for (var j = 0; j < this.slices; j++) {
				this.texCoords.push(s, t);
				s += s_inc;
			}
			s = 0;
			t += t_inc;
		}
*/

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};