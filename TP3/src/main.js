//From https://github.com/EvanHahn/ScriptInclude
include = function () {
    function f() {
        var a = this.readyState;
        (!a || /ded|te/.test(a)) && (c--, !c && e && d())
    }
    var a = arguments,
        b = document,
        c = a.length,
        d = a[c - 1],
        e = d.call;
    e && c--;
    for (var g, h = 0; c > h; h++) g = b.createElement("script"), g.src = arguments[h], g.async = !0, g.onload = g.onerror = g.onreadystatechange = f, (b.head || b.getElementsByTagName("head")[0]).appendChild(g)
};
serialInclude = function (a) {
    var b = console,
        c = serialInclude.l;
    if (a.length > 0) c.splice(0, 0, a);
    else b.log("Done!");
    if (c.length > 0) {
        if (c[0].length > 1) {
            var d = c[0].splice(0, 1);
            b.log("Loading " + d + "...");
            include(d, function () {
                serialInclude([]);
            });
        } else {
            var e = c[0][0];
            c.splice(0, 1);
            e.call();
        };
    } else b.log("Finished.");
};
serialInclude.l = new Array();

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}
//Include additional files here
serialInclude(['../lib/CGF.js', 'XMLscene.js', 'reader/SceneGraphParser.js', 'MyInterface.js', 'primitives/Rectangle.js', 'primitives/Triangle.js',
    'primitives/Cylinder.js', 'primitives/Sphere.js', 'primitives/Circle.js', 'primitives/NoBaseCylinder.js', 'reader/Component.js',
    'primitives/Torus.js', 'reader/Attribute.js', 'reader/Defaults.js', 'animations/Animation.js', 'animations/LinearAnimation.js',
    'animations/CircularAnimation.js', 'animations/KeyFrame.js', 'animations/vec3utils.js', 'primitives/Plane.js', 'primitives/Patch.js',
    'primitives/Terrain.js', 'primitives/Water.js', 'primitives/Cylinder2.js', 'primitives/Vehicle.js', 'primitives/Light.js',
    'primitives/Board.js', 'primitives/Piece.js', 'Game.js', 'animations/BezierAnimation.js', 'primitives/Cube.js', 'primitives/Dispenser.js',
    'Prolog.js', 'primitives/Counter.js', 'primitives/Timer.js', 'primitives/Box.js',

    main = function () {
        // Standard application, scene and interface setup

        var app = new CGFapplication(document.body);
        var myInterface = new MyInterface();
        var myScene = new XMLscene(myInterface);

        
        app.init();
        
        app.setScene(myScene);
        app.setInterface(myInterface);
        
        myInterface.setActiveCamera(myScene.camera);
        
        Game.getInstance().setScene(myScene);

        // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
        // or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 

        var filename = getUrlVars()['file'] || "flume1.xml";

        // create and load graph, and associate it to scene. 
        // Check console for loading errors
        const g1 = new MySceneGraph('flume1.xml', myScene, 'Day scene');
        const g2 = new MySceneGraph('flume2.xml', myScene, 'Night scene');

        // start
        app.run();
    }

]);