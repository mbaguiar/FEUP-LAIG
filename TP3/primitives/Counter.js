class Counter {
    constructor(scene) {
        this.scene = scene;
        this.cube = new Cube(scene);
        this.prism = new Cylinder(scene, 7, 7, 27, 3, 10);
        this.counter = {player1: 0, player2: 0};
        this.noTexture = new CGFappearance(this.scene);
        this.woodTexture = new CGFappearance(this.scene);
		this.woodTexture.loadTexture('../scenes/images/light_wood.jpg');
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
        if (Game.getInstance().state && Game.getInstance().allowPlay()) {
            this.counter.player1 = Game.getInstance().state.score[0];
            this.counter.player2 = Game.getInstance().state.score[1];
        }
        this.scene.pushMatrix();
            this.scene.translate(-3, 2, 0);
            this.scene.rotate(-30*Math.PI/180, 0, 0, 1);
        this.scene.pushMatrix();
            this.scene.scale(0.1, 10, 25);
            this.cube.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.scene.translate(-0.1, 0, -8);
            this.scene.rotate(-Math.PI/2, 0, 1, 0);
            this.scene.scale(4, 5.2, 0.001);
            this.material.setTexture(this.numbers[Math.floor(this.counter.player2/10)]);
            this.material.apply();
            this.cube.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.scene.translate(-0.1, 0, -3.5);
            this.scene.rotate(-Math.PI/2, 0, 1, 0);
            this.scene.scale(4, 5.2, 0.001);
            this.material.setTexture(this.numbers[this.counter.player2 % 10]);
            this.material.apply();
            this.cube.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.scene.translate(-0.1, 0, 3.5);
            this.scene.rotate(-Math.PI/2, 0, 1, 0);
            this.scene.scale(4, 5.2, 0.001);
            this.material.setTexture(this.numbers[Math.floor(this.counter.player1/10)]);
            this.material.apply();
            this.cube.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.scene.translate(-0.1, 0, 8);
            this.scene.rotate(-Math.PI/2, 0, 1, 0);
            this.scene.scale(4, 5.2, 0.001);
            this.material.setTexture(this.numbers[this.counter.player1 % 10]);
            this.material.apply();
            this.cube.display();
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
    }
}