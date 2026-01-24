// Global Animation Variables
window.trackingFactor = 0.15;
window.leadingFactor = 0.8;

function setText() {
    textSize(pgTextSize);
    textFont(currentFont);

    var enteredText = document.getElementById("textArea").value;
    keyText = enteredText;
    keyArray = enteredText.match(/[^\r\n]+/g);

    if (keyArray == null) {
        keyArray = "";
    }

    if (window.emitChange) window.emitChange('text', 'textArea', enteredText);

    resetAnim();
}

function setFont(val) {
    currentFont = tFont[val];
}

function runSave() {
    if (saveSizeState == 0) {           // AS IS
        cwidth = newWidth;
        cheight = newHeight;

        cScale = 1;
    } else if (saveSizeState == 1) {    // Vert
        cwidth = 1080 / thisDensity;
        cheight = 1920 / thisDensity;

        if (widthHold > heightHold * 9 / 16) {
            cScale = cheight / heightHold;
        } else {
            cScale = cwidth / widthHold;
        }
    } else if (saveSizeState == 2) {    // Sq
        cwidth = 1080 / thisDensity;
        cheight = 1080 / thisDensity;

        if (widthHold > heightHold) {
            cScale = cheight / heightHold;
        } else {
            cScale = cwidth / widthHold;
        }
    }

    if (width < cwidth) {
        print("Width too big!");
        resizeCanvas(cwidth, height);
    }

    if (height < cheight) {
        print("Height too big!");
        resizeCanvas(width, cheight);
    }

    setRecorder();

    numFrames = 90 + (keyArray[keyArray.length - 1].length - 1) * 3 + (keyArray.length - 1) * 3;
    recording = true;
    setText();

    toggleRecMessage();
}

function setForeColor(val) {
    foreColor = color(val);
    console.log('Foreground Color:', val);
}

function setLayerCount(val) {
    groupCount = parseInt(val);
    console.log('Layer Count:', groupCount);
    resetAnim();
    if (window.emitFunction) window.emitFunction('setLayerCount', val);
}

function setBkgdColor(val) {
    bkgdColor = color(val);
}

function setFontSize(val) {
    for (var p = 0; p < groupCount; p++) {
        kineticGroups[p] = 0;
    }

    pgTextSize = int(val);
    lineHeight = pgTextSize * leadingFactor;

    setText();
}

function setKerning(val) {
    // Map slider value (e.g. -10 to 50) to tracking factor (e.g. 0.05 to 0.5)
    // Default 0 -> 0.15
    window.trackingFactor = 0.15 + (val / 100);
    console.log("Set Kerning:", window.trackingFactor);
    setText();
}

function setLeading(val) {
    // val is directly passed as factor e.g. 1.2
    window.leadingFactor = parseFloat(val);
    console.log("Set Leading:", window.leadingFactor);
    lineHeight = pgTextSize * window.leadingFactor;
    setText();
}

// Explicitly attach to window for React access (must be after function definitions)
window.setKerning = setKerning;
window.setLeading = setLeading;
window.setLayerCount = setLayerCount;
window.setFontSize = setFontSize;
window.setForeColor = setForeColor;

function sizeSaveChange(val) {
    saveSizeState = val;

    if (saveSizeState == 0) {
        newHeight = heightHold;
        newWidth = widthHold;

        cXadjust = 0;
        cYadjust = 0;
    } else if (saveSizeState == 1) {
        if (widthHold > heightHold * 9 / 16) {
            print("center on x");

            newHeight = heightHold;
            newWidth = heightHold * 9 / 16;

            cXadjust = -(widthHold - newWidth) / 2;
            cYadjust = 0;
        } else {
            print("center on y");

            newHeight = widthHold * 16 / 9;
            newWidth = widthHold;

            cXadjust = 0;
            cYadjust = -(heightHold - newHeight) / 2;
        }
    } else if (saveSizeState == 2) {
        if (widthHold > heightHold) {
            newWidth = heightHold;
            newHeight = heightHold;

            cXadjust = -(widthHold - newWidth) / 2;
            cYadjust = 0;
        } else if (heightHold >= widthHold) {
            newHeight = widthHold;
            newWidth = widthHold;

            cXadjust = 0;
            cYadjust = -(heightHold - newHeight) / 2
        }
    }

    horzSpacer = newWidth / 2;
    frameFade = 4;

    setText();
}

