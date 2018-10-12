/**
 * Torus
 * @constructor
 */
class Torus extends CGFobject {
	constructor(scene, inner, outer, slices, loops) {
		super(scene);
		this.inner = inner;
		this.outer = outer;
		this.slices = slices;
		this.stacks = loops;

		this.initBuffers();
	};

	initBuffers() {

		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		for (let i = 0; i <= this.stacks; i++) {
			let theta = i * 2 * Math.PI / this.stacks;
			let sinTheta = Math.sin(theta);
			let cosTheta = Math.cos(theta);

			for (let j = 0; j <= this.slices; j++) {
				let phi = j * 2 * Math.PI / this.slices;
				let sinPhi = Math.sin(phi);
				let cosPhi = Math.cos(phi);

				let x = (this.outer + (this.inner * cosTheta)) * cosPhi;
				let y = (this.outer + (this.inner * cosTheta)) * sinPhi
				let z = this.inner * sinTheta;
				let s = 1 - (i / this.stacks);
				let t = 1 - (j / this.slices);

				this.vertices.push(x, y, z);
				this.normals.push(x, y, z);
				this.texCoords.push(s, t);
			}
		}

		for (let i = 0; i < this.stacks; i++) {
			for (let j = 0; j < this.slices; j++) {
				let first = (i * (this.slices + 1)) + j;
				let second = first + this.slices + 1;

				this.indices.push(first, second + 1, second);
				this.indices.push(first, first + 1, second + 1);
			}
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
};