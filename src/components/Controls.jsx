import { useState, useEffect } from 'react';
import ElasticSlider from './ElasticSlider';
import StarBorder from './StarBorder';
import StaggeredMenu from './StaggeredMenu';
import { Leva } from 'leva';

// Icons for sliders
import { RiFontSize2, RiStackLine, RiSpeedLine, RiExpandWidthLine, RiExpandHeightLine } from "react-icons/ri";
import { filterProfanity } from '../utils/profanityFilter';
import { MdAnimation, MdGridOn } from 'react-icons/md';
import { RiUploadCloud2Line } from "react-icons/ri";
import recorder from '../utils/RecorderManager';

const uiStyles = {
    control: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#eee',
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '0.85rem',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit'
    },
    button: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#eee',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        transition: 'all 0.2s',
        textAlign: 'center'
    },
    label: {
        fontSize: '0.8rem',
        color: '#888',
        marginBottom: '6px',
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    sectionTitle: {
        fontSize: '0.9rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#ccc',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '8px'
    }
};

// Effect Categories Data (Mirrored from js/update.js)
const effectCategories = {
    classic: [
        { id: 'arc', name: 'Arc', toggle: 'toggleMotionArc', intensity: 'setMotionArcIntensity', flag: 'motionArc', intensityVar: 'motionArcIntensity' }
    ]
};

