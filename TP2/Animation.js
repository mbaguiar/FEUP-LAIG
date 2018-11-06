class Animation {
	constructor(scene, id, timespan) {
		this.id = id;
		this.timespan = timespan;
		this.scene = scene;
		this.finished = false;
	}

	isFinished(){
		return this.finished;
	}
}

class LinearAnimation extends Animation {
	constructor(scene, id, timespan, controlPoints) {
		super(scene, id, timespan);
		this.controlPoints = controlPoints;
		let distance = 0;
		for (let i = 0; i < this.controlPoints.length - 1; i++) {
			const p = this.controlPoints[i];
			distance += vec3.dist(vec3.create(), p, this.controlPoints[i + 1]);
		}
		this.speed = distance/this.timespan;
		this.reset();
	}

	updateAnimation(){
		if ((this.currPoint + 1) >= this.controlPoints.length) {
			this.finished = true;
			return;
		} else {
			this.currPoint++;
			this.newKeyFrame();
		}
	}

	newKeyFrame(){
		this.time = 0;
		this.pointTime = ve3.dist(vec3.create(), this.controlPoints[this.currPoint], this.controlPoints[this.currPoint + 1]);
		this.direction = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), this.controlPoints[this.currPoint + 1], this.controlPoints[this.currPoint]));
	}

	update(delta) {
		if (this.finished) {
			return;
		}

		const deltaSecs = delta/1000;
		//TODO
		//Angles
		this.position = vec3.scaleAndAdd(vec3.create(), this.position, this.direction, this.speed*deltaSecs);

		this.time += deltaSecs;

		if (this.time >= this.pointTime) {
			this.updateAnimation;
		}

	}

	reset(){
		this.finished = false;
		this.currPoint = 0;
		this.position = this.currPoint;
		this.newKeyFrame();
	}

	apply() {
		this.scene.translate(this.position[0], this.position[1], this.position[2]);
		//this.scene.rotate...
		//this.scene.rotate...
	}
}

class CircularAnimation extends Animation {
	constructor(scene, id, timespan, center, radius, startAng, rotAng) {
		super(scene, id, timespan);
		this.center = center;
		this.radius = radius;
		this.startAng = startAng;
		this.rotAng = rotAng;
	}

	update(delta) {

	}

	apply() {

	}
}