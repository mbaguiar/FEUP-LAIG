

class Component {

    constructor(graph, scene, id, component){
        this.graph = graph;
        this.scene = scene;
        this.id = id;
        this.componentObject = component;
        this.initTransformations();
        this.initMaterials();
        this.initChildren();
    }

    initTransformations(){
        this.transformations = mat4.create();
        mat4.identity(this.transformations);
        for (let i = 0; i < this.componentObject.transformation.length; i++){
            let transf = this.componentObject.transformation[i];
            let b = (transf.type == "ref"? 
            this.graph.transformations[transf.id] : 
            this.graph.getTransformationMatrix(transf.type, transf.param));
            mat4.mul(this.transformations, this.transformations, b);   
        }
    }

    initMaterials(){
        this.materials = this.componentObject.materials;
        for (let i = 0; i < this.materials.length; i++){
            if (this.materials[i] != "inherit")
                this.materials[i] = this.graph.materials[this.materials[i]];
        }
    }

    initChildren(){
        this.children = [];
        for (let i = 0; i < this.componentObject.children.primitives.length; i++){
            this.children.push(this.graph.primitives[this.componentObject.children.primitives[i]]);
        }
    }

    setupChildrenComponents(){
        for (let i = 0; i < this.componentObject.children.components.length; i++){
            this.children.push(this.graph.components[this.componentObject.children.components[i]]);
        }
    }

    display(material, texture){
        this.scene.pushMatrix();
            this.scene.multMatrix(this.transformations);
            for (let i = 0; i < this.children.length; i++){
                this.children[i].display();
            }
        this.scene.popMatrix();
    }


}