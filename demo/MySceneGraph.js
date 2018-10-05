
// Order of the groups in the XML document.


function jsUcfirst(string) {
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

        this.idRoot = null;                    // The id of the root element.
        this.axisLength = 1;                   // Axis length

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        //Constants
        this.tags = ['scene', 'views', 'ambient', 'lights', 'textures', 'materials',
            'transformations', 'primitives', 'components'];

        this.typeFunc = {
            int: 'getInteger',
            float: 'getFloat',
            string: 'getString',
            bool: 'getBoolean'
        };

        this.sceneAttr = [
            this.newAttribute("root", "string", true),
            this.newAttribute("axis_length", "float", false, 1)
        ];

        this.perspectiveAttr = [
            this.newAttribute("id", "string", true),
            this.newAttribute("near", "float", false, 0.1),
            this.newAttribute("far", "float", false, 500),
            this.newAttribute("angle", "float", false, 0.4)
        ];

        this.xyzAttr = [
            this.newAttribute("x", "float", "false", 1),
            this.newAttribute("y", "float", "false", 1),
            this.newAttribute("z", "float", "false", 1),
        ];

        this.orthoAttr = [
            this.newAttribute("id", "string", true),
            this.newAttribute("near", "float", false, 0.1),
            this.newAttribute("far", "float", false, 500),
            this.newAttribute("left", "float", false, -1),
            this.newAttribute("right", "float", false, 1),
            this.newAttribute("top", "float", false, -1),
            this.newAttribute("bottom", "float", false, 1),
        ];

        this.xyzwAttr = [
            ...this.xyzAttr,
            this.newAttribute("w", "float", "false", 1)
        ];

        this.rgbaAttr = [
            this.newAttribute("r", "float", true),
            this.newAttribute("g", "float", true),
            this.newAttribute("b", "float", true),
            this.newAttribute("a", "float", false, 1),
        ];

        this.omniAttr = [
            this.newAttribute("id", "string", true),
            this.newAttribute("enabled", "bool", false, true),
        ];

        this.spotAttr = [
            ...this.omniAttr,
            this.newAttribute("angle", "float", false, 0),
            this.newAttribute("exponent", "float", false, 1)
        ];

        this.rectangleAttr = [
            this.newAttribute("x1", "float", true),
            this.newAttribute("y1", "float", true),
            this.newAttribute("x2", "float", true),
            this.newAttribute("y2", "float", true),
        ];

        this.triangleAttr = [
            this.newAttribute("x1", "float", true),
            this.newAttribute("y1", "float", true),
            this.newAttribute("z1", "float", true),
            this.newAttribute("x2", "float", true),
            this.newAttribute("y2", "float", true),
            this.newAttribute("z2", "float", true),
            this.newAttribute("x3", "float", true),
            this.newAttribute("y3", "float", true),
            this.newAttribute("z3", "float", true),
        ];

        this.cylinderAttr = [
            this.newAttribute("base", "float", true),
            this.newAttribute("top", "float", true),
            this.newAttribute("height", "float", true),
            this.newAttribute("slices", "int", true),
            this.newAttribute("stacks", "int", true),
        ];

        this.sphereAttr = [
            this.newAttribute("radius", "float", true),
            this.newAttribute("slices", "int", true),
            this.newAttribute("stacks", "int", true),

        ];

        this.torusAttr = [
            this.newAttribute("inner", "float", true),
            this.newAttribute("outer", "float", true),
            this.newAttribute("slices", "int", true),
            this.newAttribute("loops", "int", true),
        ];

        this.rotateAttr = [
            this.newAttribute("axis", "string", true),
            this.newAttribute("angle", "float", true)
        ];

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

        //TODO after parsing
        this.scene.onGraphLoaded();
    }

    parseXMLFile(rootElement) {

        if (rootElement.nodeName != "yas")
            return "root tag <yas> missing";

        let nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        let nodeNames = [];

        for (let i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        let error;

        // Processes each node, verifying errors.

        for (let i = 0; i < this.tags.length; i++) {
            let index;
            if ((index = nodeNames.indexOf(this.tags[i])) == -1)
                return "tag <" + this.tags[i] + "> missing";
            else {
                if (index != i)
                    this.onXMLMinorError("tag <" + this.tags[i] + "> out of order");
            }

            let funcName = 'parse' + jsUcfirst(this.tags[i]);

            if ((error = this[funcName](nodes[index])) != null)
                return error;
        }

    }

    parseScene(node) {
        let res = this.parseAttributes(node, this.sceneAttr);
        this.idRoot = res.root;
        this.axisLength = res.axis_length;
    }

    parseViews(node) {
        this.views = {};

        this.views = this.parseAttributes(node, [this.newAttribute("default", "string", true)]);

        let viewsChildren = node.children;

        let childrenRes = [];

        for (let i = 0; i < viewsChildren.length; i++) {
            if (viewsChildren[i].nodeName == "perspective") {
                childrenRes.push({
                    type: "perspective",
                    attr: this.parsePerspective(viewsChildren[i])
                });
            } else if (viewsChildren[i].nodeName == "ortho") {
                childrenRes.push({
                    type: "ortho",
                    attr: this.parseOrtho(viewsChildren[i])
                });
            }
        }

        this.views.children = childrenRes;
    }

    parsePerspective(node) {

        let res = this.parseAttributes(node, this.perspectiveAttr);

        let perspectiveChildren = node.children;
        let perspectiveChildrenRes = {};

        for (let i = 0; i < perspectiveChildren.length; i++) {
            if (perspectiveChildren[i].nodeName == "from") {
                perspectiveChildrenRes["from"] = this.parseAttributes(perspectiveChildren[i], this.xyzAttr);
            } else if (perspectiveChildren[i].nodeName == "to") {
                perspectiveChildrenRes["to"] = this.parseAttributes(perspectiveChildren[i], this.xyzAttr);
            }
        }

        res.attr = perspectiveChildrenRes;

        return res;

    }

    parseOrtho(node) {

        let res = this.parseAttributes(node, this.orthoAttr);

        return res;

    }

    parseAmbient(node) {

        let ambientChildren = node.children;

        let res = {};

        for (let i = 0; i < ambientChildren.length; i++) {
            if (ambientChildren[i].nodeName == "ambient") {
                res["ambient"] = this.parseAttributes(ambientChildren[i], this.rgbaAttr);
            } else if (ambientChildren[i].nodeName == "background") {
                res["background"] = this.parseAttributes(ambientChildren[i], this.rgbaAttr);
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

            let attr = this[light.nodeName + "Attr"];

            let lightRes = this.parseAttributes(light, attr);

            if (res.hasOwnProperty(lightRes.id)) throw "Light with id='" + lightRes.id + "' already exists.";

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

        let lightsTags = [
            { name: "location", attr: this.xyzwAttr },
            { name: "ambient", attr: this.rgbaAttr },
            { name: "diffuse", attr: this.rgbaAttr },
            { name: "specular", attr: this.rgbaAttr }
        ];

        let res = {};

        if (node.nodeName == "spot") {
            lightsTags.push({ name: "target", attr: this.xyzAttr });
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

        const textureAttr = [
            this.newAttribute("id", "string", true),
            this.newAttribute("file", "string", true)
        ];

        this.textures = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "texture") {
                let res = this.parseAttributes(children[i], textureAttr);
                if (this.textures.hasOwnProperty(res.id)) throw "Texture with id='" + res.id + "' already exists.";
                this.textures[res.id] = new CGFtexture(this.scene, res.file);
            } else throw "Invalid texture tag '" + children[i].nodeName + "'.";
        }

    }

    parseMaterials(node) {

        let children = node.children;

        this.materials = {};

        const materialAttr = [
            this.newAttribute("id", "string", true),
            this.newAttribute("shininess", "float", false, 1)
        ];

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "material") {
                let res = this.parseAttributes(children[i], materialAttr);
                if (this.materials.hasOwnProperty(res.id)) throw "Material with id='" + res.id + "' already exists.";
                let childrenRes = this.parseMaterial(children[i].children);
                this.materials[res.id] = Object.assign({ shininess: res.shininess }, childrenRes);
            } else throw "Invalid material tag '" + children[i].nodeName + "'.";
        }

    }

    parseMaterial(node) {

        const materialTags = [
            "emission", "ambient", "diffuse", "specular"
        ];

        let res = {};

        for (let i = 0; i < node.length; i++) {
            for (let j = 0; j < materialTags.length; j++) {
                let child = node[i];
                if (child.nodeName == materialTags[j]) {
                    res[child.nodeName] = this.parseAttributes(child, this.rgbaAttr);
                }
            }
        }

        return res;
    }

    parseTransformations(node) {

        let children = node.children;

        const transformationAttr = [
            this.newAttribute("id", "string", true),
        ];

        this.transformations = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "transformation") {
                let res = this.parseAttributes(children[i], transformationAttr);
                if (this.transformations.hasOwnProperty(res.id)) throw "Transformation with id='" + res.id + "' already exists.";
                let childrenRes = this.parseTransformation(children[i].children);
                this.transformations[res.id] = childrenRes;
            } else throw "Invalid transformation tag '" + children[i].nodeName + "'.";
        }
    }

    parseTransformation(node) {

        const transformationTags = {
            translate: this.xyzAttr,
            rotate: this.rotateAttr,
            scale: this.xyzAttr
        };

        const axis = {
            x: vec3.fromValues(1, 0, 0),
            y: vec3.fromValues(0, 1, 0),
            z: vec3.fromValues(0, 0, 1),
        };

        let res = mat4.create();



        for (let i = 0; i < node.length; i++) {
            if (transformationTags.hasOwnProperty(node[i].nodeName)) {
                let child = node[i];
                let param = this.parseAttributes(child, transformationTags[child.nodeName]);
                switch (child.nodeName) {
                    case "rotate":
                        mat4.rotate(res, res, toRadian(param.angle), axis[param.axis]);
                        break;
                    case "translate":
                        mat4.translate(res, res, Object.values(param));
                        break;
                    case "scale":
                        mat4.scale(res, res, Object.values(param));
                        break;
                }
            } else throw "Invalid transformation type '" + node[i].nodeName + "'.";

        }
        return res;
    }

    parsePrimitives(node) {
        let children = node.children;

        const primitiveAttr = [
            this.newAttribute("id", "string", true),
        ];

        this.primitives = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "primitive") {
                let res = this.parseAttributes(children[i], primitiveAttr);
                if (this.primitives.hasOwnProperty(res.id)) throw "Primitive with id='" + res.id + "' already exists.";
                let childrenRes = this.parsePrimitive(children[i].children);
                this.primitives[res.id] = childrenRes; 
            } else throw "Invalid primitive tag '" + children[i].nodeName + "'.";
        }
    }

    parsePrimitive(node) {
        const primitiveTags = {
            rectangle: this.rectangleAttr,
            triangle: this.triangleAttr,
            cylinder: this.cylinderAttr,
            sphere: this.sphereAttr,
            torus: this.torusAttr,
        };
        
        
        
        if (node.length != 1) throw "Primitive should have one and only one tag.";
        
        let child = node[0];

        if (!primitiveTags.hasOwnProperty(child.nodeName)) throw "Invalid primitive tag '" + child.nodeName + "'.";
        
        let res = this.parseAttributes(child, primitiveTags[child.nodeName]);
        switch(child.nodeName){
            case "rectangle":
                return new Rectangle(this.scene, res.x1, res.y1, res.x2, res.y2);
            case "triangle":
                return new Triangle(this.scene, res.x1, res.y1, res.z1, res.x2, res.y2, res.z2, res.x3, res.y3, res.z3);
        }

    }

    parseComponents(node) {
        let children = node.children;

        const componentAttr = [
            this.newAttribute("id", "string", true),
        ];

        let res = [];

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "component") {
                res.push(this.parseAttributes(children[i], componentAttr));
                this.parseComponent(children[i].children);
            }
        }
    }

    parseComponent(node) {

        const componentTags = [
            "transformation", "materials", "texture", "children"
        ];

        for (let i = 0; i < node.length; i++) {
            for (let j = 0; j < componentTags.length; j++) {
                if (node[i].nodeName == componentTags[j]) {
                    this["parseComponent" + jsUcfirst(componentTags[j])](node[i]);
                }
            }
        }
    }

    parseComponentTransformation(node) {

        node = node.children;

        const transformationTags = [
            { name: "transformationref", attr: [this.newAttribute("id", "string", true)] },
            { name: "translate", attr: this.xyzAttr },
            { name: "rotate", attr: this.rotateAttr },
            { name: "scale", attr: this.xyzAttr }
        ];

        let res = [];

        for (let i = 0; i < node.length; i++) {
            for (let j = 0; j < transformationTags.length; j++) {
                if (node[i].nodeName == transformationTags[j].name)
                    res.push({
                        name: node[i].nodeName,
                        attr: this.parseAttributes(node[i], transformationTags[j].attr)
                    });

            }
        }

    }

    parseComponentMaterials(node) {

        node = node.children;

        let res = [];

        for (let i = 0; i < node.length; i++) {
            if (node[i].nodeName == "material") {
                res.push(this.parseAttributes(node[i], [this.newAttribute("id", "string", true)]));
            }
        }

    }

    parseComponentTexture(node) {

        let res = this.parseAttributes(node, [
            this.newAttribute("id", "string", true),
            this.newAttribute("length_s", "float", true),
            this.newAttribute("length_t", "float", true)
        ]);

    }

    parseComponentChildren(node) {

        node = node.children;

        const childrenTags = [
            "componentref", "primitiveref"
        ];

        let res = [];

        for (let i = 0; i < node.length; i++) {
            for (let j = 0; j < childrenTags.length; j++) {
                if (node[i].nodeName == childrenTags[j]) {
                    res.push(
                        {
                            type: node[i].nodeName.slice(0, -3),
                            attr: this.parseAttributes(node[i], [this.newAttribute("id", "string", true)])
                        }
                    );
                }
            }
        }
    }

    displayScene(){
        for (let key in this.primitives){
            this.primitives[key].display();
        }
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
        console.log("   " + message);
    }

    parseAttributes(node, attributes) {
        let res = {};
        for (let i = 0; i < attributes.length; i++) {
            let attr = attributes[i];
            res[attr.name] = this.reader[this.typeFunc[attr.type]](node, attr.name, false);

            if (res[attr.name] == null) {
                if (attr.required) throw "Attribute '" + attr.name + "' missing.";
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


    newAttribute(name, type, required, def) {
        let newAttr = {
            name: name,
            type: type,
            required: required,
            default: def
        };

        return newAttr;
    }
}