var Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    Engine = Matter.Engine,
    Events = Matter.Events,
    Render = Matter.Render,
    Runner = Matter.Runner;

/***
Returns the current wind velocity and direction at a location as a
array of velocity, direction in degrees, where 0 is vertical from the north.
*/
function windVelocity(x, y) {
    return [1.5, 0.0 / Math.PI];
}

function containerPolygon(x, y, sides, radius) {
    const width = 20;
    const extraLength = 1.15;
    const theta = 2 * Math.PI / sides;
    const sideLength = 2 * radius * theta / 2 * extraLength;
    const parts = [];
    for (let i = 0; i < sides; i++) {
        const body = Bodies.rectangle(0, 0, sideLength, width, {
            isStatic: true
        });
        Body.rotate(body, i * theta);
        Body.translate(body, {
            x: radius * Math.sin(i * theta),
            y: -radius * Math.cos(i * theta)
        });
        parts.push(body);
    }
    const ret = Body.create({
        isStatic: true
    });
    Body.setParts(ret, parts);
    Body.translate(ret, {
        x: x,
        y: y
    });
    return ret;
}

var boat_group = -1;

function createBoat(x, y) {
    const vertices = [{
        x: 80.0 - 34.8,
        y: -15.9,
    }, {
        x: 80.0 - 25.1,
        y: -13.4,
    }, {
        x: 80.0 - 15.7,
        y: -10.0,
    }, {
        x: 80.0 - 6.8,
        y: -5.4,
    }, {
        x: 80.0 - 0,
        y: 0,
    }, {
        x: 80.0 - 7.8,
        y: 6.2,
    }, {
        x: 80.0 - 16.6,
        y: 10.9,
    }, {
        x: 80.0 - 26.0,
        y: 14.3,
    }, {
        x: 80.0 - 35.7,
        y: 16.7,
    }, {
        x: 80.0 - 45.6,
        y: 18.3,
    }, {
        x: 80.0 - 55.5,
        y: 19.3,
    }, {
        x: 80.0 - 65.5,
        y: 19.8,
    }, {
        x: 80.0 - 75.5,
        y: 20.0,
    }, {
        x: 80.0 - 80.0,
        y: 20,
    }, {
        x: 80.0 - 80.0,
        y: -20,
    }, {
        x: 80.0 - 74.5,
        y: -20.0,
    }, {
        x: 80.0 - 64.5,
        y: -19.6,
    }, {
        x: 80.0 - 54.5,
        y: -18.8,
    }, {
        x: 80.0 - 44.6,
        y: -17.6,
    }];
    var boom_length = 70;
    var hull = Matter.Bodies.fromVertices(x, y, vertices, {
        collisionFilter: {
            group: boat_group
        },
        label: "hull",
    });
    var boom = Matter.Bodies.rectangle(x, y, boom_length, 6, {
        collisionFilter: {
            group: boat_group
        },
        frictionAir: 0,
        render: {
            fillStyle: 'lightgrey'
        },
        label: "boom",
    });
    var mast = Constraint.create({
        bodyA: hull,
        bodyB: boom,
        pointA: {
            x: 20,
            y: 0
        },
        pointB: {
            x: boom_length / 2,
            y: 0
        },
        stiffness: 0.9,
        length: 0,
        render: {
            visible: false
        }
    });
    var sheet = Constraint.create({
        bodyA: hull,
        bodyB: boom,
        pointA: {
            x: 0,
            y: 0
        },
        pointB: {
            x: 0,
            y: 0
        },
        stiffness: 0.01,
        render: {
            strokeStyle: 'white',
            anchors: false,
            type: 'line',
        }
    });
    boat_group--;
    var craft = Composite.create({
        label: "boat"
    });
    Matter.Composite.add(craft, [hull, boom, mast, sheet]);
    return craft;
}

var engine = Engine.create({
    gravity: {
        y: 0
    }
});

var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 3000,
        height: 3000,
        wireframes: false,
        hasBounds: true,
    }
});

var field = containerPolygon(1020, 1020, 40, 1000);

var boats = [
    createBoat(1400, 1180),
    createBoat(1580, 1500),
    createBoat(1200, 1300),
    createBoat(1220, 1310),
    createBoat(1300, 1320),
    createBoat(1350, 1330)
];

Composite.add(engine.world, boats);
Matter.Body.setVelocity(boats[0].bodies[0], {
    x: 5,
    y: 2
});
Matter.Body.setAngularVelocity(boats[0].bodies[0], Math.PI / 20);
var circle = Bodies.circle(1232, 1800, 10);

Composite.add(engine.world, [field, circle]);

Render.lookAt(render, {
    min: {
        x: 0,
        y: 0
    },
    max: {
        x: 8000,
        y: 8000
    }
});

Events.on(engine, 'beforeUpdate', function() {
    var bodies = Composite.allBodies(engine.world);
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        if (body.isStatic || body.isSleeping) continue;
/*        if (body.label == 'boom') {
            var [velocity, direction] = windVelocity(body.x, body.y);
            var angdiff = Math.abs(body.angle - direction);
            console.log('body ', i, ' direction', direction, ' angle ', body.angle, ' angdif ', angdiff, ' cos ', Math.cos(angdiff));
            body.force.y -= Math.cos(angdiff) * body.mass * 0.001;
            body.force.x += Math.sin(angdiff) * body.mass * 0.001;
        } */
        if (body.label == 'hull') {
            body.force.y += Math.sin(body.angle) * body.mass * 0.0001;
            body.force.x += Math.cos(body.angle) * body.mass * 0.0001;
	    Body.setAngularVelocity(body, 0.005);
        }
    }
});

const slider = document.getElementById("angle");

slider.addEventListener("input", function() {
    var bodies = Composite.allBodies(engine.world);
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        if (body.isStatic || body.isSleeping) continue;
        if (body.label == 'boom') {
	    Body.setAngle(body, this.value / 360.0 * 2 * Math.PI, false);
            Body.setAngularVelocity(body, 0);
        }
    }
});

Render.run(render);

var runner = Runner.create();

Runner.run(runner, engine);
