/**
 * Rectangle
 * @constructor
 */
class Rectangle extends CGFobject
{
	constructor(scene, x0, y0, x1, y1) {
		super(scene);
		console.log(x0, x1, y0, y1);
		this.x = [x0, x1];
		this.y = [y0, y1];
		/* this.minS = minS || 0;
		this.maxS = maxS || 1;
		this.minT = minT || 0;
		this.maxT = maxT || 1; */
		this.initBuffers();
	};

	initBuffers() 
	{
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

		/* this.texCoords = [
			this.minS, this.maxT,
			this.maxS, this.maxT,
			this.minS, this.minT,
			this.maxS, this.minT
		]; */

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};
