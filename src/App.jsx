import { useState, useEffect, useRef } from 'react';
import Silk from './components/Silk';
import SplineBackground from './components/SplineBackground';
import StarField from './components/StarField';
import Aurora from './components/Aurora';
import Blocks from './components/Blocks';
import Particles from './components/Particles';
import ColorBends from './components/ColorBends';
import DarkVeil from './components/DarkVeil';
import Dither from './components/Dither';
import Navigation from './components/Navigation';
import CommunityGallery from './components/CommunityGallery';
import Controls from './components/Controls';
import BackgroundShapes from './components/BackgroundShapes';
import ASCIIText from './components/ASCIIText';
import PaintToys from './components/PaintToys';
import StringType from './components/StringType';
import TypeField from './components/TypeField';
import ParticleText from './components/ParticleText';
import GlitchText from './components/GlitchText';
import NeonText from './components/NeonText';
import CRTEffect from './components/CRTEffect';
import GlitchEffect from './components/GlitchEffect';
import DepthOfField from './components/DepthOfField';
import HalftoneEffect from './components/HalftoneEffect';
import ChatWidget from './components/ChatWidget'; // Chat

import VersionOverlay from './components/VersionOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import SocketStatus from './components/SocketStatus';

import IntroScreen from './components/IntroScreen';
import ParticleIntro from './components/ParticleIntro';

