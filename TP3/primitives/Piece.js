const BOARD_OFFSET = vec3.fromValues(-30, 4, -30);
class Piece {
	constructor(scene, row, col, color) {
		this.scene = scene;
		const pieceOffset = vec3.fromValues(5*(col - 1), 0, 5*(row-1));
		this.coords = vec3.add(vec3.create(), BOARD_OFFSET, pieceOffset);
		this.color = color;
		this.sphere = new Sphere(this.scene, 1.5, 30, 30);
		if (color !== 3) 
			this.addPlacementAnimation();
	}

	display() {
		this.scene.pushMatrix();
			this.scene.scale(1, 0.5, 1);
			this.scene.translate.apply(this.scene, this.coords);
			if (this.animations && this.currAnimationIndex !== -1) {
				this.animations[this.currAnimationIndex].apply();
			}
			this.sphere.display();
		this.scene.popMatrix();
	}

	addPlacementAnimation() {
		this.animations = [];
		this.animations.push(new LinearAnimation(this.scene, 0.5, [
			[0, 10, 0], [0, 0, 0]
		]));
		this.currAnimationIndex = 0;
	}

	update(delta) {
		if (this.hasOwnProperty("animations")) {
			if (this.currAnimationIndex === -1) return;
            let currAnimation = this.animations[this.currAnimationIndex];
            if (currAnimation.isFinished()){
                this.currAnimationIndex = this.currAnimationIndex + 1;
                if (this.currAnimationIndex >= this.animations.length) {
					Game.getInstance().allowPlay = true;
                    this.currAnimationIndex = -1;
                    return;
                }
                currAnimation = this.animations[this.currAnimationIndex];
            }
            currAnimation.update(delta);	
		}
	}
}