export default function Controls({ activeStep, activeApp, onSwitchApp, activeBackground, shapes, addShape, clearShapes, shapeSettings, setShapeSettings, particleSettings, setParticleSettings, silkSettings, setSilkSettings, starfieldSettings, setStarfieldSettings, auroraSettings, setAuroraSettings, darkVeilSettings, setDarkVeilSettings, ditherSettings, setDitherSettings, blocksSettings, setBlocksSettings, paintSettings, setPaintSettings, paintToysSettings, setPaintToysSettings, stringTypeSettings, setStringTypeSettings, activeTypeMode, setActiveTypeMode, textContent, setTextContent, asciiSettings, setAsciiSettings }) {
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
            openMenuButtonColor="#E5B020"
        >
            {/* Navigation Buttons (Replaces Logo) */}
            <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                gap: '10px',
                justifyContent: 'center'
            }}>
                <button
                    onClick={() => onSwitchApp('typeflow')}
                    style={{
                        background: activeApp === 'typeflow' ? '#E5B020' : 'rgba(255,255,255,0.1)',
                        color: activeApp === 'typeflow' ? '#000' : '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        flex: 1,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Create
                </button>
                <button
                    onClick={() => onSwitchApp('community')}
                    style={{
                        background: activeApp === 'community' ? '#E5B020' : 'rgba(255,255,255,0.1)',
                        color: activeApp === 'community' ? '#000' : '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        flex: 1,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Community
                </button>
            </div>

            {/* Fixed Controls (Save/Publish) */}
            <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'rgba(0,0,0,0.2)' // Slight darker bg to separate
            }}>
                <div style={{ display: 'flex', gap: '10px' }}>


                    <StarBorder
                        as="button"
                        color="#20E5B0"
                        speed="3s"
                        onClick={async () => {
                            const author = prompt("Enter your name:", "Anonymous");
                            if (!author) return;
                            const title = prompt("Enter a title for your poster:", "Untitled");
                            if (!title) return;

                            const btn = document.activeElement;
                            const originalText = btn.innerText;
                            // Ensure button is found - sometimes activeElement is body if clicked div
                            // But StarBorder renders as button here.
                            if (btn && btn.tagName === 'BUTTON') {
                                btn.innerText = "REC...";
                                btn.disabled = true;
                            }

                            recorder.startRecording(4000, async (blob) => {
                                if (btn && btn.tagName === 'BUTTON') btn.innerText = "UP...";

                                // Convert Blob to Base64
                                const reader = new FileReader();
                                reader.readAsDataURL(blob);
                                reader.onloadend = async () => {
                                    const base64Video = reader.result;

                                    // Collect State
                                    const appState = {
                                        activeBackground,
                                        activeTypeMode,
                                        textContent,
                                        settings: {
                                            shapeSettings,
                                            particleSettings,
                                            silkSettings,
                                            starfieldSettings,
                                            auroraSettings,
                                            darkVeilSettings,
                                            ditherSettings,
                                            blocksSettings,
                                            paintSettings,
                                            paintToysSettings,
                                            stringTypeSettings,
                                            asciiSettings,
                                            fontSize,
                                            layerCount,
                                            animSpeed,
                                            animSpread,
                                            animIntensity,
                                            bgGridDensity,
                                            bgScrollSpeed
                                        }
                                    };

                                    try {
                                        const res = await fetch('/api/posters', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                author,
                                                title,
                                                text: textContent,
                                                video: base64Video,
                                                state: appState
                                            })
                                        });

                                        if (res.ok) {
                                            alert("Published!");
                                        } else {
                                            const err = await res.json();
                                            alert("Failed: " + err.error);
                                        }
                                    } catch (error) {
                                        console.error("Upload failed", error);
                                        alert("Error uploading.");
                                    } finally {
                                        if (btn && btn.tagName === 'BUTTON') {
                                            btn.innerText = "PUBLISH";
                                            btn.disabled = false;
                                        }
                                    }
                                };
                            });
                        }}
                        style={{ flex: 1, fontSize: '0.8rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <RiUploadCloud2Line size={16} />
                            PUBLISH
                        </div>
                    </StarBorder>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.8rem', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        onChange={(e) => window.togglePosterMode && window.togglePosterMode(e.target.checked)}
                        style={{ accentColor: '#E5B020', width: '14px', height: '14px' }}
                    />
                    Poster Mode
                </label>
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

                {/* Step Navigation Tabs */}
                <div style={{ display: 'flex', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => handleStepClick(1)}
                        style={{
                            background: activeStep === 1 ? '#E5B020' : 'transparent',
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
                            background: activeStep === 2 ? '#E5B020' : 'transparent',
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
                            background: activeStep === 3 ? '#E5B020' : 'transparent',
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
                        <h3 style={uiStyles.sectionTitle}>Background Settings</h3>

                        {/* Background Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px',
                            marginBottom: '20px'
                        }}>
                            {[
                                { id: 'starfield', label: 'Starfield', color: '#000033' },
                                { id: 'wireframe', label: 'Wireframe', color: '#111111' },
                                { id: 'color_bends', label: 'Color Bends', color: '#220022' },
                                { id: 'dark_veil', label: 'Dark Veil', color: '#001100' },
                                { id: 'dither', label: 'Dither', color: '#111122' },
                                { id: 'aurora', label: 'Aurora', color: '#002222' },
                                { id: 'silk', label: 'Silk', color: '#222200' },
                                { id: 'spline_new', label: 'Spline New', color: '#112211' },
                            ].map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => {
                                        const legacySelect = document.getElementById('bg-type-select');
                                        if (legacySelect) {
                                            legacySelect.value = bg.id;
                                            legacySelect.dispatchEvent(new Event('change'));
                                        }
                                        // Also directly call props update if available/needed, 
                                        // but the select change should trigger the state update loop via legacy listeners if set up that way.
                                        // Assuming App.jsx updates activeBackground based on legacy or internal state.
                                        // Since prompt uses controlled component pattern:
                                        if (window.app && window.app.setBackgroundReference) window.app.setBackgroundReference(bg.id);
                                    }}
                                    style={{
                                        aspectRatio: '1',
                                        background: bg.color,
                                        border: activeBackground === bg.id ? '2px solid #E5B020' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        padding: '5px',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                    title={bg.label}
                                >
                                    <span style={{
                                        fontSize: '0.65rem',
                                        color: '#fff',
                                        textAlign: 'center',
                                        marginTop: 'auto',
                                        marginBottom: 'auto',
                                        fontWeight: activeBackground === bg.id ? 'bold' : 'normal',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                    }}>
                                        {bg.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Leva Controls Panel */}
                        <div id="leva-custom-container" style={{
                            position: 'relative',
                            minHeight: '50px',
                            marginBottom: '20px'
                        }}>
                            <Leva
                                hidden
                                fill
                                flat
                                titleBar={false}
                                theme={{
                                    colors: {
                                        elevation1: '#1a1a1a', // Transparent/Match sidebar
                                        elevation2: '#1a1a1a', // Flatten hierarchy
                                        elevation3: '#1a1a1a',
                                        accent1: '#E5B020',
                                        accent2: '#E5B020',
                                        accent3: '#E5B020',
                                        highlight1: '#555',
                                        highlight2: '#777',
                                        highlight3: '#999',
                                        vator: '#333',
                                        label: '#bbb',
                                    },
                                    sizes: {
                                        fontSize: '13px',
                                        rowHeight: '36px',
                                        titleBarHeight: '36px',
                                    },
                                    fonts: {
                                        mono: "'Helvetica Neue', Arial, sans-serif",
                                        sans: "'Helvetica Neue', Arial, sans-serif"
                                    },
                                    radii: {
                                        grid: 6,
                                        row: 6
                                    }
                                }}
                            />
                        </div>

                        {/* Wireframe Distortion Toggle */}
                        {(!activeBackground || activeBackground === 'wireframe') && bgGridDensity > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <button
                                    onClick={() => {
                                        const btn = document.getElementById('toggle-distortion');
                                        if (btn) btn.click();
                                    }}
                                    style={{ ...uiStyles.button, width: '100%' }}
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

                            {/* Particle Controls */}
                            {activeBackground === 'particles' && particleSettings && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Count</span>
                                        <ElasticSlider
                                            defaultValue={particleSettings.count}
                                            startingValue={50}
                                            maxValue={500}
                                            stepSize={25}
                                            isStepped
                                            leftIcon={<RiStackLine size={16} />}
                                            rightIcon={<RiStackLine size={24} />}
                                            onChange={(val) => setParticleSettings({ ...particleSettings, count: val })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Size</span>
                                        <ElasticSlider
                                            defaultValue={particleSettings.size * 100}
                                            startingValue={5}
                                            maxValue={100}
                                            stepSize={5}
                                            leftIcon={<RiExpandWidthLine size={16} />}
                                            rightIcon={<RiExpandWidthLine size={24} />}
                                            onChange={(val) => setParticleSettings({ ...particleSettings, size: val / 100 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Speed</span>
                                        <ElasticSlider
                                            defaultValue={particleSettings.speed * 20}
                                            startingValue={2}
                                            maxValue={100}
                                            stepSize={2}
                                            leftIcon={<RiSpeedLine size={16} />}
                                            rightIcon={<RiSpeedLine size={24} />}
                                            onChange={(val) => setParticleSettings({ ...particleSettings, speed: val / 20 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Color</span>
                                        <input
                                            type="color"
                                            value={particleSettings.color}
                                            onChange={(e) => setParticleSettings({ ...particleSettings, color: e.target.value })}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                width: '40px',
                                                height: '40px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Silk Controls */}
                            {activeBackground === 'silk' && silkSettings && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Speed</span>
                                        <ElasticSlider
                                            defaultValue={silkSettings.speed}
                                            startingValue={0.1}
                                            maxValue={20}
                                            stepSize={0.5}
                                            leftIcon={<RiSpeedLine size={16} />}
                                            rightIcon={<RiSpeedLine size={24} />}
                                            onChange={(val) => setSilkSettings({ ...silkSettings, speed: val })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Scale</span>
                                        <ElasticSlider
                                            defaultValue={silkSettings.scale * 10}
                                            startingValue={1}
                                            maxValue={50}
                                            stepSize={1}
                                            leftIcon={<RiExpandWidthLine size={16} />}
                                            rightIcon={<RiExpandWidthLine size={24} />}
                                            onChange={(val) => setSilkSettings({ ...silkSettings, scale: val / 10 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Noise</span>
                                        <ElasticSlider
                                            defaultValue={silkSettings.noiseIntensity * 20}
                                            startingValue={0}
                                            maxValue={100}
                                            stepSize={5}
                                            leftIcon={<MdAnimation size={16} />}
                                            rightIcon={<MdAnimation size={24} />}
                                            onChange={(val) => setSilkSettings({ ...silkSettings, noiseIntensity: val / 20 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Color</span>
                                        <input
                                            type="color"
                                            value={silkSettings.color}
                                            onChange={(e) => setSilkSettings({ ...silkSettings, color: e.target.value })}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                width: '40px',
                                                height: '40px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                            {/* Starfield Controls */}
                            {activeBackground === 'starfield' && starfieldSettings && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Count</span>
                                        <ElasticSlider
                                            defaultValue={starfieldSettings.count}
                                            startingValue={1000}
                                            maxValue={20000}
                                            stepSize={100}
                                            isStepped
                                            leftIcon={<RiStackLine size={16} />}
                                            rightIcon={<RiStackLine size={24} />}
                                            onChange={(val) => setStarfieldSettings({ ...starfieldSettings, count: val })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Radius</span>
                                        <ElasticSlider
                                            defaultValue={starfieldSettings.radius * 10}
                                            startingValue={5}
                                            maxValue={50}
                                            stepSize={1}
                                            leftIcon={<RiExpandWidthLine size={16} />}
                                            rightIcon={<RiExpandWidthLine size={24} />}
                                            onChange={(val) => setStarfieldSettings({ ...starfieldSettings, radius: val / 10 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Speed</span>
                                        <ElasticSlider
                                            defaultValue={starfieldSettings.speed * 10}
                                            startingValue={0}
                                            maxValue={50}
                                            stepSize={1}
                                            leftIcon={<RiSpeedLine size={16} />}
                                            rightIcon={<RiSpeedLine size={24} />}
                                            onChange={(val) => setStarfieldSettings({ ...starfieldSettings, speed: val / 10 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Size</span>
                                        <ElasticSlider
                                            defaultValue={starfieldSettings.size * 1000}
                                            startingValue={1}
                                            maxValue={50}
                                            stepSize={1}
                                            leftIcon={<RiExpandWidthLine size={16} />}
                                            rightIcon={<RiExpandWidthLine size={24} />}
                                            onChange={(val) => setStarfieldSettings({ ...starfieldSettings, size: val / 1000 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Color</span>
                                        <input
                                            type="color"
                                            value={starfieldSettings.color}
                                            onChange={(e) => setStarfieldSettings({ ...starfieldSettings, color: e.target.value })}
                                            style={{ background: 'none', border: 'none', width: '40px', height: '40px', cursor: 'pointer' }}
                                        />
                                    </div>
                                </>
                            )}
                            {/* Aurora Controls */}
                            {activeBackground === 'aurora' && auroraSettings && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Speed</span>
                                        <ElasticSlider
                                            defaultValue={auroraSettings.speed}
                                            startingValue={2}
                                            maxValue={30}
                                            stepSize={1}
                                            leftIcon={<RiSpeedLine size={16} />}
                                            rightIcon={<RiSpeedLine size={24} />}
                                            onChange={(val) => setAuroraSettings({ ...auroraSettings, speed: val })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Blob Size</span>
                                        <ElasticSlider
                                            defaultValue={auroraSettings.blobSize}
                                            startingValue={30}
                                            maxValue={100}
                                            stepSize={5}
                                            isStepped
                                            leftIcon={<RiExpandWidthLine size={16} />}
                                            rightIcon={<RiExpandWidthLine size={24} />}
                                            onChange={(val) => setAuroraSettings({ ...auroraSettings, blobSize: val })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ fontSize: '0.7em', color: '#888' }}>Color {i}</span>
                                                <input
                                                    type="color"
                                                    value={auroraSettings[`color${i}`]}
                                                    onChange={(e) => setAuroraSettings({ ...auroraSettings, [`color${i}`]: e.target.value })}
                                                    style={{ background: 'none', border: 'none', width: '30px', height: '30px', cursor: 'pointer' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Background</span>
                                        <input
                                            type="color"
                                            value={auroraSettings.bg}
                                            onChange={(e) => setAuroraSettings({ ...auroraSettings, bg: e.target.value })}
                                            style={{ background: 'none', border: 'none', width: '40px', height: '40px', cursor: 'pointer' }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Dark Veil Controls */}
                            {activeBackground === 'dark_veil' && darkVeilSettings && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Density</span>
                                        <ElasticSlider
                                            defaultValue={darkVeilSettings.density * 10}
                                            startingValue={1}
                                            maxValue={30}
                                            stepSize={1}
                                            leftIcon={<RiStackLine size={16} />}
                                            rightIcon={<RiStackLine size={24} />}
                                            onChange={(val) => setDarkVeilSettings({ ...darkVeilSettings, density: val / 10 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Speed</span>
                                        <ElasticSlider
                                            defaultValue={darkVeilSettings.speed * 10}
                                            startingValue={0}
                                            maxValue={20}
                                            stepSize={1}
                                            leftIcon={<RiSpeedLine size={16} />}
                                            rightIcon={<RiSpeedLine size={24} />}
                                            onChange={(val) => setDarkVeilSettings({ ...darkVeilSettings, speed: val / 10 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontSize: '0.7em', color: '#888' }}>Base</span>
                                            <input
                                                type="color"
                                                value={darkVeilSettings.baseColor}
                                                onChange={(e) => setDarkVeilSettings({ ...darkVeilSettings, baseColor: e.target.value })}
                                                style={{ background: 'none', border: 'none', width: '30px', height: '30px', cursor: 'pointer' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontSize: '0.7em', color: '#888' }}>Veil</span>
                                            <input
                                                type="color"
                                                value={darkVeilSettings.veilColor}
                                                onChange={(e) => setDarkVeilSettings({ ...darkVeilSettings, veilColor: e.target.value })}
                                                style={{ background: 'none', border: 'none', width: '30px', height: '30px', cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Dither Controls */}
                            {activeBackground === 'dither' && ditherSettings && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Pixel Size</span>
                                        <ElasticSlider
                                            defaultValue={ditherSettings.pixelSize}
                                            startingValue={2}
                                            maxValue={256}
                                            stepSize={2}
                                            isStepped
                                            leftIcon={<MdGridOn size={16} />}
                                            rightIcon={<MdGridOn size={24} />}
                                            onChange={(val) => setDitherSettings({ ...ditherSettings, pixelSize: val })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontSize: '0.7em', color: '#888' }}>Color A</span>
                                            <input
                                                type="color"
                                                value={ditherSettings.color1}
                                                onChange={(e) => setDitherSettings({ ...ditherSettings, color1: e.target.value })}
                                                style={{ background: 'none', border: 'none', width: '30px', height: '30px', cursor: 'pointer' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontSize: '0.7em', color: '#888' }}>Color B</span>
                                            <input
                                                type="color"
                                                value={ditherSettings.color2}
                                                onChange={(e) => setDitherSettings({ ...ditherSettings, color2: e.target.value })}
                                                style={{ background: 'none', border: 'none', width: '30px', height: '30px', cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Blocks Controls */}
                            {activeBackground === 'blocks' && blocksSettings && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Scale</span>
                                        <ElasticSlider
                                            defaultValue={blocksSettings.scale * 10}
                                            startingValue={5}
                                            maxValue={30}
                                            stepSize={1}
                                            leftIcon={<RiExpandWidthLine size={16} />}
                                            rightIcon={<RiExpandWidthLine size={24} />}
                                            onChange={(val) => setBlocksSettings({ ...blocksSettings, scale: val / 10 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '80px', fontSize: '0.8rem' }}>Speed</span>
                                        <ElasticSlider
                                            defaultValue={blocksSettings.speed * 10}
                                            startingValue={1}
                                            maxValue={50}
                                            stepSize={1}
                                            leftIcon={<RiSpeedLine size={16} />}
                                            rightIcon={<RiSpeedLine size={24} />}
                                            onChange={(val) => setBlocksSettings({ ...blocksSettings, speed: val / 10 })}
                                            className="custom-slider"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontSize: '0.7em', color: '#888' }}>Default</span>
                                            <input
                                                type="color"
                                                value={blocksSettings.defaultColor}
                                                onChange={(e) => setBlocksSettings({ ...blocksSettings, defaultColor: e.target.value })}
                                                style={{ background: 'none', border: 'none', width: '30px', height: '30px', cursor: 'pointer' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontSize: '0.7em', color: '#888' }}>Hover</span>
                                            <input
                                                type="color"
                                                value={blocksSettings.hoveredColor}
                                                onChange={(e) => setBlocksSettings({ ...blocksSettings, hoveredColor: e.target.value })}
                                                style={{ background: 'none', border: 'none', width: '30px', height: '30px', cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                            <h3 style={uiStyles.sectionTitle}>Background Shapes</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
                                <button onClick={() => addShape('circle')} style={uiStyles.button}>+ Circle</button>
                                <button onClick={() => addShape('rectangle')} style={uiStyles.button}>+ Rect</button>
                                <button onClick={() => addShape('triangle')} style={uiStyles.button}>+ Triangle</button>
                                <button onClick={() => addShape('star')} style={uiStyles.button}>+ Star</button>
                                <button onClick={() => addShape('spiral')} style={uiStyles.button}>+ Spiral</button>
                            </div>

                            {shapes.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>

                                    {/* Shape Speed */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '60px', fontSize: '0.8rem' }}>Speed</span>
                                        <ElasticSlider
                                            defaultValue={shapeSettings.speed}
                                            startingValue={5} // Fast rotation
                                            maxValue={60} // Slow rotation
                                            stepSize={1}
                                            leftIcon={<RiSpeedLine size={16} />}
                                            rightIcon={<RiSpeedLine size={24} />}
                                            // Inverted logic: faster speed means lower duration. 
                                            // But slider usually means "More Speed" -> "Less Duration".
                                            // Currently storing 'speed' as DURATION (seconds).
                                            // So let's treat this slider as "Duration" for now or invert it. 
                                            // User asked for "Speed".
                                            // Let's keep it simple: Slider Value = Duration in Seconds. Low value = Fast.
                                            onChange={(val) => setShapeSettings({ ...shapeSettings, speed: val })}
                                        />
                                    </div>

                                    {/* Shape Size */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '60px', fontSize: '0.8rem' }}>Size</span>
                                        <ElasticSlider
                                            defaultValue={shapeSettings.size * 100}
                                            startingValue={20}
                                            maxValue={300}
                                            stepSize={10}
                                            leftIcon={<RiExpandWidthLine size={16} />}
                                            rightIcon={<RiExpandWidthLine size={24} />}
                                            onChange={(val) => setShapeSettings({ ...shapeSettings, size: val / 100 })}
                                        />
                                    </div>

                                    {/* Shape Fill */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ minWidth: '60px', fontSize: '0.8rem' }}>Fill</span>
                                        <ElasticSlider
                                            defaultValue={shapeSettings.fillOpacity * 100}
                                            startingValue={0}
                                            maxValue={100}
                                            stepSize={5}
                                            leftIcon={<RiStackLine size={16} />}
                                            rightIcon={<RiStackLine size={24} />}
                                            onChange={(val) => setShapeSettings({ ...shapeSettings, fillOpacity: val / 100 })}
                                        />
                                    </div>
                                </div>
                            )}

                            {shapes.length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{shapes.length} active shapes</span>
                                    <button
                                        onClick={clearShapes}
                                        style={{
                                            ...uiStyles.button,
                                            background: 'rgba(229, 176, 32, 0.1)',
                                            color: '#E5B020',
                                            borderColor: '#E5B020'
                                        }}
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeStep === 2 && (
                    <div className="controls-section">
                        <h3 style={uiStyles.sectionTitle}>Typography Settings</h3>

                        {/* Type Mode Selector */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={uiStyles.label}>Mode</label>
                            <select
                                value={activeTypeMode || 'classic'}
                                onChange={(e) => setActiveTypeMode(e.target.value)}
                                style={uiStyles.control}
                            >
                                <option value="classic">Classic (2D)</option>
                                <option value="ascii">ASCII (3D)</option>
                                <option value="paint_toys">Paint (Toys)</option>
                                <option value="string_type">String Type</option>
                            </select>
                        </div>

                        {/* Text Input */}
                        <div style={{ marginBottom: '15px' }}>
                            <textarea
                                value={textContent || ''} // Controlled component
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const filtered = filterProfanity(val);
                                    setTextContent(filtered);

                                    // Sync with legacy system ONLY in classic mode
                                    // In ASCII mode, React state is the source of truth
                                    if (activeTypeMode === 'classic') {
                                        const textArea = document.getElementById('textArea');
                                        if (textArea) {
                                            textArea.value = filtered;
                                            // Manually trigger the setText global function
                                            if (window.setText) window.setText();
                                        }
                                    }
                                }}
                                rows="2"
                                style={{ ...uiStyles.control, resize: 'vertical' }}
                            />
                        </div>

                        {/* Foreground Color (Classic Only) */}
                        {activeTypeMode === 'classic' && (
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
                        )}

                        {/* Font Selector (Classic Only) */}
                        {activeTypeMode === 'classic' && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '0.75rem', opacity: 0.7, display: 'block', marginBottom: '8px' }}>Font</label>
                                <select
                                    defaultValue="0"
                                    onChange={(e) => {
                                        window.setFont && window.setFont(parseInt(e.target.value));
                                    }}
                                    style={uiStyles.control}
                                >
                                    <optgroup label="Display Fonts">
                                        <option value="0">Bebas Neue</option>
                                        <option value="1">Staatliches</option>
                                        <option value="2">Orbitron</option>
                                        <option value="3">Monoton</option>
                                        <option value="4">Rubik Mono One</option>
                                        <option value="5">Fredoka</option>
                                        <option value="6">Permanent Marker</option>
                                        <option value="7">Lobster</option>
                                        <option value="8">Dela Gothic One</option>
                                        <option value="9">Ultra</option>
                                    </optgroup>
                                    <optgroup label="System Fonts">
                                        <option value="10">Inter</option>
                                        <option value="11">Arial Black</option>
                                        <option value="12">Times New Roman</option>
                                        <option value="13">Courier New</option>
                                        <option value="14">Helvetica</option>
                                    </optgroup>
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            {activeTypeMode === 'classic' ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    {/* ASCII Specific Controls */}
                                    {activeTypeMode === 'ascii' && (
                                        <>
                                            {/* Scale (Plane Height) */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Scale</label>
                                                <ElasticSlider
                                                    defaultValue={asciiSettings.planeBaseHeight}
                                                    startingValue={2}
                                                    maxValue={20}
                                                    stepSize={0.5}
                                                    leftIcon={<RiExpandWidthLine size={16} />}
                                                    rightIcon={<RiExpandWidthLine size={24} />}
                                                    onChange={(val) => setAsciiSettings({ ...asciiSettings, planeBaseHeight: val })}
                                                />
                                            </div>

                                            {/* Density (ASCII Font Size) */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Density</label>
                                                <ElasticSlider
                                                    defaultValue={20 - asciiSettings.asciiFontSize} // Abstract mapping
                                                    startingValue={1}
                                                    maxValue={18}
                                                    stepSize={1}
                                                    leftIcon={<MdGridOn size={16} />}
                                                    rightIcon={<MdGridOn size={24} />}
                                                    onChange={(val) => {
                                                        const fontSize = Math.max(2, 20 - val);
                                                        setAsciiSettings({ ...asciiSettings, asciiFontSize: fontSize });
                                                    }}
                                                />
                                            </div>

                                            {/* Wave Toggle */}
                                            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={asciiSettings.enableWaves}
                                                                onChange={(e) => setAsciiSettings({ ...asciiSettings, enableWaves: e.target.checked })}
                                                                style={{ accentColor: '#E5B020', width: '16px', height: '16px' }}
                                                            />
                                                            Enable Waves
                                                        </label>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Color</span>
                                                            <input
                                                                type="color"
                                                                value={asciiSettings.textColor}
                                                                onChange={(e) => setAsciiSettings({ ...asciiSettings, textColor: e.target.value })}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={asciiSettings.isMonochrome}
                                                                onChange={(e) => setAsciiSettings({ ...asciiSettings, isMonochrome: e.target.checked })}
                                                                style={{ accentColor: '#E5B020', width: '16px', height: '16px' }}
                                                            />
                                                            Monochrome Mode
                                                        </label>

                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Paint Types Controls */}
                                    {(activeTypeMode === 'paint_toys' || activeTypeMode === 'string_type') && (
                                        <>
                                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '15px' }}>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' }}>
                                                    {activeTypeMode === 'paint_toys'
                                                        ? "Generative Design 'Texter' port. Move fast for large letters."
                                                        : "Space Type Generator port. Kinetic text strings."}
                                                </p>
                                            </div>

                                            {/* Paint (Toys) Specific Controls */}
                                            {activeTypeMode === 'paint_toys' && (
                                                <>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Font Family</label>
                                                        <select
                                                            value={paintToysSettings.fontFamily}
                                                            onChange={(e) => setPaintToysSettings('fontFamily', e.target.value)}
                                                            style={uiStyles.control}
                                                        >
                                                            <option value="Georgia">Georgia</option>
                                                            <option value="Arial">Arial</option>
                                                            <option value="Helvetica">Helvetica</option>
                                                            <option value="Times New Roman">Times New Roman</option>
                                                            <option value="Courier New">Courier New</option>
                                                            <option value="Verdana">Verdana</option>
                                                            <option value="Impact">Impact</option>
                                                            <option value="Comic Sans MS">Comic Sans MS</option>
                                                        </select>
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Min Font Size</label>
                                                        <ElasticSlider
                                                            defaultValue={paintToysSettings.minFontSize}
                                                            startingValue={5}
                                                            maxValue={50}
                                                            stepSize={1}
                                                            isStepped
                                                            leftIcon={<RiFontSize2 size={16} />}
                                                            rightIcon={<RiFontSize2 size={24} />}
                                                            onChange={(val) => setPaintToysSettings('minFontSize', val)}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Max Font Size</label>
                                                        <ElasticSlider
                                                            defaultValue={paintToysSettings.maxFontSize}
                                                            startingValue={50}
                                                            maxValue={500}
                                                            stepSize={10}
                                                            isStepped
                                                            leftIcon={<RiFontSize2 size={16} />}
                                                            rightIcon={<RiFontSize2 size={24} />}
                                                            onChange={(val) => setPaintToysSettings('maxFontSize', val)}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Angle Distortion</label>
                                                        <ElasticSlider
                                                            defaultValue={paintToysSettings.angleDistortion * 100}
                                                            startingValue={0}
                                                            maxValue={50}
                                                            stepSize={1}
                                                            isStepped
                                                            leftIcon={<MdAnimation size={16} />}
                                                            rightIcon={<MdAnimation size={24} />}
                                                            onChange={(val) => setPaintToysSettings('angleDistortion', val / 100)}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                                                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Text Color</span>
                                                        <input
                                                            type="color"
                                                            value={paintSettings.textColor}
                                                            onChange={(e) => setPaintSettings({ ...paintSettings, textColor: e.target.value })}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                width: '40px',
                                                                height: '40px',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* String Type Specific Controls */}
                                            {activeTypeMode === 'string_type' && (
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Text Color</span>
                                                        <input
                                                            type="color"
                                                            value={stringTypeSettings.textColor}
                                                            onChange={(e) => setStringTypeSettings('textColor', e.target.value)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                width: '40px',
                                                                height: '40px',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Strip Count</label>
                                                        <ElasticSlider
                                                            defaultValue={stringTypeSettings.stripCount}
                                                            startingValue={1}
                                                            maxValue={6}
                                                            stepSize={1}
                                                            isStepped
                                                            leftIcon={<RiStackLine size={16} />}
                                                            rightIcon={<RiStackLine size={24} />}
                                                            onChange={(val) => setStringTypeSettings('stripCount', val)}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Strip Height</label>
                                                        <ElasticSlider
                                                            defaultValue={stringTypeSettings.stripHeight}
                                                            startingValue={10}
                                                            maxValue={300}
                                                            stepSize={5}
                                                            isStepped
                                                            leftIcon={<RiExpandHeightLine size={16} />}
                                                            rightIcon={<RiExpandHeightLine size={24} />}
                                                            onChange={(val) => setStringTypeSettings('stripHeight', val)}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Animation Speed</label>
                                                        <ElasticSlider
                                                            defaultValue={stringTypeSettings.animationSpeed * 10}
                                                            startingValue={0}
                                                            maxValue={50}
                                                            stepSize={1}
                                                            isStepped
                                                            leftIcon={<RiSpeedLine size={16} />}
                                                            rightIcon={<RiSpeedLine size={24} />}
                                                            onChange={(val) => setStringTypeSettings('animationSpeed', val / 10)}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Smoothness</label>
                                                        <ElasticSlider
                                                            defaultValue={stringTypeSettings.steps}
                                                            startingValue={20}
                                                            maxValue={100}
                                                            stepSize={5}
                                                            isStepped
                                                            leftIcon={<RiStackLine size={16} />}
                                                            rightIcon={<RiStackLine size={24} />}
                                                            onChange={(val) => setStringTypeSettings('steps', val)}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Spacing Controls removed from here */}
                                </>
                            )}

                            {/* Spacing Controls (Kerning/Leading) - SHARED */}
                            <h4 style={{ ...uiStyles.sectionTitle, gridColumn: 'span 2', marginTop: '10px', marginBottom: '5px' }}>Spacing</h4>

                            {/* Leading (Line Height) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Line Height</label>
                                <ElasticSlider
                                    key={`leading-${activeTypeMode}`} // Force reset on mode change
                                    defaultValue={activeTypeMode === 'ascii' ? (asciiSettings.leading * 10) : 12} // Default 1.2 * 10
                                    startingValue={8} // 0.8
                                    maxValue={20} // 2.0
                                    stepSize={1}
                                    leftIcon={<RiExpandHeightLine size={16} />}
                                    rightIcon={<RiExpandHeightLine size={24} />}
                                    onChange={(val) => {
                                        // Leading change handler for classic 2D mode
                                        if (activeTypeMode === 'ascii') {
                                            setAsciiSettings({ ...asciiSettings, leading: val / 10 });
                                        } else {
                                            // Directly set the global leading factor
                                            const leadingValue = val / 10;
                                            window.leadingFactor = leadingValue;
                                            // Update lineHeight if pgTextSize exists
                                            if (typeof window.pgTextSize !== 'undefined') {
                                                window.lineHeight = window.pgTextSize * leadingValue;
                                            }
                                            // Trigger text recreation
                                            if (typeof window.setText === 'function') {
                                                window.setText();
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {/* Kerning (Letter Spacing) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Kerning</label>
                                <ElasticSlider
                                    key={`kerning-${activeTypeMode}`} // Force reset on mode change
                                    defaultValue={activeTypeMode === 'ascii' ? asciiSettings.kerning : 0}
                                    startingValue={-20}
                                    maxValue={50}
                                    stepSize={1}
                                    leftIcon={<RiExpandWidthLine size={16} />}
                                    rightIcon={<RiExpandWidthLine size={24} />}
                                    onChange={(val) => {
                                        // Kerning change handler for classic 2D mode
                                        console.log('[Kerning] Mode:', activeTypeMode, 'Value:', val);
                                        if (activeTypeMode === 'ascii') {
                                            setAsciiSettings({ ...asciiSettings, kerning: val });
                                        } else {
                                            // Directly set the global tracking factor
                                            const newTrackingFactor = 0.15 + (val / 100);
                                            console.log('[Kerning] Setting trackingFactor to:', newTrackingFactor);
                                            window.trackingFactor = newTrackingFactor;
                                            console.log('[Kerning] window.trackingFactor is now:', window.trackingFactor);
                                            console.log('[Kerning] window.setText:', typeof window.setText, 'window.resetAnim:', typeof window.resetAnim);

                                            // Trigger text recreation - try multiple methods
                                            if (typeof window.setText === 'function') {
                                                console.log('[Kerning] Calling window.setText()');
                                                window.setText();
                                            } else if (typeof window.resetAnim === 'function') {
                                                console.log('[Kerning] Calling window.resetAnim()');
                                                window.resetAnim();
                                            } else {
                                                console.log('[Kerning] ERROR: Neither setText nor resetAnim available!');
                                            }
                                        }
                                    }}
                                />
                            </div>


                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>

                            {/* Effects & Shapes (Classic Only) */}
                            {activeTypeMode === 'classic' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={uiStyles.sectionTitle}>Effects</h3>

                                    {/* React-Driven Effects Controls */}
                                    <label style={uiStyles.label}>Effect Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        style={{ ...uiStyles.control, marginBottom: '10px' }}
                                    >
                                        <option value="">-- Select Category --</option>
                                        <option value="classic">Classic Patterns</option>
                                        <option value="wave">Wave & Rotation</option>
                                        <option value="explosive">Explosive & Dynamic</option>
                                        <option value="distortion">Distortion</option>
                                    </select>

                                    <label style={uiStyles.label}>Select Effect</label>
                                    <select
                                        onChange={handleEffectSelect}
                                        disabled={availableEffects.length === 0}
                                        style={{
                                            ...uiStyles.control,
                                            background: availableEffects.length === 0 ? 'rgba(255,255,255,0.02)' : uiStyles.control.background,
                                            color: availableEffects.length === 0 ? '#666' : uiStyles.control.color,
                                            cursor: availableEffects.length === 0 ? 'not-allowed' : 'pointer'
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
                                                    border: currentEffectForIntensity?.id === eff.id ? '1px solid #E5B020' : '1px solid transparent',
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
                                                    style={{ color: '#E5B020', fontWeight: 'bold' }}
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
                                                style={{ width: '100%', accentColor: '#E5B020' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Classic Animation Controls */}
                            {activeTypeMode === 'classic' && (
                                <>
                                    <h3 style={uiStyles.sectionTitle}>Animation</h3>
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
                                </>
                            )}
                        </div>
                    </div>
                )}
                {activeStep === 3 && (
                    <div className="controls-section">
                        <h3 style={uiStyles.sectionTitle}>Audio Controls</h3>

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
                                color="#E5B020"
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


