const BOARD_OFFSET = vec3.fromValues(-30, 4, -30);
class Piece {
	constructor(scene, row, col, color) {
		this.scene = scene;
		const pieceOffset = vec3.fromValues(5*(col - 1), 0, 5*(row-1));
		this.coords = vec3.add(vec3.create(), BOARD_OFFSET, pieceOffset);
		this.color = color;
		this.sphere = new Sphere(this.scene, 1.5, 30, 30);
	}

	display() {
		this.scene.pushMatrix();
			this.scene.scale(1, 0.5, 1);
			this.scene.translate.apply(this.scene, this.coords);
			this.sphere.display();
		this.scene.popMatrix();
	}

}