function toggleRecMessage() {
    recMessageOn = !recMessageOn;

    if (recMessageOn) {
        document.getElementById('recStatus').style.display = "block";
    } else {
        document.getElementById('recStatus').style.display = "none";
    }
}

function hideWidget() {
    widgetOn = !widgetOn;

    if (widgetOn) {
        document.getElementById('widget').style.display = "block";
    } else {
        document.getElementById('widget').style.display = "none";
    }
}

// Animation control functions
function setAnimSpeed(val) {
    animSpeed = parseFloat(val);
    console.log('Animation Speed:', animSpeed);
    if (window.emitFunction) window.emitFunction('setAnimSpeed', val);
}

function setAnimSpread(val) {
    animSpread = parseInt(val);
    console.log('Animation Spread:', animSpread);
    if (window.emitFunction) window.emitFunction('setAnimSpread', val);
}

function setAnimIntensity(val) {
    animIntensity = parseInt(val);
    console.log('Animation Intensity:', animIntensity);
    if (window.emitFunction) window.emitFunction('setAnimIntensity', val);
}

// Motion type toggle functions
function toggleMotionArc(checked) {
    motionArc = checked;
    resetAnim();
}

function toggleMotionDiagonal(checked) {
    motionDiagonal = checked;
    resetAnim();
}

function toggleMotionZigZag(checked) {
    motionZigZag = checked;
    resetAnim();
}

function toggleMotionBolt(checked) {
    motionBolt = checked;
    resetAnim();
}

function toggleMotionBowtie(checked) {
    motionBowtie = checked;
    resetAnim();
}

function toggleMotionRays(checked) {
    motionRays = checked;
    resetAnim();
}

function toggleMotionLean(checked) {
    motionLean = checked;
    resetAnim();
}

// Motion intensity setter functions
function setMotionArcIntensity(val) {
    motionArcIntensity = parseInt(val);
    if (motionArc) resetAnim();
}

function setMotionDiagonalIntensity(val) {
    motionDiagonalIntensity = parseInt(val);
    if (motionDiagonal) resetAnim();
}

function setMotionZigZagIntensity(val) {
    motionZigZagIntensity = parseInt(val);
    if (motionZigZag) resetAnim();
}

function setMotionBoltIntensity(val) {
    motionBoltIntensity = parseInt(val);
    if (motionBolt) resetAnim();
}

function setMotionBowtieIntensity(val) {
    motionBowtieIntensity = parseInt(val);
    if (motionBowtie) resetAnim();
}

function setMotionRaysIntensity(val) {
    motionRaysIntensity = parseInt(val);
    if (motionRays) resetAnim();
}

function setMotionLeanIntensity(val) {
    motionLeanIntensity = parseInt(val);
    if (motionLean) resetAnim();
}
function setMotionLeanIntensity(val) {
    motionLeanIntensity = parseInt(val);
    if (motionLean) resetAnim();
}

// === NEW: 15 MOTION EFFECT TOGGLE FUNCTIONS ===

function toggleMotionSpiral(checked) {
    motionSpiral = checked;
    resetAnim();
}

function toggleMotionWave(checked) {
    motionWave = checked;
    resetAnim();
}

function toggleMotionRipple(checked) {
    motionRipple = checked;
    resetAnim();
}

function toggleMotionExplode(checked) {
    motionExplode = checked;
    resetAnim();
}

function toggleMotionImplode(checked) {
    motionImplode = checked;
    resetAnim();
}

function toggleMotionScatter(checked) {
    motionScatter = checked;
    resetAnim();
}

function toggleMotionTwist(checked) {
    motionTwist = checked;
    resetAnim();
}

function toggleMotionRotate(checked) {
    motionRotate = checked;
    resetAnim();
}

