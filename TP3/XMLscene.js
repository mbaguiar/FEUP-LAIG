var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.lightValues = {};
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);
        this.camera = new CGFcamera(40 * DEGREE_TO_RAD, 0.1, 500, vec3.fromValues(60, 25, 60), vec3.fromValues(0, 0, 0));
        this.changeMaterials = 0;
        this.sceneInited = false;
        this.selectedCamera;
        this.Animations = true;

        this.setPickEnabled(true);

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.defaultMaterial = new CGFappearance(this);

        this.axis = new CGFaxis(this);
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {

        let i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (let key in this.graph.lights) {
            if (i >= 8)
                break; // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                let light = this.graph.lights[key];

                //lights are predefined in cgfscene
                let lightProp = light.properties;
                this.lights[i].setPosition(lightProp.location.x, lightProp.location.y, lightProp.location.z, lightProp.location.w);
                this.lights[i].setAmbient(lightProp.ambient.r, lightProp.ambient.g, lightProp.ambient.b, lightProp.ambient.a);
                this.lights[i].setDiffuse(lightProp.diffuse.r, lightProp.diffuse.g, lightProp.diffuse.b, lightProp.diffuse.a);
                this.lights[i].setSpecular(lightProp.specular.r, lightProp.specular.g, lightProp.specular.b, lightProp.specular.a);

                if (light.type == "spot") {
                    let target = vec4.fromValues(lightProp.target.x, lightProp.target.y, lightProp.target.z, lightProp.target.w);
                    let direction = vec4.create();
                    vec4.sub(direction, target, this.lights[i].position);
                    vec4.normalize(direction, direction);
                    this.lights[i].setSpotDirection(direction[0], direction[1], direction[2]);
                    this.lights[i].setSpotExponent(light.exponent);
                    this.lights[i].setSpotCutOff(light.angle);

                }

                this.lightValues[key] = light.enabled;

                this.lights[i].setVisible(true);

                if (light.enabled)
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }

    }


    /* Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {

        this.initCameras();

        this.interface.addViewsGroup(this.cameras);

        this.interface.addAnimationsGroup();

        this.axis = new CGFaxis(this, this.graph.axisLength);

        if (this.graph.ambient.background != null) {
            let bg = this.graph.ambient.background;
            this.gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        }

        if (this.graph.ambient.ambient != null) {
            let amb = this.graph.ambient.ambient;
            this.setGlobalAmbientLight(amb.r, amb.g, amb.b, amb.a);
        }

        this.initLights();

        // Adds lights group.
        this.interface.addLightsGroup(this.lightValues);

        this.setUpdatePeriod(1 / 60 * 1000);
        this.lastUpdate = (new Date()).getTime();

        this.sceneInited = true;
    }

    /**
     * Initializes scene cameras from graph views
     */
    initCameras() {
        this.cameras = {};
        if ((Object.keys(this.graph.views)).length == 0) {
            this.cameras["default"] = this.camera;
            this.selectedCamera = "default";
        }
        for (let key in this.graph.views) {
            const cam = this.graph.views[key];
            let newCam;
            if (cam.type == "perspective") {
                newCam = new CGFcamera(
                    cam.angle * DEGREE_TO_RAD, cam.near, cam.far, Object.values(cam.from), Object.values(cam.to)
                );

            } else if (cam.type == "ortho") {
                newCam = new CGFcameraOrtho(
                    cam.left, cam.right, cam.bottom, cam.top, cam.near, cam.far, Object.values(cam.from), Object.values(cam.to), vec3.fromValues(0, 1, 0)
                );
            }
            this.cameras[cam.id] = newCam;
            if (cam.id === this.graph.defaultViewId) {
                this.camera = newCam;
                this.interface.setActiveCamera(this.camera);
                this.selectedCamera = key;
            }
        }
    }
    /**
     * Sets scene active camera
     * @param  {camera id} id
     */
    setActiveCamera(id) {
        this.camera = this.cameras[id];
    }

    /**
     * Calls scene graph update
     * @param  {} currTime current Unix time
     */
    update(currTime) {
        if (this.sceneInited) {
            const delta = currTime - this.lastUpdate;
            this.graph.update(this.Animations? delta: 0);
            this.lastUpdate = currTime;
        }
    }

    /**
     * Displays the scene.
     */
    display() {
        this.handlePicking();
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        if (this.sceneInited) {
            this.defaultMaterial.apply();
            if (this.changeMaterials) {
                this.graph.changeMaterials();
                this.changeMaterials = 0;
            }
            // Draw axis
            this.axis.display();
            var i = 0;
            for (var key in this.lightValues) {
                if (this.lightValues.hasOwnProperty(key)) {
                    if (this.lightValues[key]) {
                        this.lights[i].setVisible(true);
                        this.lights[i].enable();
                    } else {
                        this.lights[i].setVisible(false);
                        this.lights[i].disable();
                    }
                    this.lights[i].update();
                    i++;
                }
            }

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        } else {
            // Draw axis
            this.axis.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    handlePicking() {
        if (this.pickMode === false) {
            if (this.pickResults != null && this.pickResults.length > 0) {
                for (var i=0; i< this.pickResults.length; i++) {
                    const obj = this.pickResults[i][0];
                    if (obj) {
                        const id = this.pickResults[i][1];
                        if (id >= 0 && id <= 169) {
                            const col = id % 13;
                            const row = Math.floor(id/13);
                            console.log(`Clicked cell ${row}:${col}`);
                        }
                    }
                }
                this.pickResults.splice(0,this.pickResults.length);
            }		
        }
        this.clearPickRegistration();
    }
}