function App() {
    const [showIntro, setShowIntro] = useState(true);
    const [showIntroUI, setShowIntroUI] = useState(false);
    const [activeBackground, setActiveBackground] = useState('starfield'); // Default to StarField (lighter on GPU)
    const [activeApp, setActiveApp] = useState('typeflow');
    const [activeStep, setActiveStep] = useState(1);

    const [shapes, setShapes] = useState([]);

    const [shapeSettings, setShapeSettings] = useState({
        size: 1,
        speed: 20, // seconds for full rotation (lower is faster)
        fillOpacity: 0.1,
        strokeWidth: 0.5,
        color: '#ffffff'
    });

    const [particleSettings, setParticleSettings] = useState({
        count: 100,
        color: '#05c3dd',
        size: 0.2,
        speed: 1
    });

    const [silkSettings, setSilkSettings] = useState({
        speed: 5,
        scale: 1,
        color: '#7f00ff',
        noiseIntensity: 1.5,
        rotation: 0
    });

    const [activeTypeMode, setActiveTypeMode] = useState('classic'); // 'classic' or 'ascii'
    const [textContent, setTextContent] = useState('Colab\nExperiment Together');
    const [asciiSettings, setAsciiSettings] = useState({
        asciiFontSize: 8,
        textFontSize: 200,
        planeBaseHeight: 8,
        enableWaves: true,
        isMonochrome: false,
        textColor: '#ffffff',
        kerning: 0,
        leading: 1.2
    });

    // Background Settings State (Hoisted from Leva)
    const [starfieldSettings, setStarfieldSettings] = useState({
        count: 5000,
        radius: 1.5,
        color: '#f272c8',
        size: 0.005,
        speed: 1
    });

    const [auroraSettings, setAuroraSettings] = useState({
        bg: '#000000',
        color1: '#ff00cc',
        color2: '#3333ff',
        color3: '#00ffcc',
        speed: 10,
        blobSize: 60
    });

    const [darkVeilSettings, setDarkVeilSettings] = useState({
        hueShift: 336, // Default from React Bits
        noiseIntensity: 0,
        scanlineIntensity: 0,
        speed: 3,
        scanlineFrequency: 0,
        warpAmount: 0,
        resolutionScale: 1
    });

    const [ditherSettings, setDitherSettings] = useState({
        color1: '#ffffff',
        color2: '#000000',
        pixelSize: 64.0
    });

    const [blocksSettings, setBlocksSettings] = useState({
        defaultColor: 'orange',
        hoveredColor: 'hotpink',
        scale: 1,
        speed: 1
    });

    const [colorBendsSettings, setColorBendsSettings] = useState({
        rotation: 0,
        autoRotate: 0,
        speed: 0.5,
        scale: 0.25,
        frequency: 2,
        warpStrength: 1,
        mouseInfluence: 0.5,
        parallax: 2,
        noise: 0
    });

    const [paintSettings, setPaintSettings] = useState({
        mode: 'flow', // 'brush' or 'flow'
        speed: 1,
        stripHeight: 85,
        density: 200,
        stepDist: 100,
        textColor: '#ffffff'
    });

    const [paintToysSettings, setPaintToysSettings] = useState({
        minFontSize: 8,
        maxFontSize: 300,
        angleDistortion: 0.01,
        fontFamily: 'Georgia'
    });

    const [stringTypeSettings, setStringTypeSettings] = useState({
        stripHeight: 70,
        animationSpeed: 1,
        steps: 70,
        stripCount: 2,
        textColor: '#ffffff'
    });

    const [typeFieldSettings, setTypeFieldSettings] = useState({
        fontFamily: 'Bebas Neue',
        fontSize: 48,
        color: '#ffffff',
        bold: false,
        italic: false,
        align: 'left',
    });

    const [particleTextSettings, setParticleTextSettings] = useState({
        color: '#05c3dd',
        particleCount: 3000,
        particleSize: 2,
        driftAmount: 0.8,
        interactionRadius: 80,
        fontSize: 180,
    });

    const [glitchTextSettings, setGlitchTextSettings] = useState({
        color: '#ffffff',
        fontSize: 180,
        intensity: 0.5,
        rgbSplit: 15,
        sliceCount: 6,
    });

    const [neonTextSettings, setNeonTextSettings] = useState({
        glowColor: '#ff00cc',
        fontSize: 180,
        bloomRadius: 40,
        pulseSpeed: 1,
        flickerIntensity: 0,
    });

    // CRT Effect Settings (separate for background and type layers)
    const [crtBackgroundSettings, setCrtBackgroundSettings] = useState({
        enabled: false,
        intensity: 70,
        scanlineDensity: 50,
        chromaAmount: 50
    });

    const [crtTypeSettings, setCrtTypeSettings] = useState({
        enabled: false,
        intensity: 70,
        scanlineDensity: 50,
        chromaAmount: 50
    });

    const [glitchSettings, setGlitchSettings] = useState({
        enabled: false,
        intensity: 50,
        speed: 50,
        rgbSplit: 50,
        sliceCount: 5
    });

    const [dofSettings, setDofSettings] = useState({
        enabled: false,
        blurAmount: 8,
        focusRadius: 35,
        focusX: 50,
        focusY: 50
    });

    const [halftoneSettings, setHalftoneSettings] = useState({
        enabled: false,
        dotSize: 4,
        spacing: 10,
        angle: 0,
        opacity: 80,
        color: '#000000',
        blendMode: 'multiply'
    });

    useEffect(() => {
        const handleBgChange = (e) => {
            setActiveBackground(e.detail);
        };

        // Listen for step changes from legacy app
        const handleStepChange = (e) => {
            if (e.detail && e.detail.step) {
                setActiveStep(e.detail.step);
            }
        };

        window.addEventListener('change-background-type', handleBgChange);
        window.addEventListener('app-step-changed', handleStepChange);

        // Initial Sync: If Intro is showing, tell legacy system to hide its UI
        // Using showIntro directly here is intentional - we only want this on mount
        if (showIntro) {
            window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: 'intro' } }));
        }

        return () => {
            window.removeEventListener('change-background-type', handleBgChange);
            window.removeEventListener('app-step-changed', handleStepChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount


    // Toggle legacy canvas based on activeTypeMode (and intro state)
    useEffect(() => {
        const legacyCanvas = document.getElementById('canvas-type');
        const shouldBeActive = !showIntro && activeTypeMode === 'classic' && activeApp === 'typeflow';

        if (legacyCanvas) {
            legacyCanvas.style.display = shouldBeActive ? 'block' : 'none';
        }

        // Also control the p5.js draw loop
        if (window.setClassicTypeActive) {
            window.setClassicTypeActive(shouldBeActive);
        }
    }, [activeTypeMode, showIntro, activeApp]);

    useEffect(() => {
        const bgCanvas = document.getElementById('canvas-background');

        if (bgCanvas) {
            // Force hide if intro is showing
            if (showIntro) {
                bgCanvas.style.display = 'none';
                if (window.bgInstance && window.bgInstance.noLoop) window.bgInstance.noLoop();
                return;
            }

            if (activeBackground === 'wireframe') {
                bgCanvas.style.display = 'block';
                if (window.bgInstance && window.bgInstance.loop) window.bgInstance.loop();
            } else {
                bgCanvas.style.display = 'none';
                if (window.bgInstance && window.bgInstance.noLoop) window.bgInstance.noLoop();
            }
        }
    }, [activeBackground, showIntro]);




    // --- SOCKET SYNC LOGIC ---

    // Track which keys are currently being updated from the server
    // so we don't emit them back (prevent echo loops)
    const remoteUpdatePending = useRef(new Set());

    // Debounce timers for continuous (slider) keys — keyed by param name
    const debounceTimers = useRef(new Map());

    // Keys that represent discrete user choices (switch backgrounds, change mode, etc.)
    // These emit immediately so collaborators feel instant feedback.
    // All other keys (settings objects from sliders) are debounced.
    const DISCRETE_KEYS = new Set([
        'active_background', 'bg-type',
        'active_type_mode',
        'shapes_list',
        'text_content'
    ]);

    // 1. LISTEN for remote updates
    useEffect(() => {
        const handleRemoteUpdate = (e) => {
            const { key, value } = e.detail;

            // Mark this key as "updating from remote"
            remoteUpdatePending.current.add(key);

            // Map keys back to setters
            switch (key) {
                case 'active_background': setActiveBackground(value); break;
                case 'bg-type':
                    // Legacy key support. Mark the React state key as pending too to prevent echo.
                    remoteUpdatePending.current.add('active_background');
                    setActiveBackground(value);
                    break;
                case 'active_type_mode': setActiveTypeMode(value); break;
                case 'shapes_list': setShapes(value); break;

                case 'shape_settings': setShapeSettings(value); break;
                case 'particle_settings': setParticleSettings(value); break;
                case 'silk_settings': setSilkSettings(value); break;
                case 'starfield_settings': setStarfieldSettings(value); break;
                case 'aurora_settings': setAuroraSettings(value); break;
                case 'dark_veil_settings': setDarkVeilSettings(value); break;
                case 'dither_settings': setDitherSettings(value); break;
                case 'blocks_settings': setBlocksSettings(value); break;
                case 'color_bends_settings': setColorBendsSettings(value); break;

                case 'paint_settings': setPaintSettings(value); break;
                case 'paint_toys_settings': setPaintToysSettings(value); break;
                case 'string_type_settings': setStringTypeSettings(value); break;
                case 'type_field_settings': setTypeFieldSettings(value); break;
                case 'particle_text_settings': setParticleTextSettings(value); break;
                case 'glitch_text_settings': setGlitchTextSettings(value); break;
                case 'neon_text_settings': setNeonTextSettings(value); break;

                case 'ascii_settings': setAsciiSettings(value); break;
                case 'crt_background_settings': setCrtBackgroundSettings(value); break;
                case 'crt_type_settings': setCrtTypeSettings(value); break;
                case 'glitch_settings': setGlitchSettings(value); break;
                case 'dof_settings': setDofSettings(value); break;
                case 'halftone_settings': setHalftoneSettings(value); break;

                case 'text_content': setTextContent(value); break;
            }
        };

        window.addEventListener('remote-settings-update', handleRemoteUpdate);
        return () => window.removeEventListener('remote-settings-update', handleRemoteUpdate);
    }, []);

    // 2. EMIT changes

    // Helper to safely emit
    const emitUpdate = (key, value) => {
        // If this key is in our pending set, it means the change came from the server.
        // We consume the flag and DO NOT emit (prevents echo loops).
        if (remoteUpdatePending.current.has(key)) {
            remoteUpdatePending.current.delete(key);
            return;
        }

        // Discrete keys (background switch, mode, text, shapes) emit immediately.
        if (DISCRETE_KEYS.has(key)) {
            if (window.emitChange) window.emitChange('param', key, value);
            return;
        }

        // Continuous keys (slider settings objects) are debounced at 80ms.
        // This collapses rapid slider drags from ~60 events/sec to ~12
        // without any perceptible lag for collaborators.
        if (debounceTimers.current.has(key)) {
            clearTimeout(debounceTimers.current.get(key));
        }
        const timer = setTimeout(() => {
            debounceTimers.current.delete(key);
            // Re-check the remote flag at emit time: a remote update may have
            // arrived during the debounce window and should still be suppressed.
            if (remoteUpdatePending.current.has(key)) {
                remoteUpdatePending.current.delete(key);
                return;
            }
            if (window.emitChange) window.emitChange('param', key, value);
        }, 80);
        debounceTimers.current.set(key, timer);
    };

    // Watchers for each state
    useEffect(() => { emitUpdate('active_background', activeBackground); }, [activeBackground]);
    useEffect(() => { emitUpdate('active_type_mode', activeTypeMode); }, [activeTypeMode]);
    useEffect(() => { emitUpdate('shapes_list', shapes); }, [shapes]);

    useEffect(() => { emitUpdate('shape_settings', shapeSettings); }, [shapeSettings]);
    useEffect(() => { emitUpdate('particle_settings', particleSettings); }, [particleSettings]);
    useEffect(() => { emitUpdate('silk_settings', silkSettings); }, [silkSettings]);
    useEffect(() => { emitUpdate('starfield_settings', starfieldSettings); }, [starfieldSettings]);
    useEffect(() => { emitUpdate('aurora_settings', auroraSettings); }, [auroraSettings]);
    useEffect(() => { emitUpdate('dark_veil_settings', darkVeilSettings); }, [darkVeilSettings]);
    useEffect(() => { emitUpdate('dither_settings', ditherSettings); }, [ditherSettings]);
    useEffect(() => { emitUpdate('blocks_settings', blocksSettings); }, [blocksSettings]);
    useEffect(() => { emitUpdate('color_bends_settings', colorBendsSettings); }, [colorBendsSettings]);

    useEffect(() => { emitUpdate('paint_settings', paintSettings); }, [paintSettings]);
    useEffect(() => { emitUpdate('paint_toys_settings', paintToysSettings); }, [paintToysSettings]);
    useEffect(() => { emitUpdate('string_type_settings', stringTypeSettings); }, [stringTypeSettings]);
    useEffect(() => { emitUpdate('type_field_settings', typeFieldSettings); }, [typeFieldSettings]);
    useEffect(() => { emitUpdate('particle_text_settings', particleTextSettings); }, [particleTextSettings]);
    useEffect(() => { emitUpdate('glitch_text_settings', glitchTextSettings); }, [glitchTextSettings]);
    useEffect(() => { emitUpdate('neon_text_settings', neonTextSettings); }, [neonTextSettings]);

    useEffect(() => { emitUpdate('ascii_settings', asciiSettings); }, [asciiSettings]);
    useEffect(() => { emitUpdate('crt_background_settings', crtBackgroundSettings); }, [crtBackgroundSettings]);
    useEffect(() => { emitUpdate('crt_type_settings', crtTypeSettings); }, [crtTypeSettings]);
    useEffect(() => { emitUpdate('glitch_settings', glitchSettings); }, [glitchSettings]);
    useEffect(() => { emitUpdate('dof_settings', dofSettings); }, [dofSettings]);
    useEffect(() => { emitUpdate('halftone_settings', halftoneSettings); }, [halftoneSettings]);

    useEffect(() => { emitUpdate('text_content', textContent); }, [textContent]);


    const handleSwitchApp = (appId) => {
        setActiveApp(appId);
        // Disable poster mode when viewing gallery
        if (appId === 'community' && window.togglePosterMode) {
            window.togglePosterMode(false);
        }
        // Dispatch event for non-React parts (e.g., main.js) to hide/show UI
        window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: appId } }));
    };

    const handleIntroComplete = (destination = 'create') => {
        setShowIntro(false);
        // Navigate based on user choice from intro
        const targetApp = destination === 'gallery' ? 'community' : 'typeflow';
        setActiveApp(targetApp);
        window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: targetApp } }));
    };

    const addShape = (type) => {
        const newShape = {
            id: Date.now(),
            type: type,
            x: 0,
            y: 0,
            color: shapeSettings.color || 'rgba(255, 255, 255, 0.8)'
        };
        setShapes([...shapes, newShape]);
    };

    useEffect(() => {
        window.addShape = addShape;
    }, [shapes, shapeSettings]); // Re-bind when deps change to keep closure fresh

    const clearShapes = () => {
        setShapes([]);
    };

    const removeShape = (id) => {
        setShapes(prev => prev.filter(shape => shape.id !== id));
    };

    const updateShapeColor = (id, newColor) => {
        setShapes(prev => prev.map(shape =>
            shape.id === id ? { ...shape, color: newColor } : shape
        ));
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {showIntro ? (
                <>
                    <ParticleIntro onComplete={() => setShowIntroUI(true)} />
                    {showIntroUI && <IntroScreen onComplete={handleIntroComplete} />}
                </>
            ) : (
                <>
                    <VersionOverlay />
                    <Navigation
                        activeApp={activeApp}
                        onSwitchApp={handleSwitchApp}
                    />

                    {/* New React-based Controls */}
                    {activeApp === 'typeflow' && (
                        <Controls
                            activeStep={activeStep}
                            activeApp={activeApp}
                            onSwitchApp={handleSwitchApp}
                            activeBackground={activeBackground}
                            shapes={shapes}
                            addShape={addShape}
                            updateShapeColor={updateShapeColor}
                            removeShape={removeShape}
                            clearShapes={clearShapes}
                            shapeSettings={shapeSettings}
                            setShapeSettings={setShapeSettings}
                            particleSettings={particleSettings}
                            setParticleSettings={setParticleSettings}
                            silkSettings={silkSettings}
                            setSilkSettings={setSilkSettings}
                            activeTypeMode={activeTypeMode}
                            setActiveTypeMode={setActiveTypeMode}
                            textContent={textContent}
                            setTextContent={setTextContent}
                            asciiSettings={asciiSettings}
                            setAsciiSettings={setAsciiSettings}
                            starfieldSettings={starfieldSettings}
                            setStarfieldSettings={setStarfieldSettings}
                            auroraSettings={auroraSettings}
                            setAuroraSettings={setAuroraSettings}
                            darkVeilSettings={darkVeilSettings}
                            setDarkVeilSettings={setDarkVeilSettings}
                            ditherSettings={ditherSettings}
                            setDitherSettings={setDitherSettings}
                            blocksSettings={blocksSettings}
                            setBlocksSettings={setBlocksSettings}
                            paintSettings={paintSettings}
                            setPaintSettings={setPaintSettings}
                            paintToysSettings={paintToysSettings}
                            setPaintToysSettings={setPaintToysSettings}
                            stringTypeSettings={stringTypeSettings}
                            setStringTypeSettings={setStringTypeSettings}
                            typeFieldSettings={typeFieldSettings}
                            setTypeFieldSettings={setTypeFieldSettings}
                            particleTextSettings={particleTextSettings}
                            setParticleTextSettings={setParticleTextSettings}
                            glitchTextSettings={glitchTextSettings}
                            setGlitchTextSettings={setGlitchTextSettings}
                            neonTextSettings={neonTextSettings}
                            setNeonTextSettings={setNeonTextSettings}
                            crtBackgroundSettings={crtBackgroundSettings}
                            setCrtBackgroundSettings={setCrtBackgroundSettings}
                            crtTypeSettings={crtTypeSettings}
                            setCrtTypeSettings={setCrtTypeSettings}
                            colorBendsSettings={colorBendsSettings}
                            setColorBendsSettings={setColorBendsSettings}
                            glitchSettings={glitchSettings}
                            setGlitchSettings={setGlitchSettings}
                            dofSettings={dofSettings}
                            setDofSettings={setDofSettings}
                            halftoneSettings={halftoneSettings}
                            setHalftoneSettings={setHalftoneSettings}
                        />
                    )}

                    {/* New Type Effects */}


                    {/* Render TypeFlow Backgrounds only if in TypeFlow mode */}
                    {activeApp === 'typeflow' && (
                        <div style={{ width: '100%', height: '100%', pointerEvents: 'none', position: 'relative' }}>
                            {/* Background Shapes: Z-index managed by CSS or default stacking. Should be above bg, below type. */}
                            <ErrorBoundary name="BackgroundShapes">
                                <BackgroundShapes shapes={shapes} settings={shapeSettings} onRemove={removeShape} />
                            </ErrorBoundary>

                            <ErrorBoundary name="Background">
                                {activeBackground === 'silk' && <Silk {...silkSettings} />}
                                {activeBackground === 'spline_new' && <SplineBackground sceneUrl="https://prod.spline.design/Gc46LQNHKmMSkOyq/scene.splinecode" />}
                                {activeBackground === 'starfield' && <StarField {...starfieldSettings} />}
                                {activeBackground === 'aurora' && <Aurora {...auroraSettings} />}
                                {activeBackground === 'blocks' && <Blocks {...blocksSettings} />}
                                {activeBackground === 'particles' && <Particles {...particleSettings} />}
                                {activeBackground === 'color_bends' && <ColorBends {...colorBendsSettings} />}
                                {activeBackground === 'dark_veil' && <DarkVeil {...darkVeilSettings} />}
                                {activeBackground === 'dither' && <Dither {...ditherSettings} />}
                            </ErrorBoundary>

                            {/* CRT Effect for Background Layer */}
                            <ErrorBoundary name="CRTBackground">
                                <CRTEffect
                                    enabled={crtBackgroundSettings.enabled}
                                    intensity={crtBackgroundSettings.intensity}
                                    scanlineDensity={crtBackgroundSettings.scanlineDensity}
                                    chromaAmount={crtBackgroundSettings.chromaAmount}
                                    layer="background"
                                />
                            </ErrorBoundary>
                        </div>
                    )}

                    {/* New Type Effects Layer (Rendered on top of backgrounds) */}
                    {activeApp === 'typeflow' && activeTypeMode === 'ascii' && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                            <ErrorBoundary name="ASCIIText">
                                <ASCIIText
                                    text={textContent}
                                    enableWaves={asciiSettings.enableWaves}
                                    asciiFontSize={asciiSettings.asciiFontSize}
                                    textFontSize={asciiSettings.textFontSize}
                                    textColor={asciiSettings.textColor}
                                    planeBaseHeight={asciiSettings.planeBaseHeight}
                                    isMonochrome={asciiSettings.isMonochrome}
                                    kerning={asciiSettings.kerning}
                                    leading={asciiSettings.leading}
                                />
                            </ErrorBoundary>
                        </div>
                    )}

                    {activeApp === 'typeflow' && activeTypeMode === 'paint_toys' && (
                        <ErrorBoundary name="PaintToys">
                            <PaintToys
                                text={textContent}
                                textColor={paintSettings.textColor}
                                minFontSize={paintToysSettings.minFontSize}
                                maxFontSize={paintToysSettings.maxFontSize}
                                angleDistortion={paintToysSettings.angleDistortion}
                                fontFamily={paintToysSettings.fontFamily}
                            />
                        </ErrorBoundary>
                    )}

                    {activeApp === 'typeflow' && activeTypeMode === 'string_type' && (
                        <ErrorBoundary name="StringType">
                            <StringType
                                text={textContent}
                                stripHeightProp={stringTypeSettings.stripHeight}
                                animationSpeed={stringTypeSettings.animationSpeed}
                                steps={stringTypeSettings.steps}
                                stripCount={stringTypeSettings.stripCount}
                                textColor={stringTypeSettings.textColor}
                            />
                        </ErrorBoundary>
                    )}

                    {activeApp === 'typeflow' && activeTypeMode === 'type_field' && (
                        <ErrorBoundary name="TypeField">
                            <TypeField defaultSettings={typeFieldSettings} />
                        </ErrorBoundary>
                    )}

                    {activeApp === 'typeflow' && activeTypeMode === 'particle_text' && (
                        <ErrorBoundary name="ParticleText">
                            <ParticleText
                                text={textContent}
                                color={particleTextSettings.color}
                                particleCount={particleTextSettings.particleCount}
                                particleSize={particleTextSettings.particleSize}
                                driftAmount={particleTextSettings.driftAmount}
                                interactionRadius={particleTextSettings.interactionRadius}
                                fontSize={particleTextSettings.fontSize}
                            />
                        </ErrorBoundary>
                    )}

                    {activeApp === 'typeflow' && activeTypeMode === 'glitch_text' && (
                        <ErrorBoundary name="GlitchText">
                            <GlitchText
                                text={textContent}
                                color={glitchTextSettings.color}
                                fontSize={glitchTextSettings.fontSize}
                                intensity={glitchTextSettings.intensity}
                                rgbSplit={glitchTextSettings.rgbSplit}
                                sliceCount={glitchTextSettings.sliceCount}
                            />
                        </ErrorBoundary>
                    )}

                    {activeApp === 'typeflow' && activeTypeMode === 'neon_text' && (
                        <ErrorBoundary name="NeonText">
                            <NeonText
                                text={textContent}
                                glowColor={neonTextSettings.glowColor}
                                fontSize={neonTextSettings.fontSize}
                                bloomRadius={neonTextSettings.bloomRadius}
                                pulseSpeed={neonTextSettings.pulseSpeed}
                                flickerIntensity={neonTextSettings.flickerIntensity}
                            />
                        </ErrorBoundary>
                    )}

                    {/* CRT Effect for Type Layer */}
                    {activeApp === 'typeflow' && (
                        <ErrorBoundary name="CRTType">
                            <CRTEffect
                                enabled={crtTypeSettings.enabled}
                                intensity={crtTypeSettings.intensity}
                                scanlineDensity={crtTypeSettings.scanlineDensity}
                                chromaAmount={crtTypeSettings.chromaAmount}
                                layer="type"
                            />
                        </ErrorBoundary>
                    )}

                    {/* Halftone Post-FX */}
                    {activeApp === 'typeflow' && (
                        <ErrorBoundary name="HalftoneEffect">
                            <HalftoneEffect
                                enabled={halftoneSettings.enabled}
                                dotSize={halftoneSettings.dotSize}
                                spacing={halftoneSettings.spacing}
                                angle={halftoneSettings.angle}
                                opacity={halftoneSettings.opacity}
                                color={halftoneSettings.color}
                                blendMode={halftoneSettings.blendMode}
                            />
                        </ErrorBoundary>
                    )}

                    {/* Depth of Field Post-FX */}
                    {activeApp === 'typeflow' && (
                        <ErrorBoundary name="DepthOfField">
                            <DepthOfField
                                enabled={dofSettings.enabled}
                                blurAmount={dofSettings.blurAmount}
                                focusRadius={dofSettings.focusRadius}
                                focusX={dofSettings.focusX}
                                focusY={dofSettings.focusY}
                            />
                        </ErrorBoundary>
                    )}

                    {/* Glitch Post-FX */}
                    {activeApp === 'typeflow' && (
                        <ErrorBoundary name="GlitchEffect">
                            <GlitchEffect
                                enabled={glitchSettings.enabled}
                                intensity={glitchSettings.intensity}
                                speed={glitchSettings.speed}
                                rgbSplit={glitchSettings.rgbSplit}
                                sliceCount={glitchSettings.sliceCount}
                            />
                        </ErrorBoundary>
                    )}

                    {/* Global Chat Widget */}
                    <ChatWidget />
                </>
            )}

            {/* CommunityGallery: Rendered always (even during intro) for preloading, hidden via CSS when not active */}
            <CommunityGallery
                isActive={!showIntro && activeApp === 'community'}
                onCreateClick={() => handleSwitchApp('typeflow')}
            />

            {/* Socket connection status — always visible */}
            <SocketStatus />
        </div>
    );
}

export default App;
