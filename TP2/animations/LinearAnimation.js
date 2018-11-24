class LinearAnimation extends Animation {
	constructor(scene, timespan, controlPoints) {
		super(scene, timespan);
		this.position = [0, 0, 0];
		this.angle = 0;
		this.setupSpeed(controlPoints);
		this.setupControlPoints(controlPoints);
		this.reset();
	}
	/**
	 * Calculates animation speed
	 * @param  {} points control points
	 */
	setupSpeed(points) {
		let distance = 0;
		for (let i = 0; i < points.length - 1; i++) {
			distance += vec3.dist(points[i], points[i + 1]);
		}
		this.speed = distance / this.timespan;
	}
	/**
	 * Setup KeyFrams
	 * @param  {} points control points
	 */
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
	/**
	 * Get current KeyFrame
	 */
	getCurrentKeyFrame() {
		for (let i = this.currPointIndex; i < this.controlPoints.length; i++) {
			const keyframe = this.controlPoints[i];
			if (this.time >= keyframe.startTime && this.time <= keyframe.endTime){
				this.currPointIndex = i;
				return keyframe;
			}
		}
	}
	
	/**
	 * Updates animation to current state based on time passed
	 * @param  {} delta time since last udpate
	 */
	update(delta) {
		if (this.finished) {
			this.reset();
		}
		const deltaSecs = delta * MILIS_TO_SECS;
		this.time += deltaSecs;
		if (this.time >= this.timespan){
			this.finished = true;
			this.time = this.timespan;
			const lastKeyFrame = this.controlPoints[this.controlPoints.length - 1];
			this.position = lastKeyFrame.getPosition(lastKeyFrame.endTime);
		} else {
			const keyframe = this.getCurrentKeyFrame();
			this.position = keyframe.getPosition(this.time);
			let direction = keyframe.direction.slice();
			direction[1] = 0;
			this.angle = angle(direction, Zaxis);
		}
	}

	/**
	 * Applies animation matrix to scene
	 */
	apply() {
		this.scene.translate(this.position[0], this.position[1], this.position[2]);
		this.scene.rotate(-this.angle, 0, 1, 0);
	}
	
	/**
	 * Resets animation state
	 */
	reset(){
		this.finished = false;
		this.time = 0;
		this.currPointIndex = 0;
	}
}