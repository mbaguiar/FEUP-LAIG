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

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
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
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                let light = this.graph.lights[key];
                
                //lights are predefined in cgfscene
                let lightProp = light.properties;
                this.lights[i].setPosition(lightProp.location.x, lightProp.location.y, lightProp.location.z, lightProp.location.w);
                this.lights[i].setAmbient(lightProp.ambient.r,lightProp.ambient.g, lightProp.ambient.b, lightProp.ambient.a);
                this.lights[i].setDiffuse(lightProp.diffuse.r,lightProp.diffuse.g, lightProp.diffuse.b, lightProp.diffuse.a);
                this.lights[i].setSpecular(lightProp.specular.r,lightProp.specular.g, lightProp.specular.b, lightProp.specular.a);

                if (light.type == "spot"){
                    let target = vec3.fromValues(lightProp.target.x, lightProp.target.y, lightProp.target.z);
                    let direction = vec4.normalize(vec4.create(), vec4.subtract(vec4.create(), target, this.lights[i].position));
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
        
        let defaultCamera = this.graph.views.children[0].attr;
        let defaultCameraPos = defaultCamera.attr;
        let position = Object.values(defaultCameraPos.from);
        let target = Object.values(defaultCameraPos.to);

        this.camera.setPosition(position);
        this.camera.setTarget(target);
        this.camera.direction = this.camera.calculateDirection();
        
        this.camera.near = defaultCamera.near;
        this.camera.far = defaultCamera.far;
        this.camera.fov = defaultCamera.angle;
        console.log(defaultCamera);

        this.axis = new CGFaxis(this, this.graph.axisLength);

        let bg = this.graph.ambient.background;
        let amb = this.graph.ambient.ambient;
        this.gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        this.setGlobalAmbientLight(amb.r, amb.g, amb.b, amb.a);

        this.initLights();

        // Adds lights group.
        this.interface.addLightsGroup(this.lightValues);

        this.sceneInited = true;
    }


    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

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
            // Draw axis
            this.axis.display();
            var i = 0;
            for (var key in this.lightValues) {
                if (this.lightValues.hasOwnProperty(key)) {
                    if (this.lightValues[key]) {
                        this.lights[i].setVisible(true);
                        this.lights[i].enable();
                    }
                    else {
                        this.lights[i].setVisible(false);
                        this.lights[i].disable();
                    }
                    this.lights[i].update();
                    i++;
                }
            }

            // Displays the scene (MySceneGraph function).
            //this.graph.displayScene();
        }
        else {
            // Draw axis
            this.axis.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}