/**
 * Rectangle
 * @constructor
 */
class Rectangle extends CGFobject {
	constructor(scene, x0, y0, x1, y1) {
		super(scene);

		this.x = [x0, x1];
		this.y = [y0, y1];
		this.initBuffers();
	};

	initBuffers() {
		this.vertices = [
			this.x[0], this.y[0], 0,
			this.x[1], this.y[0], 0,
			this.x[0], this.y[1], 0,
			this.x[1], this.y[1], 0
		];

		this.indices = [
			0, 1, 2,
			3, 2, 1
		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

		this.texCoords = [
			0, 1,
			1, 1,
			0, 0,
			1, 0
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	setTexCoords(s, t) {
		this.texCoords = [
			0, 1 / t,
			1 / s, 1 / t,
			0, 0,
			1 / s, 0
		]

		this.updateTexCoordsGLBuffers();
	}
};