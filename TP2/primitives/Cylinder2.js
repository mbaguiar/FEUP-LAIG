/**
 * Cylinder
 * @constructor
 */
class Cylinder2 extends CGFobject {
    constructor(scene, base, top, height, slices, stacks) {
        super(scene);
        this.scene = scene;
        this.makeSurface(base, top, height);
        this.cylinder1 = new CGFnurbsObject(scene, slices/2, stacks/2, this.surface1);
        this.cylinder2 = new CGFnurbsObject(scene, slices/2, stacks/2, this.surface2);
    };

    makeSurface(base, top, height) {
        let degree1 = 3;
        let degree2 = 1;

        this.controlPoints1 = [
            [
                [-top, 0, height, 1],
                [-base, 0, 0, 1]
            ],
            [
                [-top, (4/3)*top, height, 1],
                [-base, (4/3)*base, 0, 1],
            ],
            [
                [top, (4/3)*top, height, 1],
                [base, (4/3)*base, 0, 1]
            ],
            [
                [top, 0, height, 1],
                [base, 0, 0, 1]
            ]
        ];

        console.log(this.controlPoints1);
        this.surface1 = new CGFnurbsSurface(degree1, degree2, this.controlPoints1);

        this.controlPoints2 = [
            [
                [top, 0, height, 1],
                [base, 0, 0, 1]
            ],
            [
                [top, -(4/3)*top, height, 1],
                [base, -(4/3)*base, 0, 1],
            ],
            [
                [-top, -(4/3)*top, height, 1],
                [-base, -(4/3)*base, 0, 1]
            ],
            [
                [-top, 0, height, 1],
                [-base, 0, 0, 1]
            ]
        ];

        this.surface2 = new CGFnurbsSurface(degree1, degree2, this.controlPoints2);
    };

    display() {
        this.cylinder1.display();
        this.cylinder2.display();
    }
}