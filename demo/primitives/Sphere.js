/**
 * Sphere
 * @constructor
 */
class Sphere extends CGFobject {
	constructor(scene, radius, slices, stacks) {
		super(scene);
		this.slices = slices;
		this.stacks = stacks;
		this.radius = radius;

		this.initBuffers();
	};

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		let incX = 1 / this.slices;
		let incY = 1 / this.stacks;

		let x = 0;
		let y = 0;

		let theta = Math.PI * 2 / this.slices;
		let phi = (Math.PI) / this.stacks;
		let nVertices = 0;

		for (let i = 0; i <= this.slices; i++) {
			for (let j = 0; j <= this.stacks; j++) {

				let x = Math.sin(phi * j) * Math.cos(theta * i);
				let y = Math.sin(phi * j) * Math.sin(theta * i);
				let z = Math.cos(phi * j);

				this.vertices.push(this.radius * x, this.radius * y, this.radius * z);
				nVertices++;
				this.normals.push(x, y, z);

				if (i > 0 && j > 0) {
					this.indices.push(nVertices - this.stacks - 1, nVertices - 1, nVertices - this.stacks - 2);
					this.indices.push(nVertices - 1, nVertices - 2, nVertices - this.stacks - 2);
				}

				y += incY;
				this.texCoords.push(x, y);
			}

			y = 0;
			x += incX;
		}

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};