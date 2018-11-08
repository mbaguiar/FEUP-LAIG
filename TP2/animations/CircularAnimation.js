class CircularAnimation extends Animation {
	constructor(scene, timespan, center, radius, startAng, rotAng) {
		super(scene, timespan);
		this.center = center;
		this.radius = radius;
		this.startAng = startAng;
		this.rotAng = rotAng;
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
		this.position = scaleAndAdd(this.center, [Math.cos(this.currAng), 0, Math.sin(this.currAng)], this.radius);

	}

	apply() {
		this.scene.translate(this.position[0], this.position[1], this.position[2]);
	}

	reset() {
		this.finished = false;
		this.time = 0;
		this.currAng = this.startAng;
	}
}