var canvas = document.getElementById("drawing_canvas");
var ctx = canvas.getContext("2d");

var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;

var g = 9.8; // Gravity
var timeStep = 1 / 60;

// Pendulum parameters
var length1 = 150, length2 = 150;
var mass1 = 10, mass2 = 10;
var angle1 = Math.PI / 2, angle2 = Math.PI / 2;
var angle1Velocity = 0, angle2Velocity = 0;
var angle1Acceleration = 0, angle2Acceleration = 0;

var trail1 = [], trail2 = [];

function updatePhysics() {
    var num1 = -g * (2 * mass1 + mass2) * Math.sin(angle1);
    var num2 = -mass2 * g * Math.sin(angle1 - 2 * angle2);
    var num3 = -2 * Math.sin(angle1 - angle2) * mass2;
    var num4 = angle2Velocity * angle2Velocity * length2 + angle1Velocity * angle1Velocity * length1 * Math.cos(angle1 - angle2);
    var den = length1 * (2 * mass1 + mass2 - mass2 * Math.cos(2 * angle1 - 2 * angle2));
    
    angle1Acceleration = (num1 + num2 + num3 * num4) / den;

    num1 = 2 * Math.sin(angle1 - angle2);
    num2 = angle1Velocity * angle1Velocity * length1 * (mass1 + mass2);
    num3 = g * (mass1 + mass2) * Math.cos(angle1);
    num4 = angle2Velocity * angle2Velocity * length2 * mass2 * Math.cos(angle1 - angle2);
    den = length2 * (2 * mass1 + mass2 - mass2 * Math.cos(2 * angle1 - 2 * angle2));
    
    angle2Acceleration = (num1 * (num2 + num3 + num4)) / den;

    angle1Velocity += angle1Acceleration * timeStep;
    angle2Velocity += angle2Acceleration * timeStep;

    angle1 += angle1Velocity * timeStep;
    angle2 += angle2Velocity * timeStep;

    trail1.push({ x: length1 * Math.sin(angle1) + width / 2, y: length1 * Math.cos(angle1) + height / 4 });
    trail2.push({ x: length1 * Math.sin(angle1) + length2 * Math.sin(angle2) + width / 2, y: length1 * Math.cos(angle1) + length2 * Math.cos(angle2) + height / 4 });

    if (trail1.length > 100) trail1.shift();
    if (trail2.length > 100) trail2.shift();
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    var x1 = length1 * Math.sin(angle1) + width / 2;
    var y1 = length1 * Math.cos(angle1) + height / 4;
    var x2 = x1 + length2 * Math.sin(angle2);
    var y2 = y1 + length2 * Math.cos(angle2);

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 4);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x1, y1, mass1, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x2, y2, mass2, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(trail1[0].x, trail1[0].y);
    for (var i = 1; i < trail1.length; i++) {
        ctx.lineTo(trail1[i].x, trail1[i].y);
    }
    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(trail2[0].x, trail2[0].y);
    for (var i = 1; i < trail2.length; i++) {
        ctx.lineTo(trail2[i].x, trail2[i].y);
    }
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.stroke();
}

function loop() {
    updatePhysics();
    draw();
    requestAnimationFrame(loop);
}

loop();

// Animation control settings
var animationControls = {
    angle1: angle1,
    angle2: angle2,
    angle1Velocity: angle1Velocity,
    angle2Velocity: angle2Velocity,
    mass1: mass1,
    mass2: mass2,
    length1: length1,
    length2: length2,
    g: g,
    reset: function() {
        angle1 = animationControls.angle1;
        angle2 = animationControls.angle2;
        angle1Velocity = animationControls.angle1Velocity;
        angle2Velocity = animationControls.angle2Velocity;
        mass1 = animationControls.mass1;
        mass2 = animationControls.mass2;
        length1 = animationControls.length1;
        length2 = animationControls.length2;
        g = animationControls.g;
    }
};

window.onload = function() {
    var gui = new dat.GUI({ autoPlace: false });
    gui.domElement.id = 'gui';
    gui.add(animationControls, 'angle1', 0, Math.PI * 2).name('Angle 1').listen();
    gui.add(animationControls, 'angle2', 0, Math.PI * 2).name('Angle 2').listen();
    gui.add(animationControls, 'angle1Velocity', -10, 10).name('Angle 1 Velocity').listen();
    gui.add(animationControls, 'angle2Velocity', -10, 10).name('Angle 2 Velocity').listen();
    gui.add(animationControls, 'mass1', 1, 100).name('Mass 1').listen();
    gui.add(animationControls, 'mass2', 1, 100).name('Mass 2').listen();
    gui.add(animationControls, 'length1', 50, 300).name('Length 1').listen();
    gui.add(animationControls, 'length2', 50, 300).name('Length 2').listen();
    gui.add(animationControls, 'g', 0.1, 20).name('Gravity').listen();
    gui.add(animationControls, 'reset').name('Reset');

    document.getElementById('gui-container').appendChild(gui.domElement);
    gui.close();
};
