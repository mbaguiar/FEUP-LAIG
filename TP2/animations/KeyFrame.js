class KeyFrame {
	constructor (position, direction, startTime, endTime) {
		this.position = position;
		this.direction = vec3.normalize(vec3.create(), direction);
		this.startTime = startTime;
		this.endTime = endTime;
	}

	getPosition(time) {
		const value = time / (this.endTime-this.startTime);
		return scaleAndAdd(this.position, this.direction, value);
	}

}