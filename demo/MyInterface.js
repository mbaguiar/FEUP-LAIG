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

    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {array} lights
     */
    addLightsGroup(lights) {

        var group = this.gui.addFolder("Lights");
        group.open();

        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                group.add(this.scene.lightValues, key);
            }
        }
    }

    addViewsGroup(views) {
        let group = this.gui.addFolder("Views");
        group.open();
        let controller = group.add(this.scene, 'selectedCamera', Object.keys(views));
        controller.onChange(value => {
            this.scene.setActiveCamera(value);
            this.setActiveCamera(this.scene.cameras[value]);
        });
    }
}