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
        this.information = "hi";
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
        this['Selected camera'];
        this.Animations = true;
        this.scenes = {};
        this['Animation speed'] = 1;

        this.graphIndex = 0;

        this.setPickEnabled(true);

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.defaultMaterial = new CGFappearance(this);

        this.axis = new CGFaxis(this);

        this.api = new PrologAPI();
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights(graph) {
        const lights = [...this.lights];
        const lightValues = [];

        let i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (let key in graph.lights) {
            if (i >= 8)
                break; // Only eight lights allowed by WebGL.

            if (graph.lights.hasOwnProperty(key)) {
                let light = graph.lights[key];

                //lights are predefined in cgfscene
                let lightProp = light.properties;
                lights[i].setPosition(lightProp.location.x, lightProp.location.y, lightProp.location.z, lightProp.location.w);
                lights[i].setAmbient(lightProp.ambient.r, lightProp.ambient.g, lightProp.ambient.b, lightProp.ambient.a);
                lights[i].setDiffuse(lightProp.diffuse.r, lightProp.diffuse.g, lightProp.diffuse.b, lightProp.diffuse.a);
                lights[i].setSpecular(lightProp.specular.r, lightProp.specular.g, lightProp.specular.b, lightProp.specular.a);

                if (light.type == "spot") {
                    let target = vec4.fromValues(lightProp.target.x, lightProp.target.y, lightProp.target.z, lightProp.target.w);
                    let direction = vec4.create();
                    vec4.sub(direction, target, lights[i].position);
                    vec4.normalize(direction, direction);
                    lights[i].setSpotDirection(direction[0], direction[1], direction[2]);
                    lights[i].setSpotExponent(light.exponent);
                    lights[i].setSpotCutOff(light.angle);

                }

                lightValues[key] = light.enabled;

                lights[i].setVisible(true);

                if (light.enabled)
                    lights[i].enable();
                else
                    lights[i].disable();

                lights[i].update();

                i++;
            }
        }
        if (!this.hasOwnProperty('graphLights')) {
            this.graphLights = [lights];
            this.lightValues = [lightValues];
        } else {
            this.graphLights.push(lights);
            this.lightValues.push(lightValues);
        }

    }


    /* Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded(graph) {
        if (!this.hasOwnProperty('Selected scene')) {
            this['Selected scene'] = graph.filename;
        }
        this.scenes[graph.filename] = Object.keys(this.scenes).length;
        this.interface.addScenesGroup(this.scenes);
        this.initLights(graph);
        this.initCameras(graph);

        if (!this.hasOwnProperty('graphs')) {
            this.graphs = [graph];
            this.interface.addAnimationsGroup();
            this.interface.addBoxOption();
            this.updateGraph(graph.filename);
        } else {
            this.graphs.push(graph);
        }


        this.setUpdatePeriod(1 / 60 * 1000);
        this.lastUpdate = (new Date()).getTime();
        this.sceneInited = true;
    }

    updateGraph(value) {
        this.graphIndex = this.scenes[value];
        const graph = this.graphs[this.graphIndex];
        this.axis = new CGFaxis(this, graph.axisLength);

        if (graph.ambient.background != null) {
            let bg = graph.ambient.background;
            this.gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        }

        if (graph.ambient.ambient != null) {
            let amb = graph.ambient.ambient;
            this.setGlobalAmbientLight(amb.r, amb.g, amb.b, amb.a);
        }
    }

    /**
     * Initializes scene cameras from graph views
     */
    initCameras(graph) {
        this.lockedCam = false;
        this.interface.setActiveCamera(null);
        const graphCameras = {};

        if ((Object.keys(graph.views)).length == 0) {
            graphCameras["default"] = this.camera;
            this['Selected camera'] = "default";
        }
        for (let key in graph.views) {
            const cam = graph.views[key];
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
            if (!this.hasOwnProperty(graphCameras)) {
                graphCameras[cam.id] = newCam;
                if (cam.id === graph.defaultViewId) {
                    this.camera = newCam;
                    //this.interface.setActiveCamera(this.camera);
                    this['Selected camera'] = key;
                }
            }
        }

        if (!this.hasOwnProperty('cameras')) {
            this.cameras = graphCameras;
            this.interface.addViewsGroup(graphCameras);
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
            this.graphs[this.graphIndex].update(this.Animations? delta * this['Animation speed']: 0);
            Game.getInstance().update(this.Animations? delta * this['Animation speed']: 0);
            this.lastUpdate = currTime;
            if (this.cameraAnimation)
                this.cameraAnimation.update(this.Animations? delta * this['Animation speed']: 0)
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
                this.graphs[this.graphIndex].changeMaterials();
                this.changeMaterials = 0;
            }
            // Draw axis
            this.axis.display();
            var i = 0;
            for (var key in this.lightValues[this.graphIndex]) {
                if (this.lightValues[this.graphIndex].hasOwnProperty(key)) {
                    if (this.lightValues[this.graphIndex][key]) {
                        this.graphLights[this.graphIndex][i].setVisible(true);
                        this.graphLights[this.graphIndex][i].enable();
                    } else {
                        this.graphLights[this.graphIndex][i].setVisible(false);
                        this.graphLights[this.graphIndex][i].disable();
                    }
                    this.graphLights[this.graphIndex][i].update();
                    i++;
                }
            }

            // Displays the scene (MySceneGraph function).
            this.graphs[this.graphIndex].displayScene();
            Game.getInstance().display();
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
                            if (Game.getInstance().state) {
                                Game.getInstance().move(row+1, col+1);
                                Game.getInstance().gameOver();
                            }
                        }
                    }
                }
                this.pickResults.splice(0,this.pickResults.length);
            }
        }
        this.clearPickRegistration();
    }

    rotateCamera(player) {
        if (this.lockedCam || this.camera === this.cameras[`p${player}`])
            return;
        if (!this.cameraAnimation)
        Game.getInstance().eventStarted();
        this.camera = new CGFcamera(this.camera.fov, this.camera.near, this.camera.far, this.camera.position, this.camera.target);
        this.cameraAnimation = {
            speed: Math.PI/1.5,
            time: 0,
            finalCam: `p${player}`,
            update: (delta) => {
                const deltaSecs = delta * MILIS_TO_SECS;
                this.cameraAnimation.time += deltaSecs;
                if (this.cameraAnimation.time >= 1.5) {
                    this.setActiveCamera(`p${player}`);
                    Game.getInstance().eventEnded();
                    this.cameraAnimation = null;
                    return;
                } else {
                    this.camera.orbit([0, 1, 0], deltaSecs * this.cameraAnimation.speed);
                }
            }
        }; 
    }

    panToInstructions() {
        this.gameCam = this.camera;
        if (this.cameraAnimation)
            this.gameCam = this.cameras[this.cameraAnimation.finalCam];
        if (this.camera === this.cameras['p2']) {
            this.rotateCamera(1);
            Game.getInstance().eventQueue.push(() => this.panCamera('instructions'));
        } else {
            this.panCamera('instructions');
        }
    }

    panToGame() {
        this.panCamera('game');
        const cam = this.gameCam || this.cameras['p1'];
        if (cam === this.cameras['p1']) {
            Game.getInstance().eventQueue.push(() => this.rotateCamera(1));
        } else if (cam === this.cameras['p2']) {
            Game.getInstance().eventQueue.push(() => this.rotateCamera(2));
        }
    }

    panCamera(to) {
        if (!this.cameraAnimation)
            Game.getInstance().eventStarted();
        let pos, tgt;
        if (to === 'game') {
            pos = [...this.cameras['p1'].position];
            tgt = [...this.cameras['p1'].target];
            var cam = 'p1';
        } else if (to === 'instructions') {
            pos = [...this.cameras['instructions'].position];
            tgt = [...this.cameras['instructions'].target];
            var cam = 'instructions';
        }
        const animVec = vec3.sub(vec3.create(), pos, this.camera.position);
        const P3 = [...animVec];
        P3[2] += 10;
        this.camera = new CGFcamera(this.camera.fov, this.camera.near, this.camera.far, this.camera.position, this.camera.target);
        const initialPos = this.camera.position;
        const intialTarget = this.camera.target;
        let diffVec = vec3.sub(vec3.create(), tgt, this.camera.target);
        vec3.normalize(diffVec, diffVec);
        this.cameraAnimation = {
            anim: new BezierAnimation(this.scene, 3, [[0, 0, 0], [0, 0, 10], P3, animVec]),
            update: (delta) => {
                this.camera.position = vec3.add(vec3.create(), initialPos, this.cameraAnimation.anim.getCurrentPos());
                const auxVec = vec3.sub(vec3.create(), this.camera.position, intialTarget);
                const ang = angle(auxVec, diffVec);
                const length = vec3.length(auxVec);
                this.camera.target = scaleAndAdd(intialTarget, diffVec, length*Math.cos(ang));
                if (this.cameraAnimation.anim.isFinished()) {
                    this.setActiveCamera(cam);
                    Game.getInstance().eventEnded();
                    this.cameraAnimation = null;
                    return;
                }
                this.cameraAnimation.anim.update(delta);
            }
        }; 
    }

}
