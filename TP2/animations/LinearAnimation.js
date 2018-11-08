class LinearAnimation extends Animation {
	constructor(scene, id, timespan, controlPoints) {
		super(scene, id, timespan);
		this.setupSpeed(controlPoints);
		this.setupControlPoints(controlPoints);
		this.reset();
	}

	setupSpeed(points) {
		console.log(points);
		let distance = 0;
		for (let i = 0; i < points.length - 1; i++) {
			distance += vec3.dist(points[i], points[i + 1]);
		}
		this.speed = distance / this.timespan;
	}

	setupControlPoints(points) {
		this.controlPoints = [];
		let time = 0;
		for (let i = 0; i < points.length - 1; i++) {
			const direction = vec3.sub(vec3.create(), points[i+1], points[i]);
			const timespan = vec3.length(direction) / this.speed;
			const keyframe = new KeyFrame(points[i], direction, time, time + timespan);
			time += timespan;
			this.controlPoints.push(keyframe);
		}
	}

	getCurrentPoint() {
		for (let i = this.currPointIndex; i < this.controlPoints.length; i++) {
			const keyframe = this.controlPoints[i];
			if (this.time >= keyframe.startTime && this.time <= keyframe.endTime){
				this.currPointIndex = i;
				if (i === (this.controlPoints.length - 1)){
					this.finished = true;
				}
				return keyframe;
			}
		}
	}

	update(delta) {
		if (this.finished) {
			this.reset();
		}
		const deltaSecs = delta * MILIS_TO_SECS;
		this.time += deltaSecs;
		if (this.time > this.timespan){
			this.time = this.timespan;
		}
		const keyframe = this.getCurrentPoint();
		this.position = keyframe.getPosition(this.time);
		let direction = keyframe.direction;
		direction[1] = 0;
		this.angle = vec3.angle(direction, Zaxis);

	}

	reset(){
		this.finished = false;
		this.time = 0;
		this.currPointIndex = 0;
	}

	apply() {
		this.scene.translate(this.position[0], this.position[1], this.position[2]);
		this.scene.rotate(this.angle, 0, 1, 0);
	}
}