class KeyFrame {
	constructor (position, direction, startTime, endTime) {
		this.position = position;
		this.direction = direction;
		this.startTime = startTime;
		this.endTime = endTime;
	}

	getPosition(time) {
		const value = (time-this.startTime) / (this.endTime-this.startTime);
		return scaleAndAdd(this.position, this.direction, value);
	}

}