function toggleMotionOrbit(checked) {
    motionOrbit = checked;
    resetAnim();
}

function toggleMotionBounce(checked) {
    motionBounce = checked;
    resetAnim();
}

function toggleMotionSlide(checked) {
    motionSlide = checked;
    resetAnim();
}

function toggleMotionFlip(checked) {
    motionFlip = checked;
    resetAnim();
}

function toggleMotionPulse(checked) {
    motionPulse = checked;
    resetAnim();
}

function toggleMotionShake(checked) {
    motionShake = checked;
    resetAnim();
}

function toggleMotionGlitch(checked) {
    motionGlitch = checked;
    resetAnim();
}

// === NEW: 15 MOTION INTENSITY SETTER FUNCTIONS ===

function setMotionSpiralIntensity(val) {
    motionSpiralIntensity = parseInt(val);
    if (motionSpiral) resetAnim();
}

function setMotionWaveIntensity(val) {
    motionWaveIntensity = parseInt(val);
    if (motionWave) resetAnim();
}

function setMotionRippleIntensity(val) {
    motionRippleIntensity = parseInt(val);
    if (motionRipple) resetAnim();
}

function setMotionExplodeIntensity(val) {
    motionExplodeIntensity = parseInt(val);
    if (motionExplode) resetAnim();
}

function setMotionImplodeIntensity(val) {
    motionImplodeIntensity = parseInt(val);
    if (motionImplode) resetAnim();
}

function setMotionScatterIntensity(val) {
    motionScatterIntensity = parseInt(val);
    if (motionScatter) resetAnim();
}

function setMotionTwistIntensity(val) {
    motionTwistIntensity = parseInt(val);
    if (motionTwist) resetAnim();
}

function setMotionRotateIntensity(val) {
    motionRotateIntensity = parseInt(val);
    if (motionRotate) resetAnim();
}

function setMotionOrbitIntensity(val) {
    motionOrbitIntensity = parseInt(val);
    if (motionOrbit) resetAnim();
}

function setMotionBounceIntensity(val) {
    motionBounceIntensity = parseInt(val);
    if (motionBounce) resetAnim();
}

function setMotionSlideIntensity(val) {
    motionSlideIntensity = parseInt(val);
    if (motionSlide) resetAnim();
}

function setMotionFlipIntensity(val) {
    motionFlipIntensity = parseInt(val);
    if (motionFlip) resetAnim();
}

function setMotionPulseIntensity(val) {
    motionPulseIntensity = parseInt(val);
    if (motionPulse) resetAnim();
}

function setMotionShakeIntensity(val) {
    motionShakeIntensity = parseInt(val);
    if (motionShake) resetAnim();
}

function setMotionGlitchIntensity(val) {
    motionGlitchIntensity = parseInt(val);
    if (motionGlitch) resetAnim();
}

// === SHAPE LAYOUT CONTROL ===

function setShapeMode(val) {
    shapeMode = val;
    console.log('Shape Mode:', shapeMode);
    resetAnim();
    if (window.emitFunction) window.emitFunction('setShapeMode', val);
}
// === DROPDOWN-BASED EFFECT MANAGEMENT ===

