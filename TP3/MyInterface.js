/**
 * MyInterface class, creating a GUI interface.
 */
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)
        return true;
    }

    processKeyDown(event){
        super.processKeyDown(event);
        if (event.code === "KeyM") {
            this.scene.changeMaterials = 1;
        }
    }

    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {array} lights
     */
    addLightsGroup(lights) {

        if (this.lights) {
            for(let i = this.lights.__controllers.length - 1; i >= 0; i--) {
                this.lights.__controllers[i].remove();
            }
        } else {
            this.lights = this.gui.addFolder("Lights");
        }


        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                this.lights.add(this.scene.lightValues[this.scene.graphIndex], key);
            }
        }
    }

    addViewsGroup(views) {
        if (this.cameras) {
            for(let i = this.cameras.__controllers.length - 1; i >= 0; i--) {
                this.cameras.__controllers[i].remove();
            }
        } else {
            this.cameras = this.gui.addFolder("Views");
        }

        const controller = this.cameras.add(this.scene, 'Selected camera', Object.keys(views));
        controller.onChange(value => {
            this.scene.setActiveCamera(value);
        });
    }

    addScenesGroup(scenes) {
        if (this.scenes) {
            for(let i = this.scenes.__controllers.length - 1; i >= 0; i--) {
                this.scenes.__controllers[i].remove();
            }
        } else {
            this.scenes = this.gui.addFolder("Scenes");
        }

        const controller = this.scenes.add(this.scene, 'Selected scene', Object.keys(scenes));
        controller.onChange((value) => this.scene.updateGraph(value));
    }

    addAnimationsGroup() {
        let group = this.gui.addFolder("Animations");
        group.add(this.scene, "Animation speed", 1, 5).step(1);
    }

    addGameGroup() {
        this.gameGroup.add(Game.getInstance().interface, 'Camera rotation');
        this.gameGroup.add(Game.getInstance().interface, 'Turn timer', 0, 60).step(5);
        this.gameGroup.add(Game.getInstance().interface, 'Player 1 (Red)', Object.keys(Game.getPlayerOptions()));
        this.gameGroup.add(Game.getInstance().interface, 'Player 2 (Blue)', Object.keys(Game.getPlayerOptions()));
        this.gameGroup.add(Game.getInstance().getGameOptions(), 'Start new game');
        this.gameGroup.add(Game.getInstance().getGameOptions(), 'Undo move');
        this.pauseController = this.gameGroup.add(Game.getInstance().getGameOptions(), 'Pause game');
        this.replayController = this.gameGroup.add(Game.getInstance().getGameOptions(), 'Replay game');
        this.viewController = this.gameGroup.add(Game.getInstance().getGameOptions(), 'View instructions');
    }

    addBoxOption() {
        this.gameGroup = this.gui.addFolder('Game');
        this.gameGroup.open();
        this.boxController = this.gameGroup.add(Game.getInstance().getGameOptions(), 'Open box');
    }

    removeBox() {
        this.boxController.remove();
    }

    updatePause(bool) {
        if (this.pauseController)
            this.pauseController.__li.innerText = bool? 'Resume game': 'Pause game';
    }

    updateView(bool) {
        for (let i = this.gameGroup.__controllers.length - 1; i >= 0 ; i--){
            let el = this.gameGroup.__controllers[i];
            el.remove();
        }
        if (bool) {
            const controller = this.gameGroup.add(Game.getGameOptions(), 'View instructions');
            controller.__li.innerText = 'Back to game';
        } else {
            this.addGameGroup();
        }
    }

    updateReplay(bool) {
        this.replayController.__li.innerText = bool? 'Replaying game...': 'Replay game';
    }
}