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

        for (let i = 0; i < nodes.length; i++){
            let name = nodes[i].nodeName;
            if (this.rootTags.hasOwnProperty(name)){
                if (this.rootTags[name]) {
                    this.onXMLMinorError("Repeated tag <"+ name +">. Ignoring its contents.");
                    continue;
                }

                if (Object.keys(this.rootTags).indexOf(name) != i) this.onXMLMinorError("Tag <" + name + "> out of order");

                let funcName = 'parse' + capitalize(name);
                this[funcName](nodes[i]);
                this.rootTags[name] = 1;

            } else this.onXMLMinorError("Ignoring unknow tag <" + name + ">.");
        }
    }

    parseScene(node) {
        let res = this.parseAttributes(node, defaultAttributes.sceneAttr);
        this.idRoot = res.root;
        this.axisLength = res.axis_length;
    }

    parseViews(node) {
        this.views = {};

        this.defaultViewId = this.parseAttributes(node, defaultAttributes.viewsAttr)["default"];

        let viewsChildren = node.children;

        let res;

        for (let i = 0; i < viewsChildren.length; i++) {
            if (viewsChildren[i].nodeName == "perspective" || viewsChildren[i].nodeName == "ortho") {
                res = this.parseCamera(viewsChildren[i], viewsChildren[i].nodeName);
            } else throw "Invalid views tag <" + viewsChildren[i].nodeName + ">.";

            if (res != null)
                this.views[res.id] = res;
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
        try {
            res = this.parseAttributes(node, attrs);
            Object.assign(res, this.parseCameraChildren(node.children));
        } catch (err) {
            this.onXMLMinorError("At <" + type + "> tag: \n" + err + "Skipping view.");
            return null;
        }
        res.type = type;
        return res;
    }

    parseCameraChildren(node) {

        let res = {};
        let error = "";
        for (let i = 0; i < node.length; i++) {
            if (node[i].nodeName === "from" || node[i].nodeName === "to") {
                try {
                    res[node[i].nodeName] = this.parseAttributes(node[i], defaultAttributes.xyzAttr);
                } catch (err) {
                    error += "At tag <" + node[i].nodeName + ">: " + err + "\n";
                }
                
            } else error += "Invalid tag <" + node[i].nodeName + ">.\n"
        }
        if (error !== "") throw error;

        return res;
    }

    parseAmbient(node) {

        let ambientChildren = node.children;

        let res = {};

        for (let i = 0; i < ambientChildren.length; i++) {
            if (ambientChildren[i].nodeName == "ambient" || ambientChildren[i].nodeName == "background") {
                try {
                    res[ambientChildren[i].nodeName] = this.parseAttributes(ambientChildren[i], defaultAttributes.rgbaAttr);
                } catch (err) {
                    this.onXMLMinorError("At tag <" + ambientChildren[i].nodeName + ">: " + err + " Setting default " + ambientChildren[i].nodeName + ".");
                }    
            }
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

            let light = nodes[i];

            if (light.nodeName != "omni" && light.nodeName != "spot") {
                this.onXMLMinorError("Invalid light type tag <" + light.nodeName + ">.");
                continue;
            }

            let attr = defaultAttributes[light.nodeName + "Attr"];

            let lightRes;

            try {
                lightRes = this.parseAttributes(light, attr);
            } catch (err) {
                this.onXMLMinorError(`Invalid ${light.nodeName} light. Skipping light.`);
                continue
            }
            

            if (res.hasOwnProperty(lightRes.id)) {
                this.onXMLMinorError(`Light with id='${lightRes.id}' already exists. Skipping light.`);
                continue;
            }

            try {
                res[lightRes.id] = {
                    enabled: lightRes.enabled,
                    type: light.nodeName,
                    properties: this.parseLightsChildren(light),
                }
            } catch(err) {
                this.onXMLMinorError(`At light with id='${lightRes.id}': ${err} Skipping this light.`);
                continue;
            }

            if (light.nodeName === "spot") {
                res[lightRes.id].angle = lightRes.angle;
                res[lightRes.id].exponent = lightRes.exponent;
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
                try {
                    res[children[i].nodeName] = this.parseAttributes(children[i], tags[children[i].nodeName]);
                } catch (e) {
                    throw `At tag <${children[i].nodeName}>: ${e}`;
                }
            else throw `Invalid tag <${children[i].nodeName}>.`;
        }

        return res;
    }

    parseTextures(node) {
        let children = node.children;

        this.textures = {};

        if (children.length === 0) {
            this.onXMLMinorError(`No texture declared.`);
            return;
        }
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "texture") {
                let res = this.parseAttributes(children[i], defaultAttributes.textureAttr);
                if (this.textures.hasOwnProperty(res.id)) {
                    this.onXMLMinorError(`Texture with id=' ${res.id}' already exists. Skipping texture.`);
                    continue;
                }
                this.textures[res.id] = new CGFtexture(this.scene, res.file);
            } else this.onXMLMinorError(`Invalid texture tag <${children[i].nodeName}>.`);
        }

    }

    parseMaterials({children}) {
        this.materials = {};
        let res;
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "material") {
                try {
                    res = this.parseAttributes(children[i], defaultAttributes.materialAttr);
                    if (this.materials.hasOwnProperty(res.id)){
                        this.onXMLMinorError(`Material with id='${res.id}' already exists. Skipping material.`);
                        continue;
                    }
                    let childrenRes = this.parseMaterial(children[i].children);
                    let material = this.setupMaterial(this.scene, res.shininess, childrenRes);
                    this.materials[res.id] = material;
                } catch(err){
                    this.onXMLMinorError(`At material tag: ${err}`);
                    continue
                }
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
                try {
                    res[node[i].nodeName] = this.parseAttributes(node[i], defaultAttributes.rgbaAttr);
                    tags[node[i].nodeName]++;
                } catch (e) {
                    throw `At tag ${node[i].nodeName}: ${e}`;
                }
            } else this.onXMLMinorError(`Invalid material tag <${node[i].nodeName}>.`);
        }
        for(let key in tags){
            if (!tags[key]) this.onXMLMinorError(`Missing attribute ${key}. Using default values.`);
        }
        return res;
    }

    parseTransformations({children}) {

        this.transformations = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "transformation") {
                let res;
                try {
                    res = this.parseAttributes(children[i], defaultAttributes.idAttr);
                } catch(err) {
                    this.onXMLMinorError(`Invalid transformation id.`);
                    continue;
                }
                
                if (this.transformations.hasOwnProperty(res.id)) {
                     this.onXMLMinorError(`Transformation with id='${res.id}' already exists. Skipping transformation.`);
                     continue;
                }

                let childrenRes

                try {
                    childrenRes = this.parseTransformation(children[i].children);
                    this.transformations[res.id] = childrenRes;
                } catch (err) {
                    this.onXMLMinorError(`At transformation='${res.id}': ${err}`);
                }
                
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
                try {
                    let param = this.parseAttributes(child, defaults.transformationTags[child.nodeName]);
                    mat4.mul(res, res, this.getTransformationMatrix(child.nodeName, param));
                } catch(err){
                    throw `At tag <${node[i].nodeName}>: ${err}`;
                }
            } else throw `Invalid transformation type '${node[i].nodeName}'.`;

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
                let res;
                try {
                    res = this.parseAttributes(children[i], defaultAttributes.idAttr);
                } catch(err){
                    this.onXMLMinorError(`Invalid primitive id.`);
                    continue;
                }
                if (this.primitives.hasOwnProperty(res.id)) {
                    this.onXMLMinorError(`Primitive with id='${res.id}' already exists. Skipping primitive.`);
                    continue;
                }
                try {
                    let childrenRes = this.parsePrimitive(children[i].children);
                    this.primitives[res.id] = childrenRes;
                } catch (err) {
                    this.onXMLMinorError(`At primitive='${res.id}': ${err}`);
                }
            } else this.onXMLMinorError(`Invalid primitive tag <children[i].nodeName>.`);
        }

        if (Object.keys(this.primitives).length === 0) this.onXMLMinorError("There's no way you can build a scene with no primitives :(");
    }

    parsePrimitive(node) {
    
        if (node.length != 1) throw "Primitive should have one and only one tag.";

        let child = node[0];

        if (!defaults.primitiveTags.hasOwnProperty(child.nodeName)) throw `Invalid primitive tag <child.nodeName>.`;

        let res = this.parseAttributes(child, defaults.primitiveTags[child.nodeName]);
        switch (child.nodeName) {
            case "rectangle":
                return new Rectangle(this.scene, res.x1, res.y1, res.x2, res.y2);
            case "triangle":
                return new Triangle(this.scene, res.x1, res.y1, res.z1, res.x2, res.y2, res.z2, res.x3, res.y3, res.z3);
            case "sphere":
                return new Sphere(this.scene, res.radius, res.slices, res.stacks);
            case "cylinder":
                return new Cylinder(this.scene, res.base, res.top, res.height, res.slices, res.stacks);
            case "torus":
                return new Torus(this.scene, res.inner, res.outer, res.slices, res.loops);
        }

    }

    parseComponents({children}) {

        this.componentValues = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName === "component") {
                let res;
                try {
                    res = this.parseAttributes(children[i], defaultAttributes.idAttr);
                } catch(err) {
                    this.onXMLMinorError("Invalid component id.");
                    continue;
                }
                if (this.componentValues.hasOwnProperty(res.id)) {
                    this.onXMLMinorError(`Component with id='${res.id}' already exists. Skipping component`);
                    continue;
                }
                try {
                    this.componentValues[res.id] = this.parseComponent(children[i].children);
                } catch (err) {
                    this.onXMLMinorError(`At component='${res.id}': ${err}`);
                }
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
                let transf;
                try {
                    transf = this.parseAttributes(node[i], transformationTags[node[i].nodeName]);
                } catch (err){
                    this.onXMLMinorError(`Invalid transformation id.`);
                    continue;
                }
                if (node[i].nodeName === "transformationref") {
                    if (!this.transformations.hasOwnProperty(transf.id)) {
                        this.onXMLMinorError(`Transformation with id='${transf.id}' doesn't exist.`);
                        continue;
                    }
                    res.push({
                        type: "ref",
                        id: transf.id
                    });
                } else {
                    res.push({
                        type: node[i].nodeName,
                        param: transf
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
                let mat;
                try {
                    mat = this.parseAttributes(node[i], defaultAttributes.idAttr);
                } catch (err) {
                    this.onXMLMinorError(`Invalid component material id.`);
                    continue;
                }
                if (!this.materials.hasOwnProperty(mat.id) && mat.id != "inherit"){ 
                    this.onXMLMinorError(`Material with id='${mat.id}' doesn't exist.`);
                    continue;
                }
                res.push(mat.id);
            } else this.onXMLMinorError(`Invalid material tag <${node[i].nodeName}>.`);
        }

        if (res.length == 0) this.onXMLMinorError("No valid material declared. Using default material.");

        return res;
    }

    parseComponentTexture(node) {

        let res;

        try {
            res = this.parseAttributes(node, defaultAttributes.componentTextureAttr);
        } catch (err) {
            this.onXMLMinorError(`Invalid component texture: ${err}`);
            return;
        }

        if (res == null) {
            this.onXMLMinorError("No valid texture declared. Using no texture.");
            return;
        }

        if (!this.textures.hasOwnProperty(res.id) && res.id != "inherit" && res.id != "none") { 
            this.onXMLMinorError(`Invalid texture with id='${res.id}'.`);
        }

        return res;

    }

    parseComponentChildren(node) {

        node = node.children;

        let res = {};
        res.components = [];
        res.primitives = [];

        for (let i = 0; i < node.length; i++) {
            if (defaults.childrenTags.indexOf(node[i].nodeName) != -1) {
                let child;
                try {
                    child = this.parseAttributes(node[i], defaultAttributes.idAttr);
                } catch (err) {
                    this.onXMLMinorError(`Invalid component child: ${err}`);
                    continue;
                }
                if (node[i].nodeName === "primitiveref") {
                    if (!this.primitives.hasOwnProperty(child.id)) {
                        this.onXMLMinorError(`Primitive with id='${child.id}'. Discarding primitiveref.`);
                        continue;
                    }
                }
                res[node[i].nodeName.slice(0, -3) + "s"].push(child.id);
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
        console.warn("Warning: " + message);
    }


    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log(" " + message);
    }

    parseAttributes(node, attributes) {
        let res = {};
        for (let i = 0; i < attributes.length; i++) {
            let attr = attributes[i];
            res[attr.name] = this.reader[defaults.typeFunc[attr.type]](node, attr.name, false);

            if (res[attr.name] == null) {
                if (!attr.default) throw "Attribute '" + attr.name + "' missing.";
                else {
                    this.onXMLMinorError(attr.name + " attribute missing. Assuming value=" + attr.default);
                }
            } else if (isNaN(res[attr.name])) {
                if (attr.type == "float" || attr.type == "int") {
                    res[attr.name] = attr.default;
                    this.onXMLMinorError(attr.name + " attribute corrupted. Assuming value=" + attr.default);
                }
            } 
        }

        return res;
    }

    changeMaterials(){
        for (let key in this.components){
            this.components[key].nextMaterial();
        }
    }
}