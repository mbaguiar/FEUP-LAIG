/**
 * Cylinder
 * @constructor
 */
class Cylinder extends CGFobject {
    constructor(scene, base, top, height, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.top = top;
        this.base = base;
        this.height = height;
        this.noBaseCylinder = new NoBaseCylinder(scene, base, top, height, slices, stacks);
        this.topCircle = new Circle(scene, slices);
        this.baseCircle = new Circle(scene, slices);

        this.initBuffers();
    };

    display() {

        this.noBaseCylinder.display();
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.scale(this.base, this.base, 1);
        this.baseCircle.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.scale(this.top, this.top, 1);
        this.scene.translate(0, 0, this.height);
        this.topCircle.display();
        this.scene.popMatrix();
    }
};