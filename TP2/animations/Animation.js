const MILIS_TO_SECS = 1/1000;
const Zaxis = [0, 0, 1];

class Animation {
	constructor(scene, timespan, loop) {
		this.timespan = timespan;
		this.scene = scene;
		this.loop = loop;
		this.finished = false;
	}

	isFinished(){
		return this.finished;
	}
}
