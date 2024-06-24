var canvas = document.getElementById("drawing_canvas");
var ctx = canvas.getContext("2d");

var width = canvas.width = window.innerWidth/2;
var height = canvas.height = window.innerHeight;

var g = 9.8; // Gravity in m/s^2
var timeStep = 1 / 60; // Time step in seconds
var timeScale = 1; // Scale time

// Pendulum parameters in SI units
var length1 = 1.5, length2 = 1.5; // Length in meters
var mass1 = 10, mass2 = 10; // Mass in kilograms
var angle1 = Math.PI / 2, angle2 = Math.PI / 2; // Initial angles in radians
var angle1Velocity = 0, angle2Velocity = 0; // Angular velocity in radians per second
var angle1Acceleration = 0, angle2Acceleration = 0; // Angular acceleration in radians per second squared

var airFriction = 0.01; // Air friction coefficient

var ballRadius1 = 15; // Radius of pendulum 1 ball in pixels
var ballRadius2 = 15; // Radius of pendulum 2 ball in pixels

var trail1 = [], trail2 = [];

var stoppedThreshold = 0.001; // Threshold for determining if the pendulum has stopped

// Conversion functions
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / 180);
}

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

    // Apply air friction
    angle1Velocity += (-airFriction * angle1Velocity + angle1Acceleration) * timeStep * timeScale;
    angle2Velocity += (-airFriction * angle2Velocity + angle2Acceleration) * timeStep * timeScale;

    angle1 += angle1Velocity * timeStep * timeScale;
    angle2 += angle2Velocity * timeStep * timeScale;

    trail1.push({ x: length1 * Math.sin(angle1) * 100 + width / 2, y: length1 * Math.cos(angle1) * 100 + height / 3 });
    trail2.push({ x: length1 * Math.sin(angle1) * 100 + length2 * Math.sin(angle2) * 100 + width / 2, y: length1 * Math.cos(angle1) * 100 + length2 * Math.cos(angle2) * 100 + height / 3 });

    if (trail1.length > 300) trail1.shift();
    if (trail2.length > 300) trail2.shift();

    // Check if the pendulum has stopped
    if (Math.abs(angle1Velocity) < stoppedThreshold && Math.abs(angle2Velocity) < stoppedThreshold) {
        randomizePendulum();
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    var x1 = length1 * Math.sin(angle1) * 100 + width / 2;
    var y1 = length1 * Math.cos(angle1) * 100 + height / 3;
    var x2 = x1 + length2 * Math.sin(angle2) * 100;
    var y2 = y1 + length2 * Math.cos(angle2) * 100;

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 3);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x1, y1, ballRadius1, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x2, y2, ballRadius2, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.beginPath();
    if (trail1.length > 0) {
        ctx.moveTo(trail1[0].x, trail1[0].y);
        for (var i = 1; i < trail1.length; i++) {
            ctx.lineTo(trail1[i].x, trail1[i].y);
        }
        ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
        ctx.stroke();
    }

    ctx.beginPath();
    if (trail2.length > 0) {
        ctx.moveTo(trail2[0].x, trail2[0].y);
        for (var i = 1; i < trail2.length; i++) {
            ctx.lineTo(trail2[i].x, trail2[i].y);
        }
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.stroke();
    }

    // Display forces and torque with a sci-fi look
    displayForces();
}

function displayForces() {
    var torque1 = length1 * mass1 * g * Math.sin(angle1);
    var torque2 = length2 * mass2 * g * Math.sin(angle2);

    var info = [
        `Torque on Pendulum 1: ${torque1.toFixed(2)} Nm`,
        `Torque on Pendulum 2: ${torque2.toFixed(2)} Nm`,
        `Angle 1: ${toDegrees(angle1).toFixed(2)}°`,
        `Angle 2: ${toDegrees(angle2).toFixed(2)}°`,
        `Velocity 1: ${angle1Velocity.toFixed(2)} rad/s`,
        `Velocity 2: ${angle2Velocity.toFixed(2)} rad/s`,
        `Mass 1: ${mass1.toFixed(2)} kg`,
        `Mass 2: ${mass2.toFixed(2)} kg`,
    ];

    ctx.font = '16px "Lucida Console", Monaco, monospace';
    ctx.fillStyle = 'lime';
    ctx.textAlign = 'left';

    ctx.save();
    ctx.shadowColor = 'cyan';
    ctx.shadowBlur = 5;

    info.forEach((text, index) => {
        ctx.fillText(text, 20, height - (info.length - index) * 20 - 20);
    });

    ctx.restore();
}

