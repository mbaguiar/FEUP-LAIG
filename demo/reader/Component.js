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
    }

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

    initMaterials() {
        this.materials = this.componentObject.materials;
        for (let i = 0; i < this.materials.length; i++) {
            if (this.materials[i] != "inherit")
                this.materials[i] = this.graph.materials[this.materials[i]];
        }
    }

    initChildren() {
        this.children = [];
        for (let i = 0; i < this.componentObject.children.primitives.length; i++) {
            this.children.push(this.graph.primitives[this.componentObject.children.primitives[i]]);
        }
    }

    initTextures() {
        this.texture = this.componentObject.texture;
        if (this.texture.id != "inherit" && this.texture.id != "none")
            this.texture["textureObj"] = this.graph.textures[this.texture.id];
    }

    setupChildrenComponents() {
        for (let i = 0; i < this.componentObject.children.components.length; i++) {
            this.children.push(this.graph.components[this.componentObject.children.components[i]]);
        }
    }

    display(material, texture) {
        if (this.materials.length > 0) {
            if (this.materials[0] !== "inherit") material = this.materials[0];
            else {
                if (material == null) {
                    material = this.scene.defaultMaterial;
                }
            }
        }

        if (this.texture.id == "none") {
            texture = null;
            material.setTexture(null);
        } else if (this.texture.id != "inherit")
            texture = this.texture;

        if (texture != null) {
            material.setTexture(texture.textureObj);

        } else {
            material.setTexture(null);
        }
        material.apply();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.transformations);
        for (let i = 0; i < this.children.length; i++) {
            //TODO: find better alternative
            if ((this.children[i] instanceof Rectangle || this.children[i] instanceof Triangle) && texture != null) {
                this.children[i].setTexCoords(texture.length_s, texture.length_t);

            }
            this.children[i].display(Object.assign(new CGFappearance(this.scene), material), texture);
        }
        this.scene.popMatrix();
    }

    nextMaterial() {
        if (this.materials.length > 1) this.materials.push(this.materials.shift());
    }


}