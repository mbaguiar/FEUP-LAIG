/**
 * Patch
 * @constructor
 */
class Patch extends CGFobject {
    constructor(scene, npointsU, npointsV, npartsU, npartsV, controlPoints) {
        super(scene);
        this.controlPoints = [];
        this.makeSurface(npartsU, npartsV, npointsU, npointsV, controlPoints);
        this.patch = new CGFnurbsObject(scene, npartsU, npartsV, this.surface);
        console.log(this.patch);
    };

    makeSurface(npartsU, npartsV, npointsU, npointsV, controlPoints) {
        let degree1 = npointsU - 1;
        let degree2 = npointsV - 1;
        controlPoints.forEach(function(element) {
            element.push(1);
        });

        let i = 0;

        for (let u = 1; u <= npointsU; u++) {
            let pointsU = [];
            for (let v = 1; v <= npointsV; v++) {
                pointsU.push(controlPoints[i]);
                i++;
            }
            this.controlPoints.push(pointsU);
        }

        console.log(this.controlPoints);
        this.surface = new CGFnurbsSurface(degree1, degree2, this.controlPoints);
    };

    display() {
        this.patch.display();
    }
}