/**
 * Plane
 * @constructor
 */
class Plane extends CGFobject {
    constructor(scene, u, v) {
        super(scene);
        this.makeSurface(u, v);
        this.plane = new CGFnurbsObject(scene, u, v, this.surface);
    };

    makeSurface(u, v) {
        let degree1 = 1;
        let degree2 = 1;

        let controlPoints = [
            [
                [-0.5, 0, 0.5, 1],
                [-0.5, 0.0, -0.5, 1]
            ],
            [
                [0.5, 0.0, 0.5, 1],
                [0.5, 0.0, -0.5, 1]
            ]
        ];

        this.surface = new CGFnurbsSurface(degree1, degree2, controlPoints);
    };

    display() {
        this.plane.display();
    }
}