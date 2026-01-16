import React, { useState, useEffect } from 'react';
import ElasticSlider from './ElasticSlider';
import StarBorder from './StarBorder';
import StaggeredMenu from './StaggeredMenu';

// Icons for sliders
import { RiText, RiFontSize2, RiStackLine, RiSpeedLine, RiExpandWidthLine } from 'react-icons/ri';
import { MdAnimation, MdGridOn } from 'react-icons/md';

// Effect Categories Data (Mirrored from js/update.js)
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

export default function Controls({ activeStep, onUpdate, activeBackground }) {
    // Local state to track control values for UI feedback
    const [fontSize, setFontSize] = useState(70);
    const [layerCount, setLayerCount] = useState(7);
    const [animSpeed, setAnimSpeed] = useState(1);
    const [animSpread, setAnimSpread] = useState(100);
    const [animIntensity, setAnimIntensity] = useState(5);
    const [bgGridDensity, setBgGridDensity] = useState(40);
    const [bgScrollSpeed, setBgScrollSpeed] = useState(5);

    // Effect State
    const [selectedCategory, setSelectedCategory] = useState('');
    const [availableEffects, setAvailableEffects] = useState([]);
    const [activeEffects, setActiveEffects] = useState([]);
    const [currentEffectForIntensity, setCurrentEffectForIntensity] = useState(null);
    const [currentIntensity, setCurrentIntensity] = useState(100);

    // Initial sync with legacy system
    useEffect(() => {
        // You might want to pull initial values from the legacy system here if needed
        // For now, we use defaults that match index.html
    }, []);

    // Helper to dispatch global updates (interfacing with legacy js/main.js)
    const handleUpdate = (type, val) => {
        // Direct global access where possible
        if (window.app) {
            switch (type) {
                case 'fontSize':
                    window.setFontSize && window.setFontSize(val);
                    setFontSize(val);
                    break;
                case 'layerCount':
                    window.setLayerCount && window.setLayerCount(val);
                    setLayerCount(val);
                    break;
                case 'animSpeed':
                    window.setAnimSpeed && window.setAnimSpeed(val);
                    setAnimSpeed(val);
                    break;
                case 'animSpread':
                    window.setAnimSpread && window.setAnimSpread(val);
                    setAnimSpread(val);
                    break;
                case 'animIntensity':
                    window.setAnimIntensity && window.setAnimIntensity(val);
                    setAnimIntensity(val);
                    break;
                case 'bgGridDensity':
                    if (window.bgInstance) {
                        window.bgInstance.updateParams('cols', val);
                        window.bgInstance.updateParams('rows', val);
                    }
                    if (window.emitChange) window.emitChange('param', 'grid-density', val);
                    setBgGridDensity(val);
                    break;
                case 'bgScrollSpeed': {
                    const rawVal = val;
                    const speedVal = rawVal * 0.005; // Logic matched from main.js
                    if (window.bgInstance) window.bgInstance.updateParams('speed', speedVal);
                    if (window.emitChange) window.emitChange('param', 'scroll-speed', rawVal);
                    setBgScrollSpeed(val);
                    break;
                }
            }
        }
    };

    // Effect Handlers
    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        if (category && effectCategories[category]) {
            setAvailableEffects(effectCategories[category]);
        } else {
            setAvailableEffects([]);
        }
    };

    const handleEffectSelect = (e) => {
        const effectId = e.target.value;
        if (!effectId) return;

        const allEffects = Object.values(effectCategories).flat();
        const effect = allEffects.find(eff => eff.id === effectId);

        if (effect) {
            // Check if already active
            const isAlreadyActive = activeEffects.find(eff => eff.id === effectId);

            if (isAlreadyActive) {
                // Deactivate
                if (window[effect.toggle]) window[effect.toggle](false);
                setActiveEffects(prev => prev.filter(eff => eff.id !== effectId));
                if (currentEffectForIntensity && currentEffectForIntensity.id === effectId) {
                    setCurrentEffectForIntensity(null);
                }
            } else {
                // Activate
                if (window[effect.toggle]) window[effect.toggle](true);
                setActiveEffects(prev => [...prev, effect]);
                setCurrentEffectForIntensity(effect);

                // Get current intensity from global if possible, else default 100
                const globalVal = window[effect.intensityVar];
                setCurrentIntensity(globalVal !== undefined ? globalVal : 100);
            }
        }

        // Reset selector
        e.target.value = '';
    };

    const handleRemoveEffect = (effectId) => {
        const allEffects = Object.values(effectCategories).flat();
        const effect = allEffects.find(eff => eff.id === effectId);
        if (effect) {
            if (window[effect.toggle]) window[effect.toggle](false);
            setActiveEffects(prev => prev.filter(eff => eff.id !== effectId));
            if (currentEffectForIntensity && currentEffectForIntensity.id === effectId) {
                setCurrentEffectForIntensity(null);
            }
        }
    };

    const handleIntensityChange = (val) => {
        setCurrentIntensity(val);
        if (currentEffectForIntensity) {
            const funcName = currentEffectForIntensity.intensity;
            if (window[funcName]) window[funcName](val);
        }
    };

    // Switch between steps
    const handleStepClick = (step) => {
        if (window.app && window.app.setStep) {
            window.app.setStep(step);
        }
    };

    if (activeStep !== 1 && activeStep !== 2 && activeStep !== 3) return null;

    return (
        <StaggeredMenu
            colors={['#0d0d0d', '#1a1a1a', '#262626']}
            menuButtonColor="#ffffff"
            openMenuButtonColor="#f23e2e"
        >
            {/* Logo Section */}
            <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <img
                    src="/assets/Colab Logo White.svg"
                    alt="Colab"
                    style={{
                        width: '85%',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                        opacity: 0.95
                    }}
                />
            </div>

            {/* Scrollable Main Area (Controls) */}
            <div style={{
                flex: 1, // Fill remaining space
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                // Space for the chat widget at the bottom (which is fixed ~250-300px height)
                paddingBottom: '300px'
            }}>

                {/* Global Controls Section */}
                <div style={{ paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <StarBorder
                        as="button"
                        color="#00ffcc"
                        speed="3s"
                        onClick={() => window.savePoster && window.savePoster()}
                        style={{ width: '100%', fontSize: '0.9rem' }}
                    >
                        SAVE POSTER
                    </StarBorder>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                            type="checkbox"
                            onChange={(e) => window.togglePosterMode && window.togglePosterMode(e.target.checked)}
                            style={{ accentColor: '#00ffcc', width: '16px', height: '16px' }}
                        />
                        Poster Mode
                    </label>
                </div>

                {/* Step Navigation Tabs */}
                <div style={{ display: 'flex', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => handleStepClick(1)}
                        style={{
                            background: activeStep === 1 ? '#f23e2e' : 'transparent',
                            color: activeStep === 1 ? 'white' : '#aaa',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                        }}
                    >
                        SCENE
                    </button>
                    <button
                        onClick={() => handleStepClick(2)}
                        style={{
                            background: activeStep === 2 ? '#f23e2e' : 'transparent',
                            color: activeStep === 2 ? 'white' : '#aaa',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                        }}
                    >
                        TYPE
                    </button>
                    <button
                        onClick={() => handleStepClick(3)}
                        style={{
                            background: activeStep === 3 ? '#f23e2e' : 'transparent',
                            color: activeStep === 3 ? 'white' : '#aaa',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                        }}
                    >
                        AUDIO
                    </button>
                </div>

                {activeStep === 1 && (
                    <div className="controls-section">
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Background Settings</h3>

                        {/* Background Selector */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '5px', opacity: 0.8 }}>Type</label>
                            <select
                                onChange={(e) => {
                                    const legacySelect = document.getElementById('bg-type-select');
                                    if (legacySelect) {
                                        legacySelect.value = e.target.value;
                                        legacySelect.dispatchEvent(new Event('change'));
                                    }
                                }}
                                value={activeBackground || 'wireframe'} // Controlled component
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="wireframe">Wireframe (p5.js)</option>
                                <option value="color_bends">Color Bends (React)</option>
                                <option value="dark_veil">Dark Veil (React)</option>
                                <option value="dither">Dither (React)</option>
                                <option value="starfield">StarField (React)</option>
                                <option value="aurora">Aurora (React)</option>
                                <option value="blocks">Blocks (React)</option>
                                <option value="particles">Particles (React)</option>
                                <option value="silk">Silk (React)</option>
                                <option value="spline">Spline 3D (React)</option>
                                <option value="spline_new">Spline (New)</option>
                                <option value="none">None</option>
                            </select>
                        </div>

                        {/* Wireframe Distortion Toggle */}
                        {(!activeBackground || activeBackground === 'wireframe') && bgGridDensity > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <button
                                    onClick={() => {
                                        const btn = document.getElementById('toggle-distortion');
                                        if (btn) btn.click();
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Toggle Wireframe Distortion
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {(!activeBackground || activeBackground === 'wireframe') && (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Grid</span>
                                        <ElasticSlider
                                            defaultValue={bgGridDensity}
                                            startingValue={10}
                                            maxValue={100}
                                            stepSize={5}
                                            isStepped
                                            leftIcon={<MdGridOn size={16} />}
                                            rightIcon={<MdGridOn size={24} />}
                                            onChange={(val) => handleUpdate('bgGridDensity', val)}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Speed</span>
                                        <ElasticSlider
                                            defaultValue={bgScrollSpeed}
                                            startingValue={1}
                                            maxValue={20}
                                            leftIcon={<RiSpeedLine size={16} />}
                                            rightIcon={<RiSpeedLine size={24} />}
                                            onChange={(val) => handleUpdate('bgScrollSpeed', val)}
                                            className="custom-slider"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeStep === 2 && (
                    <div className="controls-section">
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Typography Settings</h3>

                        {/* Text Input */}
                        <div style={{ marginBottom: '15px' }}>
                            <textarea
                                defaultValue={`Colab\nExperiment Together`}
                                onChange={(e) => {
                                    // Sync with existing logic
                                    const textArea = document.getElementById('textArea');
                                    if (textArea) {
                                        textArea.value = e.target.value;
                                        // Manually trigger the setText global function
                                        if (window.setText) window.setText();
                                    }
                                }}
                                rows="2"
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Foreground Color */}
                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Foreground Color</span>
                            <input
                                type="color"
                                defaultValue="#ffffff"
                                onChange={(e) => {
                                    window.setForeColor && window.setForeColor(e.target.value);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            {/* Size */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Size</label>
                                <ElasticSlider
                                    defaultValue={fontSize}
                                    startingValue={10}
                                    maxValue={200}
                                    leftIcon={<RiFontSize2 size={16} />}
                                    rightIcon={<RiFontSize2 size={24} />}
                                    onChange={(val) => handleUpdate('fontSize', val)}
                                />
                            </div>

                            {/* Layers */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Depth</label>
                                <ElasticSlider
                                    defaultValue={layerCount}
                                    startingValue={1}
                                    maxValue={15}
                                    isStepped
                                    stepSize={1}
                                    leftIcon={<RiStackLine size={16} />}
                                    rightIcon={<RiStackLine size={24} />}
                                    onChange={(val) => handleUpdate('layerCount', val)}
                                />
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>

                        {/* Effects & Shapes */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Shape & Effects</h3>

                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '5px', opacity: 0.8 }}>Shape Layout</label>
                            <select
                                onChange={(e) => window.setShapeMode && window.setShapeMode(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '4px',
                                    marginBottom: '15px'
                                }}
                            >
                                <option value="none">None (Linear)</option>
                                <option value="circle">Circle</option>
                                <option value="rectangle">Rectangle Grid</option>
                                <option value="triangle">Triangle</option>
                                <option value="star">Star</option>
                                <option value="spiral">Spiral</option>
                            </select>

                            {/* React-Driven Effects Controls */}
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '5px', opacity: 0.8 }}>Effect Category</label>
                            <select
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '4px',
                                    marginBottom: '10px'
                                }}
                            >
                                <option value="">-- Select Category --</option>
                                <option value="classic">Classic Patterns</option>
                                <option value="wave">Wave & Rotation</option>
                                <option value="explosive">Explosive & Dynamic</option>
                                <option value="distortion">Distortion</option>
                            </select>

                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '5px', opacity: 0.8 }}>Select Effect</label>
                            <select
                                onChange={handleEffectSelect}
                                disabled={availableEffects.length === 0}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: availableEffects.length === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)',
                                    color: availableEffects.length === 0 ? '#666' : 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '4px'
                                }}
                            >
                                <option value="">-- Choose to Add/Remove --</option>
                                {availableEffects.map(eff => (
                                    <option key={eff.id} value={eff.id}>
                                        {activeEffects.find(a => a.id === eff.id) ? '✓ ' : ''}{eff.name}
                                    </option>
                                ))}
                            </select>

                            {/* Active Effects Tags */}
                            <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {activeEffects.length === 0 && <span style={{ fontSize: '0.8rem', color: '#666' }}>No active effects</span>}
                                {activeEffects.map(eff => (
                                    <div
                                        key={eff.id}
                                        onClick={() => setCurrentEffectForIntensity(eff)}
                                        style={{
                                            background: currentEffectForIntensity?.id === eff.id ? 'rgba(242, 62, 46, 0.4)' : 'rgba(255,255,255,0.1)',
                                            border: currentEffectForIntensity?.id === eff.id ? '1px solid #f23e2e' : '1px solid transparent',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        {eff.name}
                                        <span
                                            onClick={(e) => { e.stopPropagation(); handleRemoveEffect(eff.id); }}
                                            style={{ color: '#f23e2e', fontWeight: 'bold' }}
                                        >×</span>
                                    </div>
                                ))}
                            </div>

                            {/* Dynamic Intensity Slider */}
                            {currentEffectForIntensity && (
                                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{currentEffectForIntensity.name} Intensity</span>
                                        <span style={{ fontSize: '0.8rem' }}>{currentIntensity}%</span>
                                    </div>

                                    {/* Using standard range input here for simplicity and fine control matching legacy */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={currentIntensity}
                                        onChange={(e) => handleIntensityChange(e.target.value)}
                                        style={{ width: '100%', accentColor: '#f23e2e' }}
                                    />
                                </div>
                            )}
                        </div>

                        <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Animation</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ minWidth: '60px', fontSize: '0.8rem' }}>Speed</span>
                                <ElasticSlider
                                    defaultValue={animSpeed}
                                    startingValue={0.5}
                                    maxValue={3}
                                    stepSize={0.1}
                                    leftIcon={<RiSpeedLine size={16} />}
                                    rightIcon={<RiSpeedLine size={24} />}
                                    onChange={(val) => handleUpdate('animSpeed', val)}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ minWidth: '60px', fontSize: '0.8rem' }}>Spread</span>
                                <ElasticSlider
                                    defaultValue={animSpread}
                                    startingValue={0}
                                    maxValue={200}
                                    leftIcon={<RiExpandWidthLine size={16} />}
                                    rightIcon={<RiExpandWidthLine size={24} />}
                                    onChange={(val) => handleUpdate('animSpread', val)}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ minWidth: '60px', fontSize: '0.8rem' }}>Intensity</span>
                                <ElasticSlider
                                    defaultValue={animIntensity}
                                    startingValue={1}
                                    maxValue={10}
                                    leftIcon={<MdAnimation size={16} />}
                                    rightIcon={<MdAnimation size={24} />}
                                    onChange={(val) => handleUpdate('animIntensity', val)}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {activeStep === 3 && (
                    <div className="controls-section">
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Audio Controls</h3>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '150px',
                            gap: '15px'
                        }}>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Background Audio</p>

                            <StarBorder
                                as="button"
                                color="#f23e2e"
                                speed="5s"
                                onClick={() => {
                                    // Toggle audio using existing logic
                                    const playBtn = document.getElementById('play-audio');
                                    if (playBtn) playBtn.click();
                                }}
                                style={{ minWidth: '150px' }}
                            >
                                PLAY / PAUSE
                            </StarBorder>

                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
                                (Audio module is loaded via legacy script)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </StaggeredMenu>
    );
}
