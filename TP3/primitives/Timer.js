class Timer {
    constructor(scene) {
        this.scene = scene;
        this.cube = new Cube(this.scene);
        this.time = {f: 0, l: 0};
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
        if (Game.getInstance().currTimer) {
            let time = Math.ceil(Game.getInstance().currTimer);
            this.time.f = Math.floor(time/10);
            this.time.l = Math.floor(time % 10);
        }

        this.scene.pushMatrix();
            this.scene.scale(2, 10, 14.5);
            this.cube.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.scene.translate(1.1, 0, -2.25);
            this.scene.rotate(-Math.PI/2, 0, 1, 0);
            this.scene.scale(4, 5.2, 0.001);
            this.material.setTexture(this.numbers[this.time.l]);
            this.material.apply();
            this.cube.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.scene.translate(1.1, 0, 2.25);
            this.scene.rotate(-Math.PI/2, 0, 1, 0);
            this.scene.scale(4, 5.2, 0.001);
            this.material.setTexture(this.numbers[this.time.f]);
            this.material.apply();
            this.cube.display();
        this.scene.popMatrix();
        this.material.setTexture(null);
        this.material.apply();
    }
}