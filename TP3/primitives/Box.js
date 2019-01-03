class Box {
	constructor(scene) {
		this.scene = scene;
		this.cube = new Cube(scene);
		this.coords = [0, 4, 0];
		this.placementCoords = [100, 4, 0];
	}

	display() {
		this.scene.pushMatrix();
			if (this.placementAnim)
				this.placementAnim.apply();
			this.scene.translate(...this.coords);
			this.scene.scale(80, 15, 80);
			this.cube.display();
		this.scene.popMatrix();
	}

	addPlacementAnimation() {
		Game.getInstance().eventStarted();
        const animVec = vec3.sub(vec3.create(), this.placementCoords, this.coords);
		const P3 = [...animVec];
		P3[1] = 20;
		this.placementAnim = new BezierAnimation(this.scene, 3, [[0, 0, 0], [0, 20, 0], P3, animVec]);
	}

	update(delta) {
		if (this.placementAnim) {
			if (this.placementAnim.isFinished()) {
				this.placementAnim = null;
				this.coords = this.placementCoords;
				Game.getInstance().eventEnded();
				return;
			}
			this.placementAnim.update(delta);
		}
	}
}