function randomizePendulum() {
    length1 = Math.random() * 2.5 + 0.5;
    length2 = Math.random() * 2.5 + 0.5;
    mass1 = Math.random() * 99.9 + 0.1;
    mass2 = Math.random() * 99.9 + 0.1;
    angle1 = Math.random() * Math.PI;
    angle2 = Math.random() * Math.PI;
    angle1Velocity = Math.random() * 2 - 1;
    angle2Velocity = Math.random() * 2 - 1;
    ballRadius1 = Math.random() * 45 + 5;
    ballRadius2 = Math.random() * 45 + 5;
    trail1 = [];
    trail2 = [];
}

function loop() {
    updatePhysics();
    draw();
    requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

loop();

// Animation control settings
var animationControls = {
    angle1: toDegrees(angle1),
    angle2: toDegrees(angle2),
    angle1Velocity: angle1Velocity,
    angle2Velocity: angle2Velocity,
    mass1: mass1,
    mass2: mass2,
    length1: length1,
    length2: length2,
    ballRadius1: ballRadius1,
    ballRadius2: ballRadius2,
    g: g,
    airFriction: airFriction,
    timeScale: timeScale,
    reset: function() {
        angle1 = toRadians(animationControls.angle1);
        angle2 = toRadians(animationControls.angle2);
        angle1Velocity = animationControls.angle1Velocity;
        angle2Velocity = animationControls.angle2Velocity;
        mass1 = animationControls.mass1;
        mass2 = animationControls.mass2;
        length1 = animationControls.length1;
        length2 = animationControls.length2;
        ballRadius1 = animationControls.ballRadius1;
        ballRadius2 = animationControls.ballRadius2;
        g = animationControls.g;
        airFriction = animationControls.airFriction;
        timeScale = animationControls.timeScale;
    }
};
var canvas = document.getElementById("drawing_canvas");
var ctx = canvas.getContext("2d");

var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;

var g = 9.8; // Gravity in m/s^2
var timeStep = 1 / 60; // Time step in seconds
var timeScale = 1; // Scale time

// Pendulum parameters in SI units
var length1 = 1.5, length2 = 1.5; // Length in meters
var mass1 = 10, mass2 = 10; // Mass in kilograms
var angle1 = Math.PI / 2, angle2 = Math.PI / 2; // Initial angles in radians
var angle1Velocity = 0, angle2Velocity = 0; // Angular velocity in radians per second
var angle1Acceleration = 0, angle2Acceleration = 0; // Angular acceleration in radians per second squared

var airFriction = 0.01; // Air friction coefficient

var ballRadius1 = 15; // Radius of pendulum 1 ball in pixels
var ballRadius2 = 15; // Radius of pendulum 2 ball in pixels

var trail1 = [], trail2 = [];

var stoppedThreshold = 0.001; // Threshold for determining if the pendulum has stopped
var blowOutThreshold = 100; // Threshold for determining if the pendulum has blown out

var resetTimeout = null; // Variable to hold the timeout function for resetting the pendulum

// Conversion functions
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

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

    // Apply air friction
    angle1Velocity += (-airFriction * angle1Velocity + angle1Acceleration) * timeStep * timeScale;
    angle2Velocity += (-airFriction * angle2Velocity + angle2Acceleration) * timeStep * timeScale;

    angle1 += angle1Velocity * timeStep * timeScale;
    angle2 += angle2Velocity * timeStep * timeScale;

    trail1.push({ x: length1 * Math.sin(angle1) * 100 + width / 2, y: length1 * Math.cos(angle1) * 100 + height / 4 });
    trail2.push({ x: length1 * Math.sin(angle1) * 100 + length2 * Math.sin(angle2) * 100 + width / 2, y: length1 * Math.cos(angle1) * 100 + length2 * Math.cos(angle2) * 100 + height / 4 });

    if (trail1.length > 300) trail1.shift();
    if (trail2.length > 300) trail2.shift();

    // Check if the pendulum has stopped
    if (Math.abs(angle1Velocity) < stoppedThreshold && Math.abs(angle2Velocity) < stoppedThreshold) {
        randomizePendulum();
    }

    // Check if the pendulum has blown out
    if (Math.abs(angle1Velocity) > blowOutThreshold || Math.abs(angle2Velocity) > blowOutThreshold) {
        if (!resetTimeout) {
            resetTimeout = setTimeout(randomizePendulum, 5000);
        }
    } else if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    var x1 = length1 * Math.sin(angle1) * 100 + width / 2;
    var y1 = length1 * Math.cos(angle1) * 100 + height / 4;
    var x2 = x1 + length2 * Math.sin(angle2) * 100;
    var y2 = y1 + length2 * Math.cos(angle2) * 100;

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 4);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x1, y1, ballRadius1, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x2, y2, ballRadius2, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.beginPath();
    if (trail1.length > 0) {
        ctx.moveTo(trail1[0].x, trail1[0].y);
        for (var i = 1; i < trail1.length; i++) {
            ctx.lineTo(trail1[i].x, trail1[i].y);
        }
        ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
        ctx.stroke();
    }

    ctx.beginPath();
    if (trail2.length > 0) {
        ctx.moveTo(trail2[0].x, trail2[0].y);
        for (var i = 1; i < trail2.length; i++) {
            ctx.lineTo(trail2[i].x, trail2[i].y);
        }
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.stroke();
    }

    // Display 
    displayForces();
}

