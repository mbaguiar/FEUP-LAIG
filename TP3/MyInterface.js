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

        var group = this.gui.addFolder("Lights");

        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                group.add(this.scene.lightValues, key);
            }
        }
    }

    addViewsGroup(views) {
        let group = this.gui.addFolder("Views");
        let controller = group.add(this.scene, 'selectedCamera', Object.keys(views));
        controller.onChange(value => {
            this.scene.setActiveCamera(value);
        });
    }

    addAnimationsGroup() {
        let group = this.gui.addFolder("Animations");
        group.add(this.scene, "Animations");
    }

    addGameGroup() {
        this.gameGroup.add(Game.getInstance().interface, 'Camera rotation');
        this.gameGroup.add(Game.getInstance().interface, 'Turn timer', 0, 60).step(5);
        this.gameGroup.add(Game.getInstance().interface, 'Player 1 (Red)', Object.keys(Game.getPlayerOptions()));
        this.gameGroup.add(Game.getInstance().interface, 'Player 2 (Blue)', Object.keys(Game.getPlayerOptions()));
        this.gameGroup.add(Game.getGameOptions(), 'Start new game');
        this.gameGroup.add(Game.getGameOptions(), 'Undo move');
        this.pauseController = this.gameGroup.add(Game.getGameOptions(), 'Pause game');
        this.gameGroup.add(Game.getGameOptions(), 'Replay game');
        this.viewController = this.gameGroup.add(Game.getGameOptions(), 'View instructions');
    }

    addBoxOption() {
        this.gameGroup = this.gui.addFolder('Game');
        this.gameGroup.open();
        this.boxController = this.gameGroup.add(Game.getGameOptions(), 'Open box');
    }

    removeBox() {
        this.boxController.remove();
    }

    updatePause(bool) {
        this.pauseController.__li.innerText = bool? 'Resume game': 'Pause game';
    }

    updateView(bool) {
        this.viewController.__li.innerText = bool? 'Back to game': 'View instructions';
    }
}