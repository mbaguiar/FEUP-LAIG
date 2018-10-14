/**
 * MyQuad
 * @constructor
 */
class Triangle extends CGFobject {
	constructor(scene, x0, y0, z0, x1, y1, z1, x2, y2, z2) {
		super(scene);
		/* this.minS = minS || 0;
		this.maxS = maxS || 1;
		this.minT = minT || 0;
		this.maxT = maxT || 1; */

		this.p0 = [x0, y0, z0];
		this.p1 = [x1, y1, z1];
		this.p2 = [x2, y2, z2];

		this.initBuffers();
	};

	initBuffers() {
		this.vertices = [
			...this.p0,
			...this.p1,
			...this.p2
		];

		this.indices = [
			0, 1, 2,
		];

		let v1 = vec3.create(),
			v2 = vec3.create(),
			n = vec3.create();

		vec3.sub(v1, this.p2, this.p0);
		vec3.sub(v2, this.p2, this.p1);

		vec3.cross(n, v1, v2);
		vec3.normalize(n, n);

		this.normals = [
			...n,
			...n,
			...n
		];

		this.texCoords = [
			0, 1,
			1, 1,
			0, 0
		];

		this.setTexCoords(2, 2);
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	setTexCoords(s, t) {

		let a = Math.sqrt(Math.pow(this.p0[0] - this.p2[0]) + Math.pow(this.p0[1] - this.p2[1]) + Math.pow(this.p0[2] - this.p2[2]));
		let b = Math.sqrt(Math.pow(this.p1[0] - this.p0[0]) + Math.pow(this.p1[1] - this.p0[1]) + Math.pow(this.p1[2] - this.p0[2]));
		let c = Math.sqrt(Math.pow(this.p2[0] - this.p1[0]) + Math.pow(this.p2[1] - this.p1[1]) + Math.pow(this.p2[2] - this.p1[2]));

		let B = ((a * a - b * b + c * c) / (2 * a * c));

		this.texCoords = [
			(c - a * Math.cos(B)) / s, (a * Math.sin(B)) / t,
			0, 1 / t,
			c / s, 1 / t,
		]

		this.updateTexCoordsGLBuffers();
	}
};