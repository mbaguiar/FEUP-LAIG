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
        this.loops = loops;

        this.initBuffers();
	};

	initBuffers() {
        
		this.vertices = [];
		this.indices = [];
		this.normals = [];

		

		this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
        
        
       
        
	};
};