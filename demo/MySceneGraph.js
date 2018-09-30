
// Order of the groups in the XML document.
const tags = ['scene', 'views', 'ambient', 'lights', 'textures', 'materials',
             'transformations', 'primitives', 'components'];

const typeFunc = {
    int: 'getInteger',
    float: 'getFloat',
    string: 'getString',
};

function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};


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

        /* let error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        } */

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        
        //TODO after parsing
        //this.scene.onGraphLoaded();
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

        for (let i = 0; i < tags.length; i++){
            let index;
            if ((index = nodeNames.indexOf(tags[i])) == -1)
                return "tag <" + tags[i] + "> missing";
            else {
                if (index != i)
                    this.onXMLMinorError("tag <" + tags[i] + "> out of order");
            }

            let funcName = 'parse'+ jsUcfirst(tags[i]);

            if ((error = this[funcName](nodes[index])) != null)
                return error;
        }

    }

    parseScene(node){
        /* if ((this.idRoot = this.reader.getString(sceneNode, "root", false)) == null){
            return "root attribute missing";
        }

        if ((this.axisLength = this.reader.getFloat(sceneNode, "axis_length", false)) == null){
            this.axisLength = 1;
            this.onXMLMinorError("axis_length attribute missing. assuming 'value=1'");
        } */

        let sceneAttributes = [
            this.newAttribute("root", "string", true),
            this.newAttribute("axis_length", "float", false, 1)
        ];

        let res = this.parseAttributes(node, sceneAttributes);
        this.idRoot = res.root;
        this.axisLength = res.axis_length;
    }

    parseViews(node){

        /* if (this.reader.getString(viewsNode, "default", false) == null){
            //TODO: what to do here?
            this.onXMLMinorError("default attribute missing");
        } 

        let viewChildrenNames = [];

        for (let i = 0; i < viewsChildren.length; i++){
            viewChildrenNames.push(viewsChildren[i].nodeName);
        }

        if (viewChildrenNames.indexOf("perspective") == -1 && 
            viewChildrenNames.indexOf("ortho") == -1){
                return "missing required view (perspective or ortho)";
        } */

        let res = this.parseAttributes(node, [this.newAttribute("default", "string", true)]);

        let viewsChildren = node.children;

        let childrenRes = [];

        for (let i = 0; i < viewsChildren.length; i++){
            if (viewsChildren[i].nodeName == "perspective"){
                childrenRes.push(this.parsePerspective(viewsChildren[i]));
            } else if (viewsChildren[i].nodeName == "ortho"){
                childrenRes.push(this.parseOrtho(viewsChildren[i]));
            }
        }

    }

    parsePerspective(node){

        const perspectiveAttributes = [
            this.newAttribute("id", "string", true),
            this.newAttribute("near", "float", false, 0.1),
            this.newAttribute("far", "float", false, 500),
            this.newAttribute("angle", "float", false, 0)
        ];

        const xyzAttrs = [
            this.newAttribute("x", "float", "false", 1),
            this.newAttribute("y", "float", "false", 1),
            this.newAttribute("z", "float", "false", 1),
        ];

        let res = this.parseAttributes(node, perspectiveAttributes);

        let perspectiveChildren = node.children;
        let perspectiveChildrenRes = {};

        for(let i = 0; i < perspectiveChildren.length; i++){
            if (perspectiveChildren[i].nodeName == "from"){
                perspectiveChildrenRes["from"] = this.parseAttributes(perspectiveChildren[i], xyzAttrs);
            } else if (perspectiveChildren[i].nodeName == "to"){
                perspectiveChildrenRes["to"] = this.parseAttributes(perspectiveChildren[i], xyzAttrs);
            }
        }

        console.log(perspectiveChildrenRes);

    }

    parseOrtho(node){
        
        const orthoAttributes = [
            this.newAttribute("id", "string", true),
            this.newAttribute("near", "float", false, 0.1),
            this.newAttribute("far", "float", false, 500),
            this.newAttribute("left", "float", false, -1),
            this.newAttribute("right", "float", false, 1),
            this.newAttribute("top", "float", false, -1),
            this.newAttribute("bottom", "float", false, 1),
        ];

        let res = this.parseAttributes(node, orthoAttributes);

        console.log(res);

    }

    parseAmbient(ambientNode){
        return null;
    }

    parseLights(lightsNode){
        return null;
    }

    parseTextures(texturesNode){
        return null;
    }

    parseMaterials(materialsNode){
        return null;
    }

    parseTransformations(transformationsNode){
        return null;
    }

    parsePrimitives(primitivesNode){
        return null;
    }

    parseComponents(componentsNode){
        return null;
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

    parseAttributes(node, attributes){
        let res = {};
        for (let i = 0; i < attributes.length; i++){
            let attr = attributes[i];
            res[attr.name] = this.reader[typeFunc[attr.type]](node, attr.name, false);

            if (res[attr.name] == null){
                if (attr.required) throw "Attribute '" + attr.name + "' missing.";
                else {
                    
                    this.onXMLMinorError(attr.name + " attribute missing. Assuming value=" + attr.default);
                }
            } else if (isNaN(res[attr.name])){
                if (attr.type == "float" || attr.type == "int"){
                    res[attr.name] = attr.default;
                    this.onXMLMinorError(attr.name + " attribute corrupted. Assuming value=" + attr.default);
                }
            }
        }
        return res;
    }

    newAttribute(name, type, required, def){
        let newAttr = {
            name: name, 
            type: type,
            required: required,
            default: def 
        };

        return newAttr;
    }
}