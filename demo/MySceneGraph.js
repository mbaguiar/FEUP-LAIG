
// Order of the groups in the XML document.
const tags = ['scene', 'views', 'ambient', 'lights', 'textures', 'materials',
             'transformations', 'primitives', 'components'];


function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};


class MySceneGraph {
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

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
        let error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

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

    parseScene(sceneNode){
        return null;
    }

    parseViews(viewsNode){
        return null;
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
}