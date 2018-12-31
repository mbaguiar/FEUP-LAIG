const BOARD_OFFSET = vec3.fromValues(-30, 4, -30);
const DISPENSER = [];
DISPENSER[1] = vec3.fromValues(0, -4, 40);
DISPENSER[2] = vec3.fromValues(0, -4, -40);

class Piece {
	constructor(scene, color, row, col) {
		this.scene = scene;
		if (row && col) {
			this.coords = this.calculateCoords(row, col);
		} else {
			this.coords = DISPENSER[color];
		}
		this.color = color;
		this.sphere = new Sphere(this.scene, 1.5, 30, 30);
	}

	calculateCoords(row, col) {
		const pieceOffset = vec3.fromValues(5*(col - 1), 0, 5*(row-1));
		return vec3.add(vec3.create(), BOARD_OFFSET, pieceOffset);
	}

	display() {
		this.scene.pushMatrix();
			this.scene.scale(1, 0.5, 1);
			this.scene.translate.apply(this.scene, this.coords);
			const anim = this.placementAnim || this.dispenseAnim;
			if (anim) {
				anim.apply();
			}
			this.sphere.display();
		this.scene.popMatrix();
	}

	moveTo(row, col) {
		this.placementCoords = this.calculateCoords(row, col);
		this.addPlacementAnimation();
	}

	addPlacementAnimation() {
		Game.getInstance().eventStarted();
		const dispVec = vec3.create();
		vec3.sub(dispVec, this.placementCoords, this.coords);
		const length = vec3.length(dispVec);
		this.placementAnim = new BezierAnimation(this.scene, length*0.025, [[0, 0, 0], [0, 15 * length/20, 0], [dispVec[0], 15 * length/20, dispVec[2]], dispVec]);
	}

	dispense() {
		this.dispenseCoords = [...this.coords];
		this.dispenseCoords[1] += 8;
		this.addDispenserAnimation();
	}

	addDispenserAnimation() {
		Game.getInstance().eventStarted();
		this.dispenseAnim = new LinearAnimation(this.scene, 1, [[0, 0, 0], [0, 8, 0]]);
	}

	update(delta) {
		if (this.placementAnim) {
			if (this.placementAnim.isFinished()) {
				this.placementAnim = null;
				this.coords = this.placementCoords;
				Game.getInstance().eventEnded();
				return;
			}
			this.placementAnim.update(delta);
		} else if (this.dispenseAnim) {
			if (this.dispenseAnim.isFinished()) {
				this.dispenseAnim = null;
				this.coords = this.dispenseCoords;
				Game.getInstance().eventEnded();
				return;
			}
			this.dispenseAnim.update(delta);
		}
	}
}