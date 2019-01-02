/**
 * Auxiliary function which capitalizes the first letter of a string
 * @param  {string} string
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

class MySceneGraph {
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.idRoot = null; // The id of the root element.
        this.axisLength = 1; // Axis length

        // File reading 
        this.reader = new CGFXMLreader();

        this.animatedObjects = [];
        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */

        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        let rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the letious blocks

        try {
            this.parseXMLFile(rootElement);
        } catch (error) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place

        this.scene.onGraphLoaded();
    }
    /**
     * Parses the XML File
     * @param  {XML root element} rootElement
     */
    parseXMLFile(rootElement) {

        if (rootElement.nodeName != "yas")
            throw "root tag <yas> missing";

        let nodes = rootElement.children;

        this.rootTags = {};

        defaults.rootTags.forEach(el => {
            this.rootTags[el] = 0;
        });

        // Processes each node, verifying errors.

        console.log("%cParsing XML", "font-weight:bold; font-size:16px");

        for (let i = 0; i < nodes.length; i++){
            let name = nodes[i].nodeName;
            if (this.rootTags.hasOwnProperty(name)){
                if (this.rootTags[name]) {
                    this.onXMLMinorError("Repeated tag <"+ name +">. Ignoring its contents.");
                    continue;
                }

                if (Object.keys(this.rootTags).indexOf(name) != i) this.onXMLMinorError("Tag <" + name + "> out of order");

                let funcName = 'parse' + capitalize(name);
                let log = `     %cParsing ${capitalize(name)}`;
                console.log(log, "font-weight:bold");
                this[funcName](nodes[i]);
                this.rootTags[name] = 1;
                log = `     ✅ %cParsed ${capitalize(name)}`;
                console.log(log, "font-weight:bold"); 

            } else this.onXMLMinorError("Ignoring unknown tag <" + name + ">.");
        }

        console.log("✅ %cParsed XML", "font-weight:bold; font-size:16px");
    }
    /**
     * Parses <scene> tag
     * @param  {scene node} node
     */
    parseScene(node) {
        let res = this.parseAttributes(node, defaultAttributes.sceneAttr);
        if (res.errors.indexOf("root") != -1) throw `Missing root component id in <scene> tag.`;
        else if (res.defaults.hasOwnProperty("axis_length")) this.onXMLMinorError(`Invalid/missing axis_length attribute at <scene> tag. Assuming value='${res.defaults.axis_length}'.`)
        this.idRoot = res.attr.root;
        this.axisLength = res.attr.axis_length;
    }
    /**
     * Parses <views> tag
     * @param  {views node} node
     */
    parseViews(node) {
        this.views = {};
        
        let res;
        res = this.parseAttributes(node, defaultAttributes.viewsAttr);
        if (res.errors.indexOf("default") != -1) this.onXMLMinorError(`Invalid/missing default attribute at <views> tag.`);
        else this.defaultViewId = res.attr.default;

        let children = node.children;
       
        for (let i = 0; i < children.length; i++) {
            let discard = false;
            if (children[i].nodeName === "perspective" || children[i].nodeName === "ortho") {
                res = this.parseCamera(children[i], children[i].nodeName);
                this.printError(children[i].nodeName, res);
                let childrenRes = this.parseCameraChildren(children[i].children);
                if (childrenRes.hasOwnProperty("from") && childrenRes.hasOwnProperty("to")){
                    for (let key in childrenRes){
                        this.printError(key, childrenRes[key], {tag: children[i].nodeName, id: res.attr.id});
                        if (childrenRes[key].errors.length == 0)
                            res.attr[key] = childrenRes[key].attr;
                        else discard = true;
                    }
                } else {
                    this.onXMLMinorError(`At view with id='${res.attr.id}': from/to tag missing/invalid. Discarding tag.`);
                    continue;
                }
                
                if (res.errors.length > 0 || discard) {
                    continue;
                } else this.views[res.attr.id] = res.attr;
            } else this.onXMLMinorError(`Invalid view tag <${children[i].nodeName}>.`);
        }

        if (Object.keys(this.views).length == 0){
            this.onXMLMinorError("No views declared. Setting default view.");
            return;
        }

        if (!this.views.hasOwnProperty(this.defaultViewId)) { 
            this.onXMLMinorError("Invalid default view. Defaulting to first view.");
            this.defaultViewId = Object.keys(this.views)[0];
        }

    }
    /**
     * Parses camera node (<perspective>/<ortho> tags)
     * @param  {view node} node
     * @param  {type of view} type
     * @returns Object with camera properties
     */
    parseCamera(node, type){
        let attrs;
        if (type == "perspective") attrs = defaultAttributes.perspectiveAttr;
        else if (type == "ortho") attrs = defaultAttributes.orthoAttr;
        let res;
        res = this.parseAttributes(node, attrs);
        res.attr.type = type;
        return res;
    }
    /**
     * Parses camera node children (<from>/<to> tags)
     * @param  {camera positioning} node
     * @returns Object with camera positioning
     */
    parseCameraChildren(node) {

        let res = {};
        for (let i = 0; i < node.length; i++) {
            if (node[i].nodeName === "from" || node[i].nodeName === "to") {
                    res[node[i].nodeName] = this.parseAttributes(node[i], defaultAttributes.xyzAttr);
                
            } else this.onXMLMinorError(`Invalid tag <${node[i].nodeName}>.`);
        }

        return res;
    }
    /**
     * Parses <ambient>/<background> tags
     * @param  {ambient node children} {children}
     */
    parseAmbient({children}) {

        let res = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "ambient" || children[i].nodeName == "background") {
                let childrenRes = this.parseAttributes(children[i], defaultAttributes.rgbaAttr);
                this.printError(children[i].nodeName, childrenRes);
                if (childrenRes.errors.length == 0)
                    res[children[i].nodeName] = childrenRes.attr; 

            } else this.onXMLMinorError(`Invalid ambient tag <${children[i].nodeName}>.`);
        } 

        this.ambient = res;
    }
    /**
     * Parses <lights> tag
     * @param  {lights node} node
     */
    parseLights(node) {
        let nodes = node.children;

        if (nodes.length === 0) {
            this.onXMLMinorError(`One or more lights required. Setting default light.`);
            this.setDefaultLight();
            return;
        }

        let res = {};

        for (let i = 0; i < nodes.length; i++) {

            let discard = false;

            let light = nodes[i];

            if (light.nodeName != "omni" && light.nodeName != "spot") {
                this.onXMLMinorError(`Invalid light type tag <${light.nodeName}>.`);
                continue;
            }

            let attr = defaultAttributes[light.nodeName + "Attr"];

            let lightRes = this.parseAttributes(light, attr);
            
            this.printError(light.nodeName, lightRes);

            let lightChildrenRes = this.parseLightsChildren(light);

            let prop = {};

            for (let key in lightChildrenRes){
                this.printError(key, lightChildrenRes[key]);
                if (lightChildrenRes[key].errors.length == 0)
                    prop[key] = lightChildrenRes[key].attr;
                else discard = true;
            }

            for (let key in defaults.lightTags){
                if (!prop.hasOwnProperty(key)) {
                    this.onXMLMinorError(`At light with id='${lightRes.attr.id}': Tag <${key}> missing. Skipping light.`);
                    discard = true;
                }
            }

            if (res.hasOwnProperty(lightRes.attr.id)) {
                this.onXMLMinorError(`Light with id='${lightRes.attr.id}' already exists. Skipping light.`);
                discard = true;;
            }

            if (lightRes.errors.length > 0 || discard) continue;


            res[lightRes.attr.id] = {
                enabled: lightRes.attr.enabled,
                type: light.nodeName,
                properties: prop,
            }

            if (light.nodeName === "spot") {
                res[lightRes.attr.id].angle = lightRes.attr.angle;
                res[lightRes.attr.id].exponent = lightRes.attr.exponent;
            }

        }
        this.lights = res;
    }
    /**
     * Sets graph default light
     */
    setDefaultLight(){
        this.lights = {};
        let light = defaults.light;
        this.lights[light.name] = {
            enabled: true,
            type: light.type,
            properties: {...light.properties}
        };   
    }

    /**
     * Parses <omni>/<spot> tags
     * @param  {light type node} {nodeName, children}
     * @returns Object with light properties
     */
    parseLightsChildren({nodeName, children}) {
        let res = {};
        const tags = {...defaults.lightTags};
        if (nodeName === "spot") 
            tags["target"] = defaultAttributes.xyzAttr;

        for (let i = 0; i < children.length; i++) {
            if (tags.hasOwnProperty(children[i].nodeName))
                    res[children[i].nodeName] = this.parseAttributes(children[i], tags[children[i].nodeName]);
            else this.onXMLMinorError(`Invalid light tag <${children[i].nodeName}>.`);
        }

        return res;
    }
    /**
     * Parses <textures> tag
     * @param  {textures node} {children}
     */
    parseTextures({children}) {
        this.textures = {};

        if (children.length === 0) {
            this.onXMLMinorError(`No texture declared.`);
            return;
        }
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "texture") {
                let res = this.parseAttributes(children[i], defaultAttributes.textureAttr);
                this.printError(children[i].nodeName, res);
                if (res.errors.length != 0){
                    continue;
                }
                if (this.textures.hasOwnProperty(res.attr.id)) {
                    this.onXMLMinorError(`Texture with id=' ${res.attr.id}' already exists. Skipping texture.`);
                    continue;
                }
                this.textures[res.attr.id] = new CGFtexture(this.scene, res.attr.file);
            } else this.onXMLMinorError(`Invalid texture tag <${children[i].nodeName}>.`);
        }

    }
    /**
     * Parses <materials> tag
     * @param  {materials node} {children}
     */
    parseMaterials({children}) {
        this.materials = {};
        let res;
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "material") {
                res = this.parseAttributes(children[i], defaultAttributes.materialAttr);
                this.printError(children[i].nodeName, res);

                let childrenRes = this.parseMaterial(children[i].children);
                let props = {};
                for (let key in childrenRes){
                    this.printError(key, childrenRes[key], {tag: children[i].nodeName, id: res.attr.id});
                    if (childrenRes[key].errors.length == 0)
                        props[key] = childrenRes[key].attr;
                }

                if (res.errors.length > 0){
                    continue;
                }

                if (this.materials.hasOwnProperty(res.id)){
                    this.onXMLMinorError(`Material with id='${res.id}' already exists. Skipping material.`);
                    continue;
                }

                let material = this.setupMaterial(this.scene, res.attr.shininess, props);
                this.materials[res.attr.id] = material;
                
            } else this.onXMLMinorError(`Invalid material tag <${children[i].nodeName}.`);
        }

        if (Object.keys(this.materials).length === 0) this.onXMLMinorError("No materials defined. Resorting to default material.");
    }
    /**
     * Creates and returns new material based on parameters
     * @param  {scene} scene
     * @param  {material shininess} shininess
     * @param  {emission, ambient, diffuse, specular properties} mat
     * @returns new CGFappearence 
     */
    setupMaterial(scene, shininess, mat){
        let material = new CGFappearance(scene);
        material.setShininess(shininess);
        if (mat.emission) material.setEmission(mat.emission.r, mat.emission.g, mat.emission.b, mat.emission.a);
        if (mat.ambient) material.setAmbient(mat.ambient.r, mat.ambient.g, mat.ambient.b, mat.ambient.a);
        if (mat.diffuse) material.setDiffuse(mat.diffuse.r, mat.diffuse.g, mat.diffuse.b, mat.diffuse.a);
        if (mat.specular) material.setSpecular(mat.specular.r, mat.specular.g, mat.specular.b, mat.specular.a);
        return material;
    }
    
    /**
     * Parses <material> tag
     * @param  {material node} node
     * @returns Object containing material properties
     */
    parseMaterial(node) {
        let res = {};
        let tags = {...defaults.materialTags};
        for (let i = 0; i < node.length; i++) {
            if (tags.hasOwnProperty(node[i].nodeName)){
                if (tags[node[i].nodeName]){
                    this.onXMLMinorError(`Duplicate attribute ${node[i].nodeName}.`);
                    continue;
                }   

                let childrenRes = this.parseAttributes(node[i], defaultAttributes.rgbaAttr);
                res[node[i].nodeName] = childrenRes;
                tags[node[i].nodeName]++;
                
                
            } else this.onXMLMinorError(`Invalid material tag <${node[i].nodeName}>.`);
        }

        for(let key in tags){
            if (!tags[key]) this.onXMLMinorError(`Missing tag <${key}>. Using default values.`);
        }

        return res;
    }

    /**
     * Parses <transformations> tag
     * @param  {transformations node} {children}
     */
    parseTransformations({children}) {

        this.transformations = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "transformation") {
                let discard = false;
                let res = this.parseAttributes(children[i], defaultAttributes.idAttr);
                this.printError(children[i].nodeName, res);
               
                let childrenRes = this.parseTransformation(children[i].children, {tag: children[i].nodeName, id: res.attr.id});
                if (childrenRes == null)
                    discard = true;

                if (res.errors.length > 0 || discard) {
                    continue;
                }

                if (this.transformations.hasOwnProperty(res.attr.id)) {
                    this.onXMLMinorError(`Transformation with id='${res.attr.id}' already exists. Skipping transformation.`);
                    continue;
               }

               this.transformations[res.attr.id] = childrenRes;
                
            } else this.onXMLMinorError(`Invalid transformation tag <${children[i].nodeName}>.`);
        }

        if (Object.keys(this.transformations).length === 0) this.onXMLMinorError("No transformations defined.");
    }
    /**
     * Parses indiviudal transformation block
     * @param  {transformation children node} node
     * @param  {<transformation> node} parent
     * @returns transformation matrix on success, null otherwise
     */
    parseTransformation(node, parent) {

        let res = mat4.create();
        mat4.identity(res);

        for (let i = 0; i < node.length; i++) {
            if (defaults.transformationTags.hasOwnProperty(node[i].nodeName)) {
                let child = node[i];
                let param = this.parseAttributes(child, defaults.transformationTags[child.nodeName]);
                this.printError(child.nodeName, param, parent);

                if (param.errors.length > 0) return null;

                mat4.mul(res, res, this.getTransformationMatrix(child.nodeName, param.attr));
            } else this.onXMLMinorError(`Invalid transformation type '${node[i].nodeName}'.`);

        }
        return res;
    }
    /**
     * Creates transformation matrix(mat4)
     * @param  {transformation type} type
     * @param  {transformation parameters} param
     * @returns transformation matrix
     */
    getTransformationMatrix(type, param) {
        let res = mat4.create();

        switch (type) {
            case "rotate":
                mat4.rotate(res, res, param.angle*DEGREE_TO_RAD, defaults.axis[param.axis]);
                break;
            case "translate":
                mat4.translate(res, res, Object.values(param));
                break;
            case "scale":
                mat4.scale(res, res, Object.values(param));
                break;
        }
        return res;
    }
    /**
     * Parses <animations> tag
     * @param  {animations ndoe} {children}
     */
    parseAnimations({children}) {
        this.animations = {};
        let discard = false;
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if (defaults.animationTags.hasOwnProperty(node.nodeName)){
                let res = this.parseAttributes(node, defaults.animationTags[node.nodeName]);
                this.printError(node.nodeName, res);

                if (node.nodeName === "linear") {
                    let points = this.parseControlPoints(node, {tag: node.nodeName, id: res.attr.id});
                    if (points != null){
                        if (points.length < 2) {
                            this.onXMLMinorError("There must be at lesat 2 control points in a linear animation.");
                            discard = true;
                        }
                        res.attr["points"] = points;
                    } else { 
                        discard = true;
                    }
                }

                res.attr["type"] = node.nodeName;
                
                if (res.errors.length > 0 || discard) {
                    this.onXMLMinorError(`Invalid animation. Skipping tag.`);
                    continue;
                } 

                if (this.animations.hasOwnProperty(res.attr.id)) {
                    this.onXMLMinorError(`Animation with id='${res.attr.id}' already exists. Skipping animation.`);
                    continue;
                }

                this.animations[res.attr.id] = res.attr;

            } else this.onXMLMinorError(`Invalid animation tag <${node.nodeName}>.`);
        }
    }
    /**
     * Parses control points
     * @param  {control points parent node} {children}
     * @param  {node} parent
     */
    parseControlPoints({children}, parent) {
        let res = [];
        let discard = false;
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if (node.nodeName === "controlpoint"){
                let point = this.parseAttributes(node, defaultAttributes.xxyyzzAttr);
                this.printError(node.nodeName, point, parent);
                if (point.errors.length > 0) {
                    discard = true;
                } else {
                    res.push([point.attr["xx"], point.attr["yy"], point.attr["zz"]]);
                }
            } else {
                this.onXMLMinorError(`Invalid control point tag <${node.nodeName}>.`);
                discard = true;
            }
        }

        if (discard)
            return null;
        else 
            return res;
    }

    /**
     * Parses <primitives> tag
     * @param  {primitives node} {children}
     */
    parsePrimitives({children}) {

        this.primitives = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "primitive") {
                let discard = false;
                let res = this.parseAttributes(children[i], defaultAttributes.idAttr);

                let childrenRes = this.parsePrimitive(children[i].children, {tag: children[i].nodeName, id: res.attr.id});
                if (childrenRes == null) discard = true;
                
                if (res.errors.length > 0 || discard) continue;

                if (this.primitives.hasOwnProperty(res.attr.id)) {
                    this.onXMLMinorError(`Primitive with id='${res.attr.id}' already exists. Skipping primitive.`);
                    continue;
                }
                
                this.primitives[res.attr.id] = childrenRes;
                
            } else this.onXMLMinorError(`Invalid primitive tag <${children[i].nodeName}>.`);
        }

        if (Object.keys(this.primitives).length === 0) this.onXMLMinorError("There's no way you can build a scene with no primitives :(");
    }

    /**
     * Parses <primitive> tag
     * @param  {primitive node children} node
     * @param  {<primitive> tag node} parent
     * @returns new Primitive(extends CGFobject) on success, null otherwise
     */
    parsePrimitive(node, parent) {
    
        if (node.length != 1) {
            this.onXMLMinorError("Primitive should have one and only one tag.");
            return null;
        }

        let child = node[0];

        if (!defaults.primitiveTags.hasOwnProperty(child.nodeName)) {
            this.onXMLMinorError(`Invalid primitive tag <${child.nodeName}>.`);
            return null;
        }

        let res = this.parseAttributes(child, defaults.primitiveTags[child.nodeName]);
        this.printError(child.nodeName, res, parent);
        if (res.errors.length > 0)
            return null;

        switch (child.nodeName) {
            case "rectangle":
                return new Rectangle(this.scene, res.attr.x1, res.attr.y1, res.attr.x2, res.attr.y2);
            case "triangle":
                return new Triangle(this.scene, res.attr.x1, res.attr.y1, res.attr.z1, res.attr.x2, res.attr.y2, res.attr.z2, res.attr.x3, res.attr.y3, res.attr.z3);
            case "sphere":
                return new Sphere(this.scene, res.attr.radius, res.attr.slices, res.attr.stacks);
            case "cylinder":
                return new Cylinder(this.scene, res.attr.base, res.attr.top, res.attr.height, res.attr.slices, res.attr.stacks);
            case "torus":
                return new Torus(this.scene, res.attr.inner, res.attr.outer, res.attr.slices, res.attr.loops);
            case "plane":
                return new Plane(this.scene, res.attr.npartsU, res.attr.npartsV);
            case "patch":
                let controlPoints = this.parseControlPoints(child, parent);
                return new Patch(this.scene, res.attr.npointsU, res.attr.npointsV, res.attr.npartsU, res.attr.npartsV, controlPoints);
            case "cylinder2":
                return new Cylinder2(this.scene, res.attr.base, res.attr.top, res.attr.height, res.attr.slices, res.attr.stacks);
            case "terrain":
                if (this.validTextures([res.attr.idtexture, res.attr.idheightmap]))
                    return new Terrain(this.scene, this, res.attr.idtexture, res.attr.idheightmap, res.attr.parts, res.attr.heightscale);
            case "water":
                if (this.validTextures([res.attr.idtexture, res.attr.idwavemap])){
                    const water = new Water(this.scene, this, res.attr.idtexture, res.attr.idwavemap, res.attr.parts, res.attr.heightscale, res.attr.texscale);
                    this.animatedObjects.push(water);
                    return water;
                }   
            case "vehicle":
                return new Vehicle(this.scene);
            case "light":
                const light = new Light(this.scene);
                this.animatedObjects.push(light);
                return light;
            case "board":
                return new Board(this.scene);
            case "piece":
                return new Piece(this.scene);
            case 'dispenser':
                return new Dispenser(this.scene);
            case 'counter':
                return new Counter(this.scene);
        }
    }

    /**
     * Parse <components> tag
     * @param  {components node} {children}
     */
    parseComponents({children}) {
        this.componentValues = {};
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "component") {
                let res = this.parseAttributes(children[i], defaultAttributes.idAttr);

                let component = this.parseComponent(children[i].children, {tag: children[i].nodeName, id: res.attr.id});

                if (component == null || res.errors.length > 0){
                    continue;
                } 
                
                if (this.componentValues.hasOwnProperty(res.attr.id)) {
                    this.onXMLMinorError(`Component with id='${res.attr.id}' already exists. Skipping component`);
                    continue;
                }
                    this.componentValues[res.attr.id] = component;
            
                } else this.onXMLMinorError(`Invalid component tag <children[i].nodeName>.`);
        }

        this.components = {};
        for (let key in this.componentValues) {
            let currComponent = this.componentValues[key];
            for (let i = currComponent.children.components.length - 1; i >= 0 ; i--) {
                let id = currComponent.children.components[i];
                if (!this.componentValues.hasOwnProperty(id)) {
                    this.onXMLMinorError(`Invalid componentref='${id}'. Discarding componentref.`);
                    currComponent.children.components.splice(i, 1);
                }
            }
            this.components[key] = new Component(this, this.scene, key, currComponent);
            if(currComponent.hasOwnProperty('animations') && currComponent['animations'].length){
                this.animatedObjects.push(this.components[key]);
            }
        }

        for (let key in this.components) {
            this.components[key].setupChildrenComponents();
        }

        if (Object.keys(this.components).length === 0) this.onXMLMinorError("A scene with no components isn't much fun :(");
    }
    /**
     * Parses <component> tag
     * @param  {component node children} node
     * @param  {<component> tag node} parent
     * @returns Object containing component properties
     */
    parseComponent(node, parent) {

        let res = {};

        let componentTags = {};
        defaults.componentTags.forEach(el => componentTags[el] = false);
        let discard = false;

        for (let i = 0; i < node.length; i++) {
            if (componentTags.hasOwnProperty(node[i].nodeName) && !componentTags[node[i].nodeName]) {
                res[node[i].nodeName] = this["parseComponent" + capitalize(node[i].nodeName)](node[i], parent);
                componentTags[node[i].nodeName] = true;
            } else {
                this.onXMLMinorError(`At component with id='${parent.id}': Invalid tag <${node[i].nodeName}>. Discarding component.`);
                discard = true;
            }
        }

        for (let key in componentTags){
            if (!componentTags[key]){
                if (key === "animations") continue;
                this.onXMLMinorError(`At component with id='${parent.id}': Missing tag <${key}>. Discarding component.`);
                discard = true;
            }
        }


        if (discard) return null;
        return res;
    }
    /**
     * Parses component <transformation> tag
     * @param  {transformation node} node
     * @param  {<component> tag node} parent
     * @returns Object containing transformation information
     */
    parseComponentTransformation(node, parent) {

        node = node.children;

        let ref = 0;

        let transformationTags = {
            transformationref: [new Attribute("id", "string")]
        };

        Object.assign(transformationTags, defaults.transformationTags);

        let res = [];

        for (let i = 0; i < node.length; i++) {
            if (transformationTags.hasOwnProperty(node[i].nodeName)) {
                let transf = this.parseAttributes(node[i], transformationTags[node[i].nodeName]);
                this.printError(node[i].nodeName, transf, parent);
                if (transf.errors.length > 0) continue;
                if (node[i].nodeName === "transformationref") {
                    if (ref) {
                        this.onXMLMinorError("Only 1 transformation tag is allowed per component. Discarding tag.");
                        continue;
                    }
                    if (!this.transformations.hasOwnProperty(transf.attr.id)) {
                        this.onXMLMinorError(`Transformation with id='${transf.attr.id}' doesn't exist.`);
                        continue;
                    }
                    ref++;
                    res.push({
                        type: "ref",
                        id: transf.attr.id
                    });
                } else {
                    res.push({
                        type: node[i].nodeName,
                        param: transf.attr
                    });
                }
            } else this.onXMLMinorError(`Invalid transformation tag <${node[i].nodeName}>.`);
        }
        return res;

    }
    /**
     * Parses component <animations> tag
     * @param  {animations node children} node
     * @param  {<component> tag node} parent
     */
    parseComponentAnimations(node, parent) {

        node = node.children;
        
        let res = [];

        for (let i = 0; i < node.length; i++) {
            if (node[i].nodeName === "animationref") {
                let animation = this.parseAttributes(node[i], defaultAttributes.idAttr);
                this.printError(node[i].nodeName, animation, parent);
                if (animation.errors.length > 0) {
                    continue;
                }
                if (!this.animations.hasOwnProperty(animation.attr.id)){
                    this.onXMLMinorError(`Animation with id='${animation.attr.id}' doesn't exist. Skipping tag.`);
                    continue;
                }
                res.push(animation.attr.id);
            } else this.onXMLReady(`Invalid animation tag <${node[i].nodeName}>.`);
        }
        
        return res;
    }

    /**
     * Parses component <materials> tag
     * @param  {materials node children} node
     * @param  {<component> tag node} parent
     * @returns Object containing materials information
     */
    parseComponentMaterials(node, parent) {

        node = node.children;

        let res = [];

        for (let i = 0; i < node.length; i++) {
            if (node[i].nodeName === "material") {
                let mat = this.parseAttributes(node[i], defaultAttributes.idAttr);
                this.printError(node[i].nodeName, mat, parent);
                if (mat.errors.length > 0) continue;
                if (!this.materials.hasOwnProperty(mat.attr.id) && mat.attr.id != "inherit"){ 
                    this.onXMLMinorError(`Material with id='${mat.attr.id}' doesn't exist.`);
                    continue;
                }
                res.push(mat.attr.id);
            } else this.onXMLMinorError(`Invalid material tag <${node[i].nodeName}>.`);
        }

        if (res.length == 0) this.onXMLMinorError("No valid material declared. Using default material.");

        return res;
    }

    /**
     * Parses component <texture> tag
     * @param  {texture node} node
     * @param  {<component> tag node} parent
     * @returns Object containing texture information
     */
    parseComponentTexture(node, parent) {

        let res = this.parseAttributes(node, defaultAttributes.componentTextureAttr);
        if (res.attr.id === "none" || res.attr.id === "inherit") {
            let s = res.errors.indexOf("length_s");
            if (s != -1) res.errors.splice(s,1);

            let t = res.errors.indexOf("length_t");
            if (t != -1) res.errors.splice(t,1);
        }
        this.printError(node.nodeName, res, parent);
        let discard = false;

        if (res.errors.length == 0) {
            if (!this.textures.hasOwnProperty(res.attr.id) && res.attr.id != "inherit" && res.attr.id != "none") { 
                this.onXMLMinorError(`Texture with id='${res.attr.id}' doesn't exist.`);
                discard = true;
            }
        } else discard = true;

        if (discard){
            this.onXMLMinorError("No valid texture declared. Using none.");
            return {id: "none"};
        }
        
        return res.attr;

    }

    /**
     * Parses component <children> tag
     * @param  {children node children} node
     * @param  {<component> tag node} parent
     * @returns Object containing children information
     */
    parseComponentChildren(node, parent) {

        node = node.children;

        let res = {};
        res.components = [];
        res.primitives = [];

        for (let i = 0; i < node.length; i++) {
            if (defaults.childrenTags.indexOf(node[i].nodeName) != -1) {
                let child = this.parseAttributes(node[i], defaultAttributes.idAttr);
                this.printError(node[i].nodeName, child, parent);
                if (child.errors.length > 0) continue;
                if (node[i].nodeName === "primitiveref") {
                    if (!this.primitives.hasOwnProperty(child.attr.id)) {
                        this.onXMLMinorError(`Primitive with id='${child.attr.id}'. Discarding primitiveref.`);
                        continue;
                    }
                }
                res[node[i].nodeName.slice(0, -3) + "s"].push(child.attr.id);
            } else this.onXMLMinorError(`Invalid component child tag <${node[i].nodeName}>.`);
        }
        return res;
    }

    
    /**
     * Calls recursive display starting on root node.
     * In case this is null, uses graph default root
     * @param  {root component} root
     */
    displayScene(root) {
        if (root == null) this.components[this.idRoot].display();
        else this.components[root].display();
    }


    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("          Warning: " + message);
    }

    log(message) {
        console.log(" " + message);
    }

    /**
     * Parses node
     * @param  {node} node
     * @param  {Attribute array} attributes
     * @returns Object{attr, errors, defaults} containing the parsed attributes and eventual errors or default replacements
     */
    parseAttributes(node, attributes) {
        let res = {};
        res.attr = {};
        res.errors = [];
        res.defaults = {};
        for (let i = 0; i < attributes.length; i++) {
            let attr = attributes[i];
            let value = this.reader[defaults.typeFunc[attr.type]](node, attr.name, false);
            let err;
            if (value == null){
                err = true;
            }
            if (attr.type === "float" || attr.type === "int") {
                if (isNaN(value)) err = true;
                else if (attr.rangeRest){
                    if (value < attr.rangeMin) {
                        err = true;
                        attr.default = attr.rangeMin;
                    }
                    else if (value > attr.rangeMax) {
                        err = true;
                        attr.default = attr.rangeMax;
                    }
                }
            } else if (attr.type === "string")
                if (value == "") err = true;
            
            if (err && !attr.optional){
                if (attr.default) {
                    res.defaults[attr.name] = attr.default;
                    value = attr.default;
                    err = false;
                } else res.errors.push(attr.name);
            }

            if (!err) res.attr[attr.name] = value;
        }
        
		return res;
    }
    /**
     * Prints errors/default replacements
     * @param  {tag name} tag
     * @param  {parsed object from parseAttributes()} res
     * @param  {tag, id} parent
     */
    printError(tag, res, parent){
        let message;
        let parentPrefix = "";
        if (parent != null)
            parentPrefix = (parent.id != null)? `At tag <${parent.tag}> with id='${parent.id}': `: `At tag <${parent.tag}>: `;
        const prefix = res.attr.hasOwnProperty("id")? `${parentPrefix}At tag <${tag}> with id='${res.attr.id}': `: `${parentPrefix}At tag <${tag}>: `;
        const errorMessage = (attr) => `Atrribute ${attr} is missing/invalid.`;
        const defaultMessage = (attr, val) => `${errorMessage(attr)} Assuming value='${val}'.`;
        message = prefix;
        res.errors.forEach(e => {
            message += `${errorMessage(e)}\n`;
        });
        for (let key in res.defaults){
            let d = res.defaults[key];
            message += `${defaultMessage(key, d)}\n`;
        }

        if (res.errors.length > 0) message += "Discarding tag.";
        if (message != prefix) this.onXMLMinorError(message);
    }
    /**
     * Checks if textures in array are all valid in scene graph
     * @param  {} textures textures array
     */
    validTextures(textures) {
        for (let texture of textures) {
            if (!this.textures.hasOwnProperty(texture))
                return false;
        }
        return true;
    }

    /**
     * Calls material iteration on all graph components
     */
    changeMaterials(){
        for (let key in this.components){
            this.components[key].nextMaterial();
        }
    }

    /**
     * Calls update on all animated objects
     * @param  {} delta time since last update
     */
    update(delta){
        if (delta === 0) return;
        for (let animatedObject of this.animatedObjects){
            animatedObject.update(delta);
        }
    }
}