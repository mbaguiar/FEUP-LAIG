const MILIS_TO_SECS = 1/1000;
const Zaxis = [0, 0, 1];
/**
 * Animation
 * @constructor
 */
class Animation {
	constructor(scene, timespan, loop) {
		this.timespan = timespan;
		this.scene = scene;
		this.loop = loop;
		this.finished = false;
	}
	/**
	 * Returns true if animation is finished, false otherwise
	 */
	isFinished(){
		return this.finished;
	}
}
