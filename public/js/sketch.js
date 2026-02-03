/*!
 * This file is part of Space Type Generator.
 * 
 * Copyright (c) Kiel Mutschelknaus
 * 
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to
 * Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */

var tFont = [];
var pgTextSize = 90;
var lineHeight = pgTextSize * 0.8;
var bkgdColor, foreColor, fadeColor;

var introScreen;
var logoImg;


var keyText;
var keyArray = [];

var main = "DANGER";

var groupCount = 1;
var kineticGroups = [];

var budgeCenter = [];
var fullHeight = 0;

let cwidth, cheight;
let cXadjust, cYadjust;
let widthHold, heightHold;
let cScale = 1;

let encoder;

const frate = 30; // frame rate
var numFrames = 105; // num of frames to record
let recording = false;
let recordedFrames = 0;
let recMessageOn = false;

let currentFont;
let saveSizeState = 0;
let horzSpacer;
var newWidth;

var frameFade = 3;

var thisDensity;

var widgetOn = true;

// Animation control parameters (exposed to UI)
var animSpeed = 1.0;      // Speed multiplier (0.5 - 3.0)
var animSpread = 100;     // Movement spread (0 - 200)
var animIntensity = 5;    // Easing intensity (1 - 10)

// Motion type flags (can enable multiple simultaneously)
var motionArc = false;
var motionDiagonal = false;
var motionZigZag = false;
var motionBolt = false;
var motionBowtie = false;
var motionRays = false;
var motionLean = false;

// NEW: 15 Additional Motion Effects
var motionSpiral = false;
var motionWave = false;
var motionRipple = false;
var motionExplode = false;
var motionImplode = false;
var motionScatter = false;
var motionTwist = false;
var motionRotate = false;
var motionOrbit = false;
var motionBounce = false;
var motionSlide = false;
var motionFlip = false;
var motionPulse = false;
var motionShake = false;
var motionGlitch = false;

// Motion intensities (0-200, default 100 = 1x effect)
var motionArcIntensity = 100;
var motionDiagonalIntensity = 100;
var motionZigZagIntensity = 100;
var motionBoltIntensity = 100;
var motionBowtieIntensity = 100;
var motionRaysIntensity = 100;
var motionLeanIntensity = 100;

// NEW: Intensities for 15 new effects
var motionSpiralIntensity = 100;
var motionWaveIntensity = 100;
var motionRippleIntensity = 100;
var motionExplodeIntensity = 100;
var motionImplodeIntensity = 100;
var motionScatterIntensity = 100;
var motionTwistIntensity = 100;
var motionRotateIntensity = 100;
var motionOrbitIntensity = 100;
var motionBounceIntensity = 100;
var motionSlideIntensity = 100;
var motionFlipIntensity = 100;
var motionPulseIntensity = 100;
var motionShakeIntensity = 100;
var motionGlitchIntensity = 100;

// Shape layout mode
var shapeMode = 'none'; // 'none', 'rectangle', 'circle', 'triangle', 'star', 'spiral'

// Poster Mode
var posterMode = false;
var posterWidth = 600;
var posterHeight = 900;

function togglePosterMode(val) {
    posterMode = val;

    // Toggle CSS class on container
    const appContainer = document.getElementById('app-container');
    if (posterMode) {
        if (appContainer) appContainer.classList.add('poster-active');
    } else {
        if (appContainer) appContainer.classList.remove('poster-active');
    }

    // Trigger Resize
    windowResized();

    if (window.bgInstance && typeof window.bgInstance.setPosterMode === 'function') {
        window.bgInstance.setPosterMode(posterMode);
    }

    // Removed emitFunction to keep Poster Mode local to the user
}
window.togglePosterMode = togglePosterMode;

// Store a reference to the p5 instance for external access
var _p5Instance = null;
var _p5SetupComplete = false;

// Control whether the classic type sketch is active (drawing)
function setClassicTypeActive(isActive) {
    // Only try to control loop if setup has completed
    if (!_p5SetupComplete) {
        console.log('[sketch.js] setClassicTypeActive called before setup complete, ignoring');
        return;
    }

    try {
        if (isActive) {
            loop();
        } else {
            noLoop();
            clear(); // Clear the canvas content when pausing
        }
    } catch (e) {
        console.warn('[sketch.js] Error controlling p5 loop:', e);
    }
}
window.setClassicTypeActive = setClassicTypeActive;

function preload() {
    // Remote fonts might fail to load due to CORS or network. Switching to system fonts for reliability.
    logoImg = loadImage('assets/colab_logo.png');
}

