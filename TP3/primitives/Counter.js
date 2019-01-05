class Counter {
    constructor(scene) {
        this.scene = scene;
        this.coords = [10, 4, 0];
        this.placementCoords = [45, 2.5, 0];
        this.cube = new Cube(scene);
        this.number = new Plane(scene, 150, 150);
        this.prism = new Cylinder(scene, 7, 7, 27, 3, 10);
        this.counter = {player1: 0, player2: 0};
        this.noTexture = new CGFappearance(this.scene);
        this.woodTexture = new CGFappearance(this.scene);
		this.woodTexture.loadTexture('../scenes/images/light_wood.jpg');
        this.shader = new CGFshader(this.scene.gl, '../shaders/number.vert', '../shaders/number.frag');
        this.turnTex = [, new CGFtexture(this.scene, '../scenes/images/turn_red.jpg'), new CGFtexture(this.scene, '../scenes/images/turn_blue.jpg')];
        this.material = new CGFappearance(this.scene);
        this.material.setEmission(0, 0, 0, 1);
        this.material.setAmbient(0.1, 0.1, 0.1, 1);
        this.material.setDiffuse(0.678, 0.678, 0.678, 1);
        this.material.setSpecular(0.03, 0.03, 0.03, 1);
        this.numbers = [];
        for (let i = 0; i < 10; i++) {
            this.numbers.push(new CGFtexture(this.scene, `/scenes/images/numbers/${i}.png`));
        }
    }

    display() {
        this.scene.pushMatrix();
            if (this.placementAnim)
                this.placementAnim.apply();
            this.scene.translate(...this.coords);
            this.scene.pushMatrix();
                this.scene.translate(-3, 2, 0);
                this.scene.rotate(-30*Math.PI/180, 0, 0, 1);
            this.scene.pushMatrix();
                this.scene.scale(0.1, 10, 25);
                this.material.setTexture(this.turnTex[this.turn]);
                this.material.apply();
                this.cube.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.setActiveShader(this.shader);
                this.shader.setUniformsValues({color: [0.037, 0.112, 0.294]});
                this.scene.translate(-0.1, 0, -8);
                this.scene.rotate(Math.PI/2, 1, 0, 0);
                this.scene.rotate(Math.PI/2, 0, 0, 1);
                this.scene.scale(4, 5.2, 5);
                this.material.setTexture(this.numbers[Math.floor(this.counter.player2/10)]);
                this.material.apply();
                this.number.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.translate(-0.1, 0, -3.5);
                this.scene.rotate(Math.PI/2, 1, 0, 0);
                this.scene.rotate(Math.PI/2, 0, 0, 1);
                this.scene.scale(4, 5.2, 5);
                this.material.setTexture(this.numbers[this.counter.player2 % 10]);
                this.material.apply();
                this.number.display();
            this.scene.popMatrix();
            this.shader.setUniformsValues({color: [0.277, 0.048, 0.031]});
            this.scene.pushMatrix();
                this.scene.translate(-0.1, 0, 3.5);
                this.scene.rotate(Math.PI/2, 1, 0, 0);
                this.scene.rotate(Math.PI/2, 0, 0, 1);
                this.scene.scale(4, 5.2, 5);
                this.material.setTexture(this.numbers[Math.floor(this.counter.player1/10)]);
                this.material.apply();
                this.number.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.translate(-0.1, 0, 8);
                this.scene.rotate(Math.PI/2, 1, 0, 0);
                this.scene.rotate(Math.PI/2, 0, 0, 1);
                this.scene.scale(4, 5.2, 5);
                this.material.setTexture(this.numbers[this.counter.player1 % 10]);
                this.material.apply();
                this.number.display();
                this.scene.setActiveShader(this.scene.defaultShader);
            this.scene.popMatrix();
            this.scene.popMatrix();
            this.material.setTexture(null);
            this.material.apply();
            this.scene.pushMatrix();
                this.scene.translate(0, 0, -13.5);
                this.scene.rotate(-30*Math.PI/180, 0, 0, 1);
                this.woodTexture.apply();
                this.prism.display();
            this.scene.popMatrix();
            this.noTexture.apply();
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
        if (Game.getInstance().state && Game.getInstance().allowEvent()) {
            this.counter.player1 = Game.getInstance().state.score[0];
            this.counter.player2 = Game.getInstance().state.score[1];
            if (Game.getInstance().state.hasOwnProperty('player'))
                this.turn = Game.getInstance().state.player;
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