function displayForces() {
    var torque1 = length1 * mass1 * g * Math.sin(angle1);
    var torque2 = length2 * mass2 * g * Math.sin(angle2);
    var linearVelocity1 = length1 * angle1Velocity;
    var linearVelocity2 = length2 * angle2Velocity;
    var momentum1 = mass1 * linearVelocity1;
    var momentum2 = mass2 * linearVelocity2;
    var angularMomentum1 = mass1 * length1 * length1 * angle1Velocity;
    var angularMomentum2 = mass2 * length2 * length2 * angle2Velocity;

    var infoLeft = [
        `Torque on Pendulum 1: ${torque1.toFixed(2)} Nm`,
        `Torque on Pendulum 2: ${torque2.toFixed(2)} Nm`,
        `Angle 1: ${toDegrees(angle1).toFixed(2)}°`,
        `Angle 2: ${toDegrees(angle2).toFixed(2)}°`,
        `Velocity 1: ${linearVelocity1.toFixed(2)} m/s`,
        `Velocity 2: ${linearVelocity2.toFixed(2)} m/s`,
        `Momentum 1: ${momentum1.toFixed(2)} kg·m/s`,
        `Momentum 2: ${momentum2.toFixed(2)} kg·m/s`,
        `Angular Momentum 1: ${angularMomentum1.toFixed(2)} kg·m²/s`,
        `Angular Momentum 2: ${angularMomentum2.toFixed(2)} kg·m²/s`,
    ];

    

    ctx.font = '12px "Lucida Console", Monaco, monospace';
    ctx.fillStyle = 'lime';
    ctx.textAlign = 'left';

    ctx.save();
    ctx.shadowColor = 'cyan';
    ctx.shadowBlur = 5;

    infoLeft.forEach((text, index) => {
        ctx.fillText(text, 20, height - (infoLeft.length - index) * 20 - 40);
    });


    ctx.restore();
}

function randomizePendulum() {
    length1 = Math.random() * 2.5 + 0.5;
    length2 = Math.random() * 2.5 + 0.5;
    mass1 = Math.random() * 50 + 1;
    mass2 = Math.random() * 50 + 1;
    angle1 = toRadians(Math.random() * 360);
    angle2 = toRadians(Math.random() * 360);
    angle1Velocity = 0;
    angle2Velocity = 0;
    angle1Acceleration = 0;
    angle2Acceleration = 0;
    ballRadius1 = Math.random() * 45 + 5;
    ballRadius2 = Math.random() * 45 + 5;
    trail1 = [];
    trail2 = [];

    if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
    }
}

function animate() {
    updatePhysics();
    draw();
    requestAnimationFrame(animate);
}

animate();

window.onload = function() {
    var gui = new dat.GUI({ autoPlace: false });
    gui.add(animationControls, 'angle1', 0, 360).name('Angle 1 (deg)').listen();
    gui.add(animationControls, 'angle2', 0, 360).name('Angle 2 (deg)').listen();
    gui.add(animationControls, 'angle1Velocity', -10, 10).name('Angle 1 Velocity').listen();
    gui.add(animationControls, 'angle2Velocity', -10, 10).name('Angle 2 Velocity').listen();
    gui.add(animationControls, 'mass1', 0.1, 100).name('Mass 1 (kg)').listen();
    gui.add(animationControls, 'mass2', 0, 100).name('Mass 2 (kg)').listen();
    gui.add(animationControls, 'length1', 0.5, 3).name('Length 1 (m)').listen();
    gui.add(animationControls, 'length2', 0, 5).name('Length 2 (m)').listen();
    gui.add(animationControls, 'ballRadius1', 5, 50).name('Ball 1 Radius').listen();
    gui.add(animationControls, 'ballRadius2', 0, 50).name('Ball 2 Radius').listen();
    gui.add(animationControls, 'g', 0.1, 100).name('Gravity (m/s²)').listen();
    gui.add(animationControls, 'airFriction', 0, 1).name('Air Friction').listen();
    gui.add(animationControls, 'timeScale', 0.01, 10).name('Time Scale').listen();
    gui.add(animationControls, 'reset').name('Just do It');

    document.getElementById('gui-container').appendChild(gui.domElement);
    gui.close();
    window.addEventListener("resize", onResize);

};