function setup() {
    // Initialize fonts - Google Fonts + System fonts
    tFont = [
        // Google Fonts (bold display fonts)
        'Bebas Neue',
        'Staatliches',
        'Orbitron',
        'Monoton',
        'Rubik Mono One',
        'Fredoka',
        'Permanent Marker',
        'Lobster',
        'Dela Gothic One',
        'Ultra',
        // System fonts (fallbacks)
        'Inter',
        'Arial Black',
        'Times New Roman',
        'Courier New',
        'Helvetica'
    ];

    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-type'); // Parent to the type layer
    cwidth = int(windowWidth);
    cheight = int(windowHeight);

    thisDensity = pixelDensity();

    widthHold = width;
    heightHold = height;

    pgTextSize = 50; // Fixed size instead of dynamic
    // Check if element exists before accessing value to prevent errors if UI not fully ready? No, should be fine.
    if (document.getElementById("fontSize")) {
        document.getElementById("fontSize").value = pgTextSize;
    }
    lineHeight = pgTextSize * 0.8;

    if (document.getElementById("textArea")) {
        document.getElementById("textArea").value = "Colab.\nDesign Together.";
    }

    bkgdColor = color(0, 0, 0, 0); // Transparent background for layering
    foreColor = color('#FFFFFF');
    fadeColor = color('#FFFFFF');
    currentFont = tFont[0];
    newWidth = widthHold;
    newHeight = heightHold;
    horzSpacer = widthHold / 2;
    cXadjust = 0;
    cYadjust = 0;

    frameRate(frate);
    noSmooth();
    textureMode(NORMAL);



    setText();

    // Mark setup as complete so external calls to setClassicTypeActive will work
    _p5SetupComplete = true;

    // Start paused - the intro screen is active on load
    // React will call setClassicTypeActive(true) when needed
    noLoop();
}


function draw() {
    // Normal 2D rendering
    clear(); // Use clear() instead of background() to maintain transparency

    if (recording) {

        scale(cScale);
    }

    push();
    translate(widthHold / 2, heightHold / 2);
    if (recording) {
        translate(cXadjust, cYadjust);
    }

    if (!recording) {
        stroke(foreColor);
        strokeWeight(frameFade);
        noFill();
        rectMode(CENTER);
        rect(0, 0, newWidth, newHeight);
    }

    translate(0, -fullHeight / 2 + lineHeight);

    for (var p = 0; p < kineticGroups.length; p++) {
        kineticGroups[p].update();
        kineticGroups[p].run();
    }
    pop();

    if (recording) {
        console.log('recording');
        encoder.addFrameRgba(drawingContext.getImageData(0, 0, encoder.width, encoder.height).data);
        recordedFrames++;
    }
    if (recording && recordedFrames === numFrames) {
        recording = false;
        recordedFrames = 0;
        console.log('recording stopped');

        encoder.finalize();
        const uint8Array = encoder.FS.readFile(encoder.outputFilename);
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }));
        anchor.download = encoder.outputFilename;
        anchor.click();
        encoder.delete();

        setRecorder(); // reinitialize encoder

        toggleRecMessage();
    }

    if (frameFade > 0.2) {
        frameFade -= 0.2;
    }
}

function resetAnim() {
    fullHeight = keyArray.length * lineHeight;

    for (var p = 0; p < groupCount; p++) {
        // kineticGroups[p] = new KineticGroup(-horzSpacer * 2 + p * horzSpacer, 0, p);
        kineticGroups[p] = new KineticGroup(-horzSpacer * ((groupCount - 1) / 2) + p * horzSpacer, 0, p);
    }
}

function windowResized() {
    if (posterMode) {
        resizeCanvas(posterWidth, posterHeight);
        // Center the canvas logic is handled by CSS, but we need to ensure p5 knows the size
    } else {
        resizeCanvas(windowWidth, windowHeight);
    }

    widthHold = width;
    heightHold = height;

    // Recalculate generic sizes if needed
    if (!posterMode) {
        pgTextSize = width / 11;
    } else {
        pgTextSize = width / 8; // Start slightly larger for poster
    }

    // Update inputs if they exist
    if (document.getElementById("fontSize")) {
        document.getElementById("fontSize").value = parseInt(pgTextSize); // Visual update only
    }

    sizeSaveChange(saveSizeState);
}

function setRecorder() {
    if (typeof HME !== 'undefined') {
        HME.createH264MP4Encoder().then(enc => {
            encoder = enc;
            encoder.outputFilename = 'STG_vSnap';
            encoder.pixelDensity = thisDensity;
            encoder.width = cwidth * thisDensity;
            encoder.height = cheight * thisDensity;
            encoder.frameRate = frate;
            encoder.kbps = 50000; // video quality
            encoder.groupOfPictures = 5; // lower if you have fast actions.
            encoder.initialize();
        })
    } else {
        console.log("HME not loaded yet");
    }
}
