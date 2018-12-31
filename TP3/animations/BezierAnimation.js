class BezierAnimation extends Animation {
	constructor(scene, timespan, controlPoints) {
		super(scene, timespan);
		this.points = controlPoints;
		this.position = [0, 0, 0];
		this.time = 0;
	}

	getPosition(t) {
		const pos = [];
		for (let i = 0; i < 3; i++){
			pos.push(
				((1-t) ** 3) * this.points[0][i] + 
				3 * t * ((1-t) ** 2) * this.points[1][i] +
				3 * (t ** 2) * (1-t) * this.points[2][i] +
				(t ** 3) * this.points[3][i]
			);
		}
		return pos;
	}

	update(delta) {
		const deltaSecs = delta * MILIS_TO_SECS;
		this.time += deltaSecs;
		if (this.time >= this.timespan){
			this.position = this.points[3];
			this.finished = true;
		} else {
			const timePos = this.time / this.timespan;
			this.position = this.getPosition(timePos);
		}
	}

	apply() {
		this.scene.translate(this.position[0], this.position[1], this.position[2]);
	}
}