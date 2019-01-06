/**
 * Patch
 * @constructor
 */
class Patch extends CGFobject {
    constructor(scene, npointsU, npointsV, npartsU, npartsV, controlPoints) {
        super(scene);
        let surface = this.makeSurface(npointsU, npointsV, controlPoints);
        this.patch = new CGFnurbsObject(scene, npartsU, npartsV, surface);
    };

    makeSurface(npointsU, npointsV, controlPoints) {
        let degree1 = npointsU - 1;
        let degree2 = npointsV - 1;
        let ctrlPoints = [];
        
        let i = 0;
        for (let u = 1; u <= npointsU; u++) {
            let pointsU = [];
            for (let v = 1; v <= npointsV; v++) {
                controlPoints[i].push(1.0);
                pointsU.push(controlPoints[i]);
                i++;
            }
            ctrlPoints.push(pointsU);
        }
        return new CGFnurbsSurface(degree1, degree2, ctrlPoints);
    };

    display() {
        this.patch.display();
    }
}