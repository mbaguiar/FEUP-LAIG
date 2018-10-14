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

		this.setTexCoords(1, 1);
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	setTexCoords(s, t) {

		let a = vec3.dist(this.p0, this.p2);
		let b = vec3.dist(this.p0, this.p1);
		let c = vec3.dist(this.p1, this.p2);

		let B = Math.acos((Math.pow(a, 2) - Math.pow(b, 2) + Math.pow(c, 2)) / (2 * a * c));

		this.texCoords = [
			(c - a * Math.cos(B)) / s, 1 - (a * Math.sin(B)) / t,
			0, 1 / t,
			c / s, 1 / t,
		]

		this.updateTexCoordsGLBuffers();
	}
};