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

        this.defaultViewId = this.parseAttributes(node, defaultAttributes.idAttr)["default"];

        let viewsChildren = node.children;

        if (viewsChildren.length == 0){
            this.onXMLMinorError("No views declared. Setting default view.");
            return;
        }

        let res;

        for (let i = 0; i < viewsChildren.length; i++) {
            if (viewsChildren[i].nodeName == "perspective") {
                res = this.parsePerspective(viewsChildren[i]);

            } else if (viewsChildren[i].nodeName == "ortho") {
                res = this.parseOrtho(viewsChildren[i]);
            } else throw "Invalid views tag <" + viewsChildren[i].nodeName + ">.";

            this.views[res.id] = res;

        }

        if (!this.views.hasOwnProperty(this.defaultViewId)) { 
            this.onXMLMinorError("Invalid default view. Defaulting to first view.");
            this.defaultViewId = Object.keys(this.views)[0];
        }

    }

    parsePerspective(node) {

        let res = this.parseAttributes(node, defaultAttributes.perspectiveAttr);
        res.angle = toRadian(res.angle);

        Object.assign(res, this.parseCameraChildren(node.children));

        res.type = "perspective";

        return res;

    }

    parseOrtho(node) {

        let res = this.parseAttributes(node, defaultAttributes.orthoAttr);

        Object.assign(res, this.parseCameraChildren(node.children));

        res.type = "ortho";

        return res;

    }

    parseCameraChildren(node) {

        let res = {};

        for (let i = 0; i < node.length; i++) {
            if (node[i].nodeName == "from") {
                res["from"] = this.parseAttributes(node[i], defaultAttributes.xyzAttr);
            } else if (node[i].nodeName == "to") {
                res["to"] = this.parseAttributes(node[i], defaultAttributes.xyzAttr);
            }
        }

        return res;

    }

    parseAmbient(node) {

        let ambientChildren = node.children;

        let res = {};

        for (let i = 0; i < ambientChildren.length; i++) {
            if (ambientChildren[i].nodeName == "ambient") {
                res["ambient"] = this.parseAttributes(ambientChildren[i], defaultAttributes.rgbaAttr);
            } else if (ambientChildren[i].nodeName == "background") {
                res["background"] = this.parseAttributes(ambientChildren[i], defaultAttributes.rgbaAttr);
            }
        }

        this.ambient = res;

    }

    parseLights(node) {
        let lightsChildren = node.children;

        let res = {};

        for (let i = 0; i < lightsChildren.length; i++) {

            let light = lightsChildren[i];

            if (light.nodeName != "omni" && light.nodeName != "spot") throw "Invalid light type.";

            let attr = defaultAttributes[light.nodeName + "Attr"];

            let lightRes = this.parseAttributes(light, attr);

            if (res.hasOwnProperty(lightRes.id)) {
                let newId = lightRes.id + "(1)";
                this.onXMLMinorError("Light with id='" + lightRes.id + "' already exists." +
                                    "Renaming it to " + newId + ".");
                lightRes.id = newId;
            }

            res[lightRes.id] = {
                enabled: lightRes.enabled,
                type: light.nodeName,
                properties: this.parseLightsChildren(light),
            }

            if (light.nodeName == "spot") {
                res[lightRes.id].angle = lightRes.angle;
                res[lightRes.id].exponent = lightRes.exponent;
            }

        }

        this.lights = res;

    }

    parseLightsChildren(node) {

        let children = node.children;

        let lightsTags = [{
                name: "location",
                attr: defaultAttributes.xyzwAttr
            },
            {
                name: "ambient",
                attr: defaultAttributes.rgbaAttr
            },
            {
                name: "diffuse",
                attr: defaultAttributes.rgbaAttr
            },
            {
                name: "specular",
                attr: defaultAttributes.rgbaAttr
            }
        ];

        let res = {};

        if (node.nodeName == "spot") {
            lightsTags.push({
                name: "target",
                attr: defaultAttributes.xyzAttr
            });
        }

        for (let i = 0; i < children.length; i++) {
            for (let j = 0; j < lightsTags.length; j++) {
                let child = children[i];
                if (child.nodeName == lightsTags[j].name) {
                    res[child.nodeName] = this.parseAttributes(child, lightsTags[j].attr);
                }
            }
        }

        return res;

    }

    parseTextures(node) {

        let children = node.children;

        this.textures = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "texture") {
                let res = this.parseAttributes(children[i], defaultAttributes.textureAttr);
                if (this.textures.hasOwnProperty(res.id)) throw "Texture with id='" + res.id + "' already exists.";
                this.textures[res.id] = new CGFtexture(this.scene, res.file);
            } else throw "Invalid texture tag '" + children[i].nodeName + "'.";
        }

    }

    parseMaterials(node) {

        let children = node.children;

        this.materials = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "material") {
                let res = this.parseAttributes(children[i], defaultAttributes.materialAttr);
                if (this.materials.hasOwnProperty(res.id)) throw "Material with id='" + res.id + "' already exists.";
                let childrenRes = this.parseMaterial(children[i].children);
                let material = new CGFappearance(this.scene);
                material.setShininess(res.shininess);
                material.setEmission(childrenRes.emission.r, childrenRes.emission.g, childrenRes.emission.b, childrenRes.emission.a);
                material.setAmbient(childrenRes.ambient.r, childrenRes.ambient.g, childrenRes.ambient.b, childrenRes.ambient.a);
                material.setDiffuse(childrenRes.diffuse.r, childrenRes.diffuse.g, childrenRes.diffuse.b, childrenRes.diffuse.a);
                material.setSpecular(childrenRes.specular.r, childrenRes.specular.g, childrenRes.specular.b, childrenRes.specular.a);
                this.materials[res.id] = material;
            } else throw "Invalid material tag '" + children[i].nodeName + "'.";
        }
    }

    parseMaterial(node) {
        let res = {};

        for (let i = 0; i < node.length; i++) {
            for (let j = 0; j < defaults.materialTags.length; j++) {
                let child = node[i];
                if (child.nodeName == defaults.materialTags[j]) {
                    res[child.nodeName] = this.parseAttributes(child, defaultAttributes.rgbaAttr);
                }
            }
        }

        return res;
    }

    parseTransformations(node) {

        let children = node.children;

        this.transformations = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "transformation") {
                let res = this.parseAttributes(children[i], defaultAttributes.idAttr);
                if (this.transformations.hasOwnProperty(res.id)) throw "Transformation with id='" + res.id + "' already exists.";
                let childrenRes = this.parseTransformation(children[i].children);
                this.transformations[res.id] = childrenRes;
            } else throw "Invalid transformation tag '" + children[i].nodeName + "'.";
        }
    }

    parseTransformation(node) {

        let res = mat4.create();
        mat4.identity(res);

        for (let i = 0; i < node.length; i++) {
            if (defaults.transformationTags.hasOwnProperty(node[i].nodeName)) {
                let child = node[i];
                let param = this.parseAttributes(child, defaults.transformationTags[child.nodeName]);
                mat4.mul(res, res, this.getTransformationMatrix(child.nodeName, param));
            } else throw "Invalid transformation type '" + node[i].nodeName + "'.";

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

    parsePrimitives(node) {
        let children = node.children;

        this.primitives = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "primitive") {
                let res = this.parseAttributes(children[i], defaultAttributes.idAttr);
                if (this.primitives.hasOwnProperty(res.id)) throw "Primitive with id='" + res.id + "' already exists.";
                let childrenRes = this.parsePrimitive(children[i].children);
                this.primitives[res.id] = childrenRes;
            } else throw "Invalid primitive tag '" + children[i].nodeName + "'.";
        }
    }

    parsePrimitive(node) {
    
        if (node.length != 1) throw "Primitive should have one and only one tag.";

        let child = node[0];

        if (!defaults.primitiveTags.hasOwnProperty(child.nodeName)) throw "Invalid primitive tag '" + child.nodeName + "'.";

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

    parseComponents(node) {
        let children = node.children;

        this.componentValues = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "component") {
                let res = this.parseAttributes(children[i], defaultAttributes.idAttr);
                if (this.componentValues.hasOwnProperty(res.id)) throw "Component with id='" + res.id + "' already exists.";
                this.componentValues[res.id] = this.parseComponent(children[i].children);
            } else throw "Invalid component tag '" + children[i].nodeName + "'.";
        }

        this.components = {};

        for (let key in this.componentValues) {
            let currComponent = this.componentValues[key];
            for (let i = 0; i < currComponent.children.components.length; i++) {
                let id = currComponent.children.components[i];
                if (!this.componentValues.hasOwnProperty(id)) throw "Invalid componentref='" + id + "'.";
            }
            this.components[key] = new Component(this, this.scene, key, currComponent);
        }

        for (let key in this.components) {
            this.components[key].setupChildrenComponents();
        }


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
            transformationref: [new Attribute("id", "string", true)]
        };

        Object.assign(transformationTags, defaults.transformationTags);

        let res = [];

        for (let i = 0; i < node.length; i++) {
            if (transformationTags.hasOwnProperty(node[i].nodeName)) {
                let transf = this.parseAttributes(node[i], transformationTags[node[i].nodeName]);
                if (node[i].nodeName == "transformationref") {
                    if (!this.transformations.hasOwnProperty(transf.id)) throw "Transformation with id='" + transf.id + "' doesn't exist.";
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
            } else throw "Invalid tag '" + node[i].nodeName + "'.";
        }
        return res;

    }

    parseComponentMaterials(node) {

        node = node.children;

        let res = [];

        for (let i = 0; i < node.length; i++) {
            if (node[i].nodeName == "material") {
                let mat = this.parseAttributes(node[i], defaultAttributes.idAttr);
                if (!this.materials.hasOwnProperty(mat.id) && mat.id != "inherit") throw "Material with id='" + mat.id + "' doesn't exist.";
                res.push(mat.id);
            } else throw "Invalid tag '" + node[i].nodeName + "'.";
        }

        return res;
    }

    parseComponentTexture(node) {

        let res = this.parseAttributes(node, defaultAttributes.componentTextureAttr);

        if (!this.textures.hasOwnProperty(res.id) && res.id != "inherit" && res.id != "none") throw "Invalid texture id.";

        return res;

    }

    parseComponentChildren(node) {

        node = node.children;

        let res = {};
        res.components = [];
        res.primitives = [];

        for (let i = 0; i < node.length; i++) {
            if (defaults.childrenTags.indexOf(node[i].nodeName) != -1) {
                let child = this.parseAttributes(node[i], defaultAttributes.idAttr);
                if (node[i].nodeName == "primitiveref") {
                    if (!this.primitives.hasOwnProperty(child.id)) throw "Invalid primitive id.";
                }
                res[node[i].nodeName.slice(0, -3) + "s"].push(child.id);
            } else throw "Invlaid tag '" + node[i].nodeName + "'.";
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

            /* if (res[attr.name] == null) {
                if (attr.required) throw "Attribute '" + attr.name + "' missing.";
                else {
                    this.onXMLMinorError(attr.name + " attribute missing. Assuming value=" + attr.default);
                }
            } else if (isNaN(res[attr.name])) {
                if (attr.type == "float" || attr.type == "int") {
                    res[attr.name] = attr.default;
                    this.onXMLMinorError(attr.name + " attribute corrupted. Assuming value=" + attr.default);
                }
            } */
        }

        return res;
    }

    changeMaterials(){
        for (let key in this.components){
            this.components[key].nextMaterial();
        }
    }
}