// Effect categories and their effects
const effectCategories = {
    classic: [
        { id: 'arc', name: 'Arc', toggle: 'toggleMotionArc', intensity: 'setMotionArcIntensity', flag: 'motionArc', intensityVar: 'motionArcIntensity' },
        { id: 'diagonal', name: 'Diagonal', toggle: 'toggleMotionDiagonal', intensity: 'setMotionDiagonalIntensity', flag: 'motionDiagonal', intensityVar: 'motionDiagonalIntensity' },
        { id: 'zigzag', name: 'ZigZag', toggle: 'toggleMotionZigZag', intensity: 'setMotionZigZagIntensity', flag: 'motionZigZag', intensityVar: 'motionZigZagIntensity' },
        { id: 'bolt', name: 'Bolt', toggle: 'toggleMotionBolt', intensity: 'setMotionBoltIntensity', flag: 'motionBolt', intensityVar: 'motionBoltIntensity' },
        { id: 'bowtie', name: 'Bowtie', toggle: 'toggleMotionBowtie', intensity: 'setMotionBowtieIntensity', flag: 'motionBowtie', intensityVar: 'motionBowtieIntensity' },
        { id: 'rays', name: 'Rays', toggle: 'toggleMotionRays', intensity: 'setMotionRaysIntensity', flag: 'motionRays', intensityVar: 'motionRaysIntensity' },
        { id: 'lean', name: 'Lean', toggle: 'toggleMotionLean', intensity: 'setMotionLeanIntensity', flag: 'motionLean', intensityVar: 'motionLeanIntensity' }
    ],
    wave: [
        { id: 'spiral', name: 'Spiral', toggle: 'toggleMotionSpiral', intensity: 'setMotionSpiralIntensity', flag: 'motionSpiral', intensityVar: 'motionSpiralIntensity' },
        { id: 'wave', name: 'Wave', toggle: 'toggleMotionWave', intensity: 'setMotionWaveIntensity', flag: 'motionWave', intensityVar: 'motionWaveIntensity' },
        { id: 'ripple', name: 'Ripple', toggle: 'toggleMotionRipple', intensity: 'setMotionRippleIntensity', flag: 'motionRipple', intensityVar: 'motionRippleIntensity' },
        { id: 'twist', name: 'Twist', toggle: 'toggleMotionTwist', intensity: 'setMotionTwistIntensity', flag: 'motionTwist', intensityVar: 'motionTwistIntensity' },
        { id: 'rotate', name: 'Rotate', toggle: 'toggleMotionRotate', intensity: 'setMotionRotateIntensity', flag: 'motionRotate', intensityVar: 'motionRotateIntensity' },
        { id: 'orbit', name: 'Orbit', toggle: 'toggleMotionOrbit', intensity: 'setMotionOrbitIntensity', flag: 'motionOrbit', intensityVar: 'motionOrbitIntensity' }
    ],
    explosive: [
        { id: 'explode', name: 'Explode', toggle: 'toggleMotionExplode', intensity: 'setMotionExplodeIntensity', flag: 'motionExplode', intensityVar: 'motionExplodeIntensity' },
        { id: 'implode', name: 'Implode', toggle: 'toggleMotionImplode', intensity: 'setMotionImplodeIntensity', flag: 'motionImplode', intensityVar: 'motionImplodeIntensity' },
        { id: 'scatter', name: 'Scatter', toggle: 'toggleMotionScatter', intensity: 'setMotionScatterIntensity', flag: 'motionScatter', intensityVar: 'motionScatterIntensity' },
        { id: 'bounce', name: 'Bounce', toggle: 'toggleMotionBounce', intensity: 'setMotionBounceIntensity', flag: 'motionBounce', intensityVar: 'motionBounceIntensity' },
        { id: 'slide', name: 'Slide', toggle: 'toggleMotionSlide', intensity: 'setMotionSlideIntensity', flag: 'motionSlide', intensityVar: 'motionSlideIntensity' },
        { id: 'flip', name: 'Flip', toggle: 'toggleMotionFlip', intensity: 'setMotionFlipIntensity', flag: 'motionFlip', intensityVar: 'motionFlipIntensity' }
    ],
    distortion: [
        { id: 'pulse', name: 'Pulse', toggle: 'toggleMotionPulse', intensity: 'setMotionPulseIntensity', flag: 'motionPulse', intensityVar: 'motionPulseIntensity' },
        { id: 'shake', name: 'Shake', toggle: 'toggleMotionShake', intensity: 'setMotionShakeIntensity', flag: 'motionShake', intensityVar: 'motionShakeIntensity' },
        { id: 'glitch', name: 'Glitch', toggle: 'toggleMotionGlitch', intensity: 'setMotionGlitchIntensity', flag: 'motionGlitch', intensityVar: 'motionGlitchIntensity' }
    ]
};

let currentSelectedEffect = null;
let activeEffects = [];

