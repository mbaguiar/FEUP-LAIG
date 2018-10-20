// Order of the groups in the XML document.


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

function toRadian(a) {
    return a * Math.PI / 180;
}


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

            } else this.onXMLMinorError("Ignoring unknow tag <" + name + ">.");
        }

        console.log("✅ %cParsed XML", "font-weight:bold; font-size:16px");
    }

    parseScene(node) {
        let res = this.parseAttributes(node, defaultAttributes.sceneAttr);
        if (res.errors.indexOf("root") != -1) throw `Missing root component id in <scene> tag.`;
        else if (res.defaults.hasOwnProperty("axis_length")) this.onXMLMinorError(`Invalid/missing axis_length attribute at <scene> tag. Assuming value='${res.defaults.axis_length}'.`)
        this.idRoot = res.attr.root;
        this.axisLength = res.attr.axis_length;
    }

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
                        this.printError(key, childrenRes[key]);
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

    parseCamera(node, type){
        let attrs;
        if (type == "perspective") attrs = defaultAttributes.perspectiveAttr;
        else if (type == "ortho") attrs = defaultAttributes.orthoAttr;
        let res;
        res = this.parseAttributes(node, attrs);
        res.attr.type = type;
        return res;
    }

    parseCameraChildren(node) {

        let res = {};
        for (let i = 0; i < node.length; i++) {
            if (node[i].nodeName === "from" || node[i].nodeName === "to") {
                    res[node[i].nodeName] = this.parseAttributes(node[i], defaultAttributes.xyzAttr);
                
            } else this.onXMLMinorError(`Invalid tag <${node[i].nodeName}>.`);
        }

        return res;
    }

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

    setDefaultLight(){
        this.lights = {};
        let light = defaults.light;
        this.lights[light.name] = {
            enabled: true,
            type: light.type,
            properties: {...light.properties}
        };   
    }

    parseLightsChildren({nodeName, children}) {
        let res = {};
        const tags = {...defaults.lightTags};
        if (nodeName === "spot") 
            tags["target"] = defaultAttributes.xyzwAttr;

        for (let i = 0; i < children.length; i++) {
            if (tags.hasOwnProperty(children[i].nodeName))
                    res[children[i].nodeName] = this.parseAttributes(children[i], tags[children[i].nodeName]);
            else this.onXMLMinorError(`Invalid light tag <${children[i].nodeName}>.`);
        }

        return res;
    }

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
                    this.printError(key, childrenRes[key]);
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

    setupMaterial(scene, shininess, mat){
        let material = new CGFappearance(scene);
        material.setShininess(shininess);
        if (mat.emission) material.setEmission(mat.emission.r, mat.emission.g, mat.emission.b, mat.emission.a);
        if (mat.ambient) material.setAmbient(mat.ambient.r, mat.ambient.g, mat.ambient.b, mat.ambient.a);
        if (mat.diffuse) material.setDiffuse(mat.diffuse.r, mat.diffuse.g, mat.diffuse.b, mat.diffuse.a);
        if (mat.specular) material.setSpecular(mat.specular.r, mat.specular.g, mat.specular.b, mat.specular.a);
        return material;
    }

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

                if (childrenRes.errors.length == 0){
                    res[node[i].nodeName] = childrenRes;
                    tags[node[i].nodeName]++;
                }
                
            } else this.onXMLMinorError(`Invalid material tag <${node[i].nodeName}>.`);
        }

        for(let key in tags){
            if (!tags[key]) this.onXMLMinorError(`Missing tag <${key}>. Using default values.`);
        }

        return res;
    }

    parseTransformations({children}) {

        this.transformations = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "transformation") {
                let discard = false;
                let res = this.parseAttributes(children[i], defaultAttributes.idAttr);
                this.printError(children[i].nodeName, res);
               
                let childrenRes = this.parseTransformation(children[i].children);
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

    parseTransformation(node) {

        let res = mat4.create();
        mat4.identity(res);

        for (let i = 0; i < node.length; i++) {
            if (defaults.transformationTags.hasOwnProperty(node[i].nodeName)) {
                let child = node[i];
                let param = this.parseAttributes(child, defaults.transformationTags[child.nodeName]);
                this.printError(child.nodeName, param);

                if (param.errors.length > 0) return null;

                mat4.mul(res, res, this.getTransformationMatrix(child.nodeName, param.attr));
            } else this.onXMLMinorError(`Invalid transformation type '${node[i].nodeName}'.`);

        }
        return res;
    }

    getTransformationMatrix(type, param) {
        let res = mat4.create();

        switch (type) {
            case "rotate":
                mat4.rotate(res, res, toRadian(param.angle), defaults.axis[param.axis]);
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

    parsePrimitives({children}) {

        this.primitives = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "primitive") {
                let discard = false;
                let res = this.parseAttributes(children[i], defaultAttributes.idAttr);

                let childrenRes = this.parsePrimitive(children[i].children);
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

    parsePrimitive(node) {
    
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
        this.printError(child.nodeName, res);
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
        }

    }

    parseComponents({children}) {
        this.componentValues = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "component") {
                let res = this.parseAttributes(children[i], defaultAttributes.idAttr);

                let component = this.parseComponent(children[i].children);

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
        }

        for (let key in this.components) {
            this.components[key].setupChildrenComponents();
        }

        if (Object.keys(this.components).length === 0) this.onXMLMinorError("A scene with no components isn't much fun :(");
    }

    parseComponent(node) {

        let res = {};

        for (let i = 0; i < node.length; i++) {
            if (defaults.componentTags.indexOf(node[i].nodeName) != -1) {
                res[node[i].nodeName] = this["parseComponent" + capitalize(node[i].nodeName)](node[i]);
            }
        }

        return res;
    }

    parseComponentTransformation(node) {

        node = node.children;

        let transformationTags = {
            transformationref: [new Attribute("id", "string")]
        };

        Object.assign(transformationTags, defaults.transformationTags);

        let res = [];

        for (let i = 0; i < node.length; i++) {
            if (transformationTags.hasOwnProperty(node[i].nodeName)) {
                let transf = this.parseAttributes(node[i], transformationTags[node[i].nodeName]);
                this.printError(node[i].nodeName, transf);
                if (transf.errors.length > 0) continue;
                if (node[i].nodeName === "transformationref") {
                    if (!this.transformations.hasOwnProperty(transf.attr.id)) {
                        this.onXMLMinorError(`Transformation with id='${transf.attr.id}' doesn't exist.`);
                        continue;
                    }
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

    parseComponentMaterials(node) {

        node = node.children;

        let res = [];

        for (let i = 0; i < node.length; i++) {
            if (node[i].nodeName === "material") {
                let mat = this.parseAttributes(node[i], defaultAttributes.idAttr);
                this.printError(node[i].nodeName, mat);
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

    parseComponentTexture(node) {

        let res = this.parseAttributes(node, defaultAttributes.componentTextureAttr);
        if (res.attr.id === "none" || res.attr.id === "inherit") {
            let s = res.errors.indexOf("length_s");
            if (s != -1) res.errors.splice(s,1);

            let t = res.errors.indexOf("length_t");
            if (t != -1) res.errors.splice(t,1);
        }
        this.printError(node.nodeName, res);
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

    parseComponentChildren(node) {

        node = node.children;

        let res = {};
        res.components = [];
        res.primitives = [];

        for (let i = 0; i < node.length; i++) {
            if (defaults.childrenTags.indexOf(node[i].nodeName) != -1) {
                let child = this.parseAttributes(node[i], defaultAttributes.idAttr);
                this.printError(node[i].nodeName, child);
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
            
            if (err){
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

    printError(tag, res){
        let message;
        const prefix = res.attr.hasOwnProperty("id")? `At tag <${tag}> with id='${res.attr.id}': `: `At tag <${tag}>: `;
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


    changeMaterials(){
        for (let key in this.components){
            this.components[key].nextMaterial();
        }
    }
}