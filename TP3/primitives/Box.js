class Box {
	constructor(scene) {
		this.scene = scene;
		this.square = new Rectangle(this.scene, -0.5, -0.5, 0.5, 0.5);
		this.coords = [0, 4, 0];
		this.placementCoords = [100, 4, 0];
		this.material = new CGFappearance(this.scene);
		this.topTex = new CGFtexture(this.scene, '../scenes/images/box_top.jpg');
		this.redTex = new CGFtexture(this.scene, '../scenes/images/box_red.jpg');
		this.blueTex = new CGFtexture(this.scene, '../scenes/images/box_blue.jpg');
	}

	display() {
		this.scene.pushMatrix();
			if (this.placementAnim)
				this.placementAnim.apply();
			this.scene.translate(...this.coords);
			this.scene.scale(80, 15, 80);
			this.scene.pushMatrix();
				this.material.setTexture(this.blueTex);
				this.material.apply();
				this.scene.translate(0.5, 0, 0);
				this.scene.rotate(Math.PI/2, 0, 1, 0);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.material.setTexture(this.blueTex);
				this.material.apply();
				this.scene.translate(0, 0, 0.5);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.material.setTexture(this.redTex);
				this.material.apply();
				this.scene.translate(0, 0, -0.5);
				this.scene.rotate(-Math.PI, 0, 1, 0);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.material.setTexture(this.redTex);
				this.material.apply();
				this.scene.translate(-0.5, 0, 0);
				this.scene.rotate(-Math.PI/2, 0, 1, 0);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.material.setTexture(this.topTex);
				this.material.apply();
				this.scene.translate(0, 0.5, 0);
				this.scene.rotate(-Math.PI/2, 1, 0, 0);
				this.square.display();
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(0, -0.5, 0);
				this.scene.rotate(Math.PI/2, 1, 0, 0);
				this.square.display();
			this.scene.popMatrix();
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