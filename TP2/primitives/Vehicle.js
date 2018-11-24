
let controlpoints1 = [
    [-4, 0, 3],
    [-5, 0, 1.5],
    [-4, 0, 0],
    [-4, (4/3)*4, 3],
    [-5, (4/3)*5, 1.5],
    [-4, (4/3)*4, 0],
    [4, (4/3)*4, 3],
    [5, (4/3)*5, 1.5],
    [4, (4/3)*4, 0],
    [4, 0, 3],
    [5, 0, 1.5],
    [4, 0, 0],
]

let controlpoints2 = [
    [4, 0, 3],
    [5, 0, 1.5],
    [4, 0, 0],
    [4, -(4/3)*4, 3],
    [5, -(4/3)*5, 1.5],
    [4, -(4/3)*4, 0],
    [-4, -(4/3)*4, 3],
    [-5, (-4/3)*5, 1.5],
    [-4, -(4/3)*4, 0],
    [-4, 0, 3],
    [-5, 0, 1.5],
    [-4, 0, 0],
]

let controlpoints3 = [
    [0, 0, 1.5],
    [-3, 0, 1.5],
    [-4, 0, 0],
    [0, 0, 1.5],
    [-3, (4/3)*3, 1.5],
    [-4, (4/3)*4, 0],
    [0, (4/3)*0, 1.5],
    [3, (4/3)*3, 1.5],
    [4, (4/3)*4, 0],
    [0, 0, 1.5],
    [3, 0, 1.5],
    [4, 0, 0],
]

let controlpoints4 = [
    [0, 0, 1.5],
    [3, 0, 1.5],
    [4, 0, 0],
    [0, -(4/3)*0, 1.5],
    [3, -(4/3)*3, 1.5],
    [4, -(4/3)*4, 0],
    [0, -(4/3)*0, 1.5],
    [-3, -(4/3)*3, 1.5],
    [-4, -(4/3)*4, 0],
    [0, 0, 1.5],
    [-3, 0, 1.5],
    [-4, 0, 0],
]

/**
 * Vehicle
 * @constructor
 */
class Vehicle {
    constructor(scene) {
        this.scene = scene;
        this.cylinder1 = new Cylinder2(scene, 1, 1.5, 1, 60, 60);
        this.cylinder2 = new Cylinder2(scene, 1.5, 4, 4, 60, 60);
        this.cylinder3 = new Cylinder2(scene, 1, 1, 2, 60, 60);
        this.cylinder4 = new Cylinder2(scene, 0.05, 0.05, 2, 30, 30);
        this.patch1 = new Patch(scene, 4, 3, 30, 30, controlpoints1);
        this.patch2 = new Patch(scene, 4, 3, 30, 30, controlpoints2);
        this.patch3 = new Patch(scene, 4, 3, 30, 30, controlpoints3);
        this.patch4 = new Patch(scene, 4, 3, 30, 30, controlpoints4);
    }

    display() {
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.cylinder3.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(0, 4, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.cylinder1.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(0, 5, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.cylinder2.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(0, 9, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.patch1.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(0, 9, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.patch2.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(0, 12, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.patch3.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(0, 12, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.patch4.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(0, 2, 1);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.cylinder4.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(0, 2, -1);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.cylinder4.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(1, 2, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.cylinder4.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(-1, 2, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.cylinder4.display();
        this.scene.popMatrix();
    }
}