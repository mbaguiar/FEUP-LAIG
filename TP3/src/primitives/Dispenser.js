class Dispenser {
	constructor(scene, color) {
		this.scene = scene;
		this.cube = new Cube(scene);
		this.color = color;
		this.coords = [, [0, 4, 20], [0, 4, -20]];
		this.placementCoords = [, [0, -1, 41], [0, -1, -41]];
		this.noTexture = Game.getInstance().visuals.noTexture;
		this.woodTexture = Game.getInstance().visuals.lightWood;
	}

	display() {
		this.scene.pushMatrix();
			if (this.placementAnim)
				this.placementAnim.apply();
			this.scene.translate(...this.coords[this.color]);
			this.scene.rotate(this.color === 2? Math.PI: 0, 0, 1, 0);
			this.woodTexture.apply();
			this.scene.pushMatrix();
				this.scene.translate(0, 0.25, 0);
				this.scene.scale(10, 0.5, 5);
				this.cube.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(2.5, 1.5, 2.25);
				this.scene.scale(5, 3, 0.5);
				this.cube.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(2.5, 1.5, -2.25);
				this.scene.scale(5, 3, 0.5);
				this.cube.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(4.75, 1.5, 0);
				this.scene.scale(0.5, 3, 5);
				//this.cube.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(2.5, 3, 0);
				this.scene.scale(5, 0.5, 5);
				this.cube.display();
			this.scene.popMatrix();
			this.noTexture.apply();
		this.scene.popMatrix();
			
	}

	addPlacementAnimation() {
        Game.getInstance().eventStarted();
        const animVec = vec3.sub(vec3.create(), this.placementCoords[this.color], this.coords[this.color]);
		const P3 = [...animVec];
		P3[1] = 10;
		this.placementAnim = new BezierAnimation(this.scene, 2, [[0, 0, 0], [0, 10, 0], P3, animVec]);
    }

	update(delta) {
        if (this.placementAnim) {
			if (this.placementAnim.isFinished()) {
				this.placementAnim = null;
				this.coords[this.color] = this.placementCoords[this.color];
				Game.getInstance().eventEnded();
				return;
			}
			this.placementAnim.update(delta);
		}
    }
}