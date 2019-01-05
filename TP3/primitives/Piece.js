const BOARD_OFFSET = vec3.fromValues(-30, 4, -30);
const DISPENSER = [];
DISPENSER[1] = vec3.fromValues(-2.5, 2.5, 41);
DISPENSER[2] = vec3.fromValues(2.5, 2.5, -41);

class Piece {
	constructor(scene, color, row, col) {
		this.scene = scene;
		if (row && col) {
			this.coords = this.calculateCoords(row, col);
		} else {
			this.coords = DISPENSER[color];
		}
		this.shader = Game.getInstance().visuals.pieceShader;
		this.glowTexture = Game.getInstance().visuals.glowTexture;
		this.shader.setUniformsValues({uSampler2: 1});
		this.color = color;
		this.sphere = new Sphere(this.scene, 1.5, 30, 30);
	}

	calculateCoords(row, col) {
		const pieceOffset = vec3.fromValues(5*(col - 1), 0, 5*(row-1));
		return vec3.add(vec3.create(), BOARD_OFFSET, pieceOffset);
	}

	display() {
		this.scene.pushMatrix();
			if (this.glowAnim){
				this.scene.setActiveShader(this.shader);
				this.glowTexture.bind(1);	
			} 
			this.scene.scale(1, 0.5, 1);
			this.scene.translate.apply(this.scene, this.coords);
			const anim = this.placementAnim || this.dispenseAnim || this.removeAnim;
			if (anim) {
				anim.apply();
			}
			this.sphere.display();
			if (this.glowAnim) {
				this.glowTexture.unbind(1);	
				this.scene.setActiveShader(this.scene.defaultShader);
			}
		this.scene.popMatrix();
	}

	moveTo(row, col) {
		this.row = row;
		this.col = col;
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
		this.addDispenserAnimation();
	}

	addDispenserAnimation() {
		Game.getInstance().eventStarted();
		const sign = this.color === 1? 1: -1;
		this.dispenseAnim = new LinearAnimation(this.scene, 1, [[sign*5, 0, 0], [0, 0, 0]]);
	}

	remove(fast) {
		const fastAnim = fast || false;
		this.addRemoveAnimation(fastAnim);
	}

	addRemoveAnimation(fastAnim) {
		Game.getInstance().eventStarted();
		let dispEntrance = [...DISPENSER[this.color]];
		const sign = this.color === 1? 1: -1;
		dispEntrance[0] += sign * 5;
		const dispVec = vec3.sub(vec3.create(), dispEntrance, this.coords);
		const length = vec3.length(dispVec);
		const speed = fastAnim? length*0.01: length*0.04;
		this.removeAnim = new BezierAnimation(this.scene, speed, [[0, 0, 0], [0, 15 * length/20, 0], [dispVec[0] + sign * 30, 15 * length/20, dispVec[2]], dispVec]);
	}

	addGlowAnimation() {
		Game.getInstance().eventStarted();
		this.time = 0;
		this.glowAnim = true;
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
		} else if (this.removeAnim) {
			if (this.removeAnim.isFinished()) {
				this.removeAnim = null;
				Game.getInstance().eventEnded();
				Game.getInstance().setDispenserReady(this.color, this.row, this.col);
				return;
			}
			this.removeAnim.update(delta);
		} else if (this.glowAnim) {
			this.time += delta*MILIS_TO_SECS;
			if (this.time >= 0.5) {
				Game.getInstance().eventEnded();
				this.glowAnim = false;
				return;
			} 
			const factor = Math.sin(this.time * Math.PI/0.5)
			this.shader.setUniformsValues({factor: factor});
		}
	}
}