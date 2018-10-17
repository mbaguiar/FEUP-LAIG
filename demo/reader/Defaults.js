const defaultAttributes = {
	idAttr: [
		new Attribute ("id", "string")
	],
    sceneAttr: [
        new Attribute ("root", "string"),
        new Attribute ("axis_length", "float", 1)
		],
	viewsAttr: [
		new Attribute ("default", "string")
	],
    perspectiveAttr: [
        new Attribute ("id", "string"),
        new Attribute ("near", "float", 0.1),
        new Attribute ("far", "float", 500),
        new Attribute ("angle", "float", 0.4)
    ],
    xyzAttr: [
        new Attribute ("x", "float"),
        new Attribute ("y", "float"),
        new Attribute ("z", "float"),
    ],
    orthoAttr: [
        new Attribute ("id", "string"),
        new Attribute ("near", "float", 0.1),
        new Attribute ("far", "float", 500),
        new Attribute ("left", "float"),
        new Attribute ("right", "float"),
        new Attribute ("top", "float"),
        new Attribute ("bottom", "float"),
    ],
    xyzwAttr: [
        new Attribute ("x", "float"),
        new Attribute ("y", "float"),
        new Attribute ("z", "float"),
        new Attribute ("w", "float", 1)
    ],
    rgbaAttr: [
        (new Attribute ("r", "float")).addRangeRestriction(0, 1),
        (new Attribute ("g", "float")).addRangeRestriction(0, 1),
        (new Attribute ("b", "float")).addRangeRestriction(0, 1),
        (new Attribute ("a", "float", 1)).addRangeRestriction(0, 1),
    ],
    omniAttr: [
        new Attribute ("id", "string"),
        new Attribute ("enabled", "bool", true),
    ],
    spotAttr: [
        new Attribute ("id", "string"),
        new Attribute ("enabled", "bool", true),
        new Attribute ("angle", "float", 0.4),
        new Attribute ("exponent", "float", 1)
	],
	textureAttr: [
		new Attribute ("id", "string"),
		new Attribute ("file", "string")
	],
	materialAttr: [
		new Attribute ("id", "string"),
		new Attribute ("shininess", "float", 1)
	],
    rectangleAttr: [
        new Attribute ("x1", "float"),
        new Attribute ("y1", "float"),
        new Attribute ("x2", "float"),
        new Attribute ("y2", "float"),
    ],
    triangleAttr: [
        new Attribute ("x1", "float"),
        new Attribute ("y1", "float"),
        new Attribute ("z1", "float"),
        new Attribute ("x2", "float"),
        new Attribute ("y2", "float"),
        new Attribute ("z2", "float"),
        new Attribute ("x3", "float"),
        new Attribute ("y3", "float"),
        new Attribute ("z3", "float"),
    ],
    cylinderAttr: [
        new Attribute ("base", "float"),
        new Attribute ("top", "float"),
        new Attribute ("height", "float"),
        new Attribute ("slices", "int"),
        new Attribute ("stacks", "int"),
    ],
    sphereAttr: [
        new Attribute ("radius", "float"),
        new Attribute ("slices", "int"),
        new Attribute ("stacks", "int"),

    ],
    torusAttr: [
        new Attribute ("inner", "float"),
        new Attribute ("outer", "float"),
        new Attribute ("slices", "int"),
        new Attribute ("loops", "int"),
    ],
    rotateAttr: [
        new Attribute ("axis", "string"),
        new Attribute ("angle", "float")
	],
	componentTextureAttr: [
		new Attribute ("id", "string"),
		new Attribute ("length_s", "float", 1),
		new Attribute ("length_t", "float", 1)
	]
}

const defaults = {
    rootTags: ['scene', 'views', 'ambient', 'lights', 'textures', 'materials',
			'transformations', 'primitives', 'components'
	],
	materialTags: {
		emission: 0,
		ambient: 0,
		diffuse: 0,
		specular: 0,
	},
	transformationTags: {
		translate: defaultAttributes.xyzAttr,
		rotate: defaultAttributes.rotateAttr,
		scale: defaultAttributes.xyzAttr
	},
	axis: {
		x: [1, 0, 0],
		y: [0, 1, 0],
		z: [0, 0, 1],
	},
	primitiveTags: {
		rectangle: defaultAttributes.rectangleAttr,
		triangle: defaultAttributes.triangleAttr,
		cylinder: defaultAttributes.cylinderAttr,
		sphere: defaultAttributes.sphereAttr,
		torus: defaultAttributes.torusAttr,
	},
	componentTags: [
		"transformation", "materials", "texture", "children"
	],
	childrenTags: [
		"componentref", "primitiveref"
	],
    typeFunc: {
        int: 'getInteger',
        float: 'getFloat',
        string: 'getString',
        bool: 'getBoolean'
	},
	light: {
		name: "default",
		type: "omni",
		properties: {
			location: {x: 15, y:20, z:15, w:1},
			ambient: {r: 1, g: 1, b: 1, a:1},
			diffuse: {r: 1, g: 1, b: 1, a:1},
			specular: {r: 1, g: 1, b: 1, a:1}
		}
	},
	lightTags: {
		location: defaultAttributes.xyzwAttr,
		ambient: defaultAttributes.rgbaAttr,
		diffuse: defaultAttributes.rgbaAttr,
		specular: defaultAttributes.rgbaAttr
	},

}