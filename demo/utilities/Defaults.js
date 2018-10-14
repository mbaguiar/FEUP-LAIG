const defaultAttributes = {
    sceneAttr: [
        new Attribute ("root", "string", true),
        new Attribute ("axis_length", "float", false, 1)
        ],
    perspectiveAttr: [
        new Attribute ("id", "string", true),
        new Attribute ("near", "float", false, 0.1),
        new Attribute ("far", "float", false, 500),
        new Attribute ("angle", "float", false, 0.4)
    ],
    xyzAttr: [
        new Attribute ("x", "float", "false", 1),
        new Attribute ("y", "float", "false", 1),
        new Attribute ("z", "float", "false", 1),
    ],
    orthoAttr: [
        new Attribute ("id", "string", true),
        new Attribute ("near", "float", false, 0.1),
        new Attribute ("far", "float", false, 500),
        new Attribute ("left", "float", false, -1),
        new Attribute ("right", "float", false, 1),
        new Attribute ("top", "float", false, -1),
        new Attribute ("bottom", "float", false, 1),
    ],
    xyzwAttr: [
        new Attribute ("x", "float", "false", 1),
        new Attribute ("y", "float", "false", 1),
        new Attribute ("z", "float", "false", 1),
        new Attribute ("w", "float", "false", 1)
    ],
    rgbaAttr: [
        new Attribute ("r", "float", true),
        new Attribute ("g", "float", true),
        new Attribute ("b", "float", true),
        new Attribute ("a", "float", false, 1),
    ],
    omniAttr: [
        new Attribute ("id", "string", true),
        new Attribute ("enabled", "bool", false, true),
    ],
    spotAttr: [
        new Attribute ("id", "string", true),
        new Attribute ("enabled", "bool", false, true),
        new Attribute ("angle", "float", false, 0),
        new Attribute ("exponent", "float", false, 1)
    ],
    rectangleAttr: [
        new Attribute ("x1", "float", true),
        new Attribute ("y1", "float", true),
        new Attribute ("x2", "float", true),
        new Attribute ("y2", "float", true),
    ],
    triangleAttr: [
        new Attribute ("x1", "float", true),
        new Attribute ("y1", "float", true),
        new Attribute ("z1", "float", true),
        new Attribute ("x2", "float", true),
        new Attribute ("y2", "float", true),
        new Attribute ("z2", "float", true),
        new Attribute ("x3", "float", true),
        new Attribute ("y3", "float", true),
        new Attribute ("z3", "float", true),
    ],
    cylinderAttr: [
        new Attribute ("base", "float", true),
        new Attribute ("top", "float", true),
        new Attribute ("height", "float", true),
        new Attribute ("slices", "int", true),
        new Attribute ("stacks", "int", true),
    ],
    sphereAttr: [
        new Attribute ("radius", "float", true),
        new Attribute ("slices", "int", true),
        new Attribute ("stacks", "int", true),

    ],
    torusAttr: [
        new Attribute ("inner", "float", true),
        new Attribute ("outer", "float", true),
        new Attribute ("slices", "int", true),
        new Attribute ("loops", "int", true),
    ],
    rotateAttr: [
        new Attribute ("axis", "string", true),
        new Attribute ("angle", "float", true)
    ]
}

const defaultStyles = {
    colorStyle: ["r", "g", "b", "a"],
    vec3Style: ["x", "y", "z"],
    vec4Style: ["x", "y", "z", "w"],
};

const defaults = {
    tags: ['scene', 'views', 'ambient', 'lights', 'textures', 'materials',
            'transformations', 'primitives', 'components'],

    typeFunc: {
        int: 'getInteger',
        float: 'getFloat',
        string: 'getString',
        bool: 'getBoolean'
    },

    sceneAttrSet: new AttributeSet(defaultAttributes.sceneAttr),
    perspectiveAttrSet: new AttributeSet(defaultAttributes.perspectiveAttr),
    vec3AttrSet: new AttributeSet(defaultAttributes.xyzAttr),
    vec4AttrSet: new AttributeSet(defaultAttributes.xyzwAttr),
    orthoAttrSet: new AttributeSet(defaultAttributes.orthoAttr),
    colorAttrSet: new AttributeSet(defaultAttributes.rgbaAttr, defaultStyles.colorStyle),
    omniAttrSet: new AttributeSet(defaultAttributes.omniAttr),
    spotAttrSet: new AttributeSet(defaultAttributes.spotAttr),
    rectangleAttrSet: new AttributeSet(defaultAttributes.rectangleAttr),
    triangleAttrSet: new AttributeSet(defaultAttributes.triangleAttr),
    cylinderAttrSet: new AttributeSet(defaultAttributes.cylinderAttr),
    sphereAttrSet: new AttributeSet(defaultAttributes.sphereAttr),
    torusAttrSet: new AttributeSet(defaultAttributes.torusAttr),
    rotateAttrSet: new AttributeSet(defaultAttributes.rotateAttr),
}
