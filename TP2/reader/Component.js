class Component {

    constructor(graph, scene, id, component) {
        this.graph = graph;
        this.scene = scene;
        this.id = id;
        this.componentObject = component;
        this.initTransformations();
        this.initMaterials();
        this.initTextures();
        this.initChildren();
        this.initAninmations();
    }
    /**
     * Computes component transformation matrix
     */
    initTransformations() {
        this.transformations = mat4.create();
        mat4.identity(this.transformations);
        for (let i = 0; i < this.componentObject.transformation.length; i++) {
            let transf = this.componentObject.transformation[i];
            let b = (transf.type == "ref" ?
                this.graph.transformations[transf.id] :
                this.graph.getTransformationMatrix(transf.type, transf.param));
            mat4.mul(this.transformations, this.transformations, b);
        }
    }
    /**
     * Associates materials with graph references
     */
    initMaterials() {
        this.materials = this.componentObject.materials;
        for (let i = 0; i < this.materials.length; i++) {
            if (this.materials[i] != "inherit")
                this.materials[i] = this.graph.materials[this.materials[i]];
        }
    }
    /**
     * Associates primitives ids with graph primitives
     */
    initChildren() {
        this.children = [];
        for (let i = 0; i < this.componentObject.children.primitives.length; i++) {
            this.children.push(this.graph.primitives[this.componentObject.children.primitives[i]]);
        }
    }
    /**
     * Associates textures ids with graph textures
     */
    initTextures() {
        this.texture = this.componentObject.texture;
        if (this.texture.id != "inherit" && this.texture.id != "none")
            this.texture["textureObj"] = this.graph.textures[this.texture.id];
    }
    initAninmations() {
        if (!this.componentObject.animations) return;
        this.animations = [];
        for (let i = 0; i < this.componentObject.animations.length; i++) {
            const id = this.componentObject.animations[i];
            const animationObject = this.graph.animations[id];
            if (animationObject.type === "linear"){
                this.animations.push(new LinearAnimation(this.scene, animationObject.span, animationObject.points));
            } else {
                this.animations.push(new CircularAnimation(this.scene, animationObject.span, animationObject.center, animationObject.radius, animationObject.startang, animationObject.rotang));
            }
        }
        if (this.animations.length) console.log(this.animations);
    }
    /**
     * Associates children components ids with graph components
     */
    setupChildrenComponents() {
        for (let i = 0; i < this.componentObject.children.components.length; i++) {
            this.children.push(this.graph.components[this.componentObject.children.components[i]]);
        }
    }
    /**
     * Recursive display function which calls itself on all component children
     * @param  {parent material} material
     * @param  {parent texture} texture
     */
    display(material, texture) {

        if (this.materials.length > 0) {
            if (this.materials[0] !== "inherit") material = this.materials[0];
            else {
                if (material == null) {
                    material = this.scene.defaultMaterial;
                }
            }
        }

        let originalTexCoords = {};

        if (this.texture.id === "none") {
            texture = null;
            material.setTexture(null);
        } else if (this.texture.id !== "inherit") {
            texture = this.texture;
        } else {
            if (texture != null){
                if (this.texture.hasOwnProperty("length_s"))
                    texture.length_s = this.texture.length_s;
                if (this.texture.hasOwnProperty("length_t"))
                    texture.length_t = this.texture.length_t;

            if (texture.length_s != null) originalTexCoords.s = texture.length_s;
            if (texture.length_t != null) originalTexCoords.t = texture.length_t;
            }
        }

        if (texture != null) {
            material.setTexture(texture.textureObj);

        } else {
            material.setTexture(null);
        }
        material.apply();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.transformations);
        for (let i = 0; i < this.children.length; i++) {
            if (originalTexCoords.hasOwnProperty("s")) texture.length_s = originalTexCoords.s;
            if (originalTexCoords.hasOwnProperty("t")) texture.length_t = originalTexCoords.t;
            if ((this.children[i] instanceof Rectangle || this.children[i] instanceof Triangle) && texture != null) {
                this.children[i].setTexCoords(texture.length_s, texture.length_t);

            }
            this.children[i].display(Object.assign(new CGFappearance(this.scene), material), texture);
        }
        
        this.scene.popMatrix();
    }

    /**
     * Iterates to next material
     */
    nextMaterial() {
        if (this.materials.length > 1) this.materials.push(this.materials.shift());
    }


}