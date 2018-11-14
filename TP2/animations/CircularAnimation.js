class CircularAnimation extends Animation {
	constructor(scene, timespan, center, radius, startAng, rotAng) {
		super(scene, timespan);
		this.center = center;
		this.radius = radius;
		this.startAng = startAng;
		this.rotAng = rotAng;
		this.position = [0, 0, 0];
		this.currAng = 0;
		this.speed = this.rotAng/this.timespan;
		this.reset();
	}

	update(delta) {
		if (this.finished){
			this.reset();
		}
		const deltaSecs = delta * MILIS_TO_SECS;
		this.time += deltaSecs;
		if (this.time >= this.timespan){
			this.currAng = this.startAng + this.rotAng;
			this.finished = true;
		} else {
			this.currAng += deltaSecs * this.speed;
		}
		this.position = scaleAndAdd(this.center, [Math.cos(this.currAng*DEGREE_TO_RAD), 0, Math.sin(this.currAng*DEGREE_TO_RAD)], this.radius);

	}

	apply() {
		this.scene.translate(this.position[0], this.position[1], this.position[2]);
		this.scene.rotate(-this.currAng*DEGREE_TO_RAD, 0, 1, 0);
	}

	reset() {
		this.finished = false;
		this.time = 0;
		this.currAng = this.startAng;
	}
}