class Timer {
    constructor(scene) {
        this.scene = scene;
        this.cube = new Cube(this.scene);
        this.number = new Plane(this.scene, 150, 150);
        this.coords = [-5, 4, 0];
        this.placementCoords = [-45, 2.5, 0];
        this.time = {f: 0, l: 0};
        this.prism = new Cylinder(scene, 7, 7, 16.5, 3, 10);
        this.setupVisuals();
    }

    setupVisuals() {
        this.noTexture = Game.getInstance().visuals.noTexture;
        this.woodTexture = Game.getInstance().visuals.lightWood;
        this.shader = Game.getInstance().visuals.numberShader;
        this.material = new CGFappearance(this.scene);
        this.material.setEmission(0, 0, 0, 1);
        this.material.setAmbient(0.1, 0.1, 0.1, 1);
        this.material.setDiffuse(0.678, 0.678, 0.678, 1);
        this.material.setSpecular(0.03, 0.03, 0.03, 1);
        this.numbers = Game.getInstance().visuals.numbers;
    }

    display() {
        this.scene.pushMatrix();
            if (this.placementAnim)
                this.placementAnim.apply();
            this.scene.translate(...this.coords);
            this.scene.pushMatrix();
                this.scene.translate(3, 2, 0);
                this.scene.rotate(30*Math.PI/180, 0, 0, 1);
            this.scene.pushMatrix();
                this.scene.scale(0.1, 10, 14.5);
                this.cube.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.setActiveShader(this.shader);
                this.shader.setUniformsValues({color: [0.157, 0.280, 0.196]});
                this.scene.translate(0.1, 0, -2.25);
                this.scene.rotate(Math.PI/2, 1, 0, 0);
                this.scene.rotate(-Math.PI/2, 0, 0, 1);
                this.scene.scale(4, 5.2, 5);
                this.material.setTexture(this.numbers[this.time.l]);
                this.material.apply();
                this.number.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.translate(0.1, 0, 2.25);
                this.scene.rotate(Math.PI/2, 1, 0, 0);
                this.scene.rotate(-Math.PI/2, 0, 0, 1);
                this.scene.scale(4, 5.2, 5);
                this.material.setTexture(this.numbers[this.time.f]);
                this.material.apply();
                this.number.display();
                this.scene.setActiveShader(this.scene.defaultShader);
            this.scene.popMatrix();
            this.scene.popMatrix();
            this.material.setTexture(null);
            this.material.apply();
            this.scene.pushMatrix();
                this.scene.translate(0, 0, -8.25);
                this.scene.rotate(-30*Math.PI/180, 0, 0, 1);
                this.woodTexture.apply();
                this.prism.display();
            this.scene.popMatrix();
        this.scene.popMatrix();
    }

    addPlacementAnimation() {
        Game.getInstance().eventStarted();
        const animVec = vec3.sub(vec3.create(), this.placementCoords, this.coords);
		const P3 = [...animVec];
		P3[1] = 10;
		this.placementAnim = new BezierAnimation(this.scene, 2, [[0, 0, 0], [0, 10, 0], P3, animVec]);
    }

    update(delta) {
        if (Game.getInstance().currTimer) {
            let time = Math.ceil(Game.getInstance().currTimer);
            this.time.f = Math.floor(time/10);
            this.time.l = Math.floor(time % 10);
        }

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