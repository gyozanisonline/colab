import { useState, useEffect } from 'react';
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
import PaintText from './components/PaintText'; // Keeping for reference or removal
import PaintToys from './components/PaintToys';
import StringType from './components/StringType';
import CRTEffect from './components/CRTEffect';

import VersionOverlay from './components/VersionOverlay';

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
        if (legacyCanvas) {
            // Only show if typeflow mode is classic AND intro is NOT showing
            legacyCanvas.style.display = (!showIntro && activeTypeMode === 'classic') ? 'block' : 'none';
        }
    }, [activeTypeMode, showIntro]);


    const handleSwitchApp = (appId) => {
        setActiveApp(appId);
        // Disable poster mode when viewing gallery
        if (appId === 'community' && window.togglePosterMode) {
            window.togglePosterMode(false);
        }
        // Dispatch event for non-React parts (e.g., main.js) to hide/show UI
        window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: appId } }));
    };

    const handleIntroComplete = () => {
        setShowIntro(false);
        // Go to gallery first, user can click CREATE to go to poster creation
        setActiveApp('community');
        window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: 'community' } }));
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
                            crtBackgroundSettings={crtBackgroundSettings}
                            setCrtBackgroundSettings={setCrtBackgroundSettings}
                            crtTypeSettings={crtTypeSettings}
                            setCrtTypeSettings={setCrtTypeSettings}
                            colorBendsSettings={colorBendsSettings}
                            setColorBendsSettings={setColorBendsSettings}
                        />
                    )}

                    {/* New Type Effects */}


                    {/* Render TypeFlow Backgrounds only if in TypeFlow mode */}
                    {activeApp === 'typeflow' && (
                        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                            {/* Background Shapes: Z-index managed by CSS or default stacking. Should be above bg, below type. */}
                            <BackgroundShapes shapes={shapes} settings={shapeSettings} onRemove={removeShape} />

                            {activeBackground === 'silk' && <Silk {...silkSettings} />}
                            {activeBackground === 'spline_new' && <SplineBackground sceneUrl="https://prod.spline.design/Gc46LQNHKmMSkOyq/scene.splinecode" />}
                            {activeBackground === 'starfield' && <StarField {...starfieldSettings} />}
                            {activeBackground === 'aurora' && <Aurora {...auroraSettings} />}
                            {activeBackground === 'blocks' && <Blocks {...blocksSettings} />}
                            {activeBackground === 'particles' && <Particles {...particleSettings} />}
                            {activeBackground === 'color_bends' && <ColorBends {...colorBendsSettings} />}
                            {activeBackground === 'dark_veil' && <DarkVeil {...darkVeilSettings} />}
                            {activeBackground === 'dither' && <Dither {...ditherSettings} />}

                            {/* CRT Effect for Background Layer */}
                            <CRTEffect
                                enabled={crtBackgroundSettings.enabled}
                                intensity={crtBackgroundSettings.intensity}
                                scanlineDensity={crtBackgroundSettings.scanlineDensity}
                                chromaAmount={crtBackgroundSettings.chromaAmount}
                                layer="background"
                            />
                        </div>
                    )}

                    {/* New Type Effects Layer (Rendered on top of backgrounds) */}
                    {activeApp === 'typeflow' && activeTypeMode === 'ascii' && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
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
                        </div>
                    )}

                    {activeApp === 'typeflow' && activeTypeMode === 'paint_toys' && (
                        <PaintToys
                            text={textContent}
                            textColor={paintSettings.textColor}
                            minFontSize={paintToysSettings.minFontSize}
                            maxFontSize={paintToysSettings.maxFontSize}
                            angleDistortion={paintToysSettings.angleDistortion}
                            fontFamily={paintToysSettings.fontFamily}
                        />
                    )}

                    {activeApp === 'typeflow' && activeTypeMode === 'string_type' && (
                        <StringType
                            text={textContent}
                            stripHeightProp={stringTypeSettings.stripHeight}
                            animationSpeed={stringTypeSettings.animationSpeed}
                            steps={stringTypeSettings.steps}
                            stripCount={stringTypeSettings.stripCount}
                            textColor={stringTypeSettings.textColor}
                        />
                    )}

                    {/* CRT Effect for Type Layer */}
                    {activeApp === 'typeflow' && (
                        <CRTEffect
                            enabled={crtTypeSettings.enabled}
                            intensity={crtTypeSettings.intensity}
                            scanlineDensity={crtTypeSettings.scanlineDensity}
                            chromaAmount={crtTypeSettings.chromaAmount}
                            layer="type"
                        />
                    )}

                    <CommunityGallery
                        isActive={activeApp === 'community'}
                        onCreateClick={() => handleSwitchApp('typeflow')}
                    />
                </>
            )}
        </div>
    );
}

export default App;