// Update effect list when category changes
function updateEffectList(category) {
    const effectSelect = document.getElementById('effect-select');
    effectSelect.innerHTML = '<option value="">-- Choose an effect --</option>';

    if (!category) {
        effectSelect.disabled = true;
        return;
    }

    effectSelect.disabled = false;
    const effects = effectCategories[category];

    effects.forEach(effect => {
        const option = document.createElement('option');
        option.value = effect.id;
        option.textContent = effect.name;
        option.dataset.category = category;
        effectSelect.appendChild(option);
    });
}

// Toggle effect on/off
function toggleEffect(effectId) {
    if (!effectId) return;

    const category = document.getElementById('effect-select').selectedOptions[0].dataset.category;
    const allEffects = Object.values(effectCategories).flat();
    const effect = allEffects.find(e => e.id === effectId);

    if (!effect) return;

    // Check if effect is already active
    const isActive = window[effect.flag];

    if (isActive) {
        // Deactivate effect
        window[effect.toggle](false);
        activeEffects = activeEffects.filter(e => e.id !== effectId);
    } else {
        // Activate effect
        window[effect.toggle](true);
        activeEffects.push(effect);
        currentSelectedEffect = effect;

        // Show intensity control
        showIntensityControl(effect);
    }

    updateActiveEffectsList();

    // Reset dropdown
    document.getElementById('effect-select').value = '';

    // Emit the toggle action (remote clients will call the specific toggle function)
    if (window.emitFunction) window.emitFunction(effect.toggle, !isActive);
}

// Show intensity control for selected effect
function showIntensityControl(effect) {
    const intensityControl = document.getElementById('intensity-control');
    const intensityLabel = document.getElementById('intensity-label');
    const intensitySlider = document.getElementById('effect-intensity');
    const intensityValue = document.getElementById('intensity-value');

    intensityControl.style.display = 'block';
    intensityLabel.innerHTML = `${effect.name} Intensity <span id="intensity-value">${window[effect.intensityVar]}%</span>`;
    intensitySlider.value = window[effect.intensityVar];
    intensityValue.textContent = window[effect.intensityVar] + '%';

    // Store current effect for intensity updates
    intensitySlider.dataset.effectId = effect.id;
}

// Update effect intensity
function updateEffectIntensity(value) {
    const intensitySlider = document.getElementById('effect-intensity');
    const effectId = intensitySlider.dataset.effectId;
    const intensityValue = document.getElementById('intensity-value');

    if (!effectId) return;

    const allEffects = Object.values(effectCategories).flat();
    const effect = allEffects.find(e => e.id === effectId);

    if (effect) {
        window[effect.intensity](value);
        intensityValue.textContent = value + '%';

        if (window.emitFunction) window.emitFunction(effect.intensity, value);
    }
}

// Update active effects display
function updateActiveEffectsList() {
    const listContainer = document.getElementById('active-effects-list');

    if (activeEffects.length === 0) {
        listContainer.innerHTML = '<span style="color: #666; font-size: 0.8rem;">None</span>';
        document.getElementById('intensity-control').style.display = 'none';
        return;
    }

    listContainer.innerHTML = '';
    activeEffects.forEach(effect => {
        const badge = document.createElement('span');
        badge.style.cssText = 'background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 5px;';
        badge.innerHTML = `${effect.name} <span style="color: #f23e2e;" onclick="removeEffect('${effect.id}')">✕</span>`;
        badge.onclick = (e) => {
            if (e.target.tagName !== 'SPAN') {
                showIntensityControl(effect);
            }
        };
        listContainer.appendChild(badge);
    });
}

// Remove effect
function removeEffect(effectId) {
    const allEffects = Object.values(effectCategories).flat();
    const effect = allEffects.find(e => e.id === effectId);

    if (effect) {
        window[effect.toggle](false);
        activeEffects = activeEffects.filter(e => e.id !== effectId);
        updateActiveEffectsList();

        if (window.emitFunction) window.emitFunction(effect.toggle, false);
    }
}
