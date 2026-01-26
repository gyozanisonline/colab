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

import VersionOverlay from './components/VersionOverlay';

import IntroScreen from './components/IntroScreen';

function App() {
    const [showIntro, setShowIntro] = useState(true);
    const [activeBackground, setActiveBackground] = useState('starfield'); // Default to StarField (lighter on GPU)
    const [activeApp, setActiveApp] = useState('typeflow');
    const [activeStep, setActiveStep] = useState(1);

    const [shapes, setShapes] = useState([]);

    const [shapeSettings, setShapeSettings] = useState({
        size: 1,
        speed: 20, // seconds for full rotation (lower is faster)
        fillOpacity: 0.1,
        strokeWidth: 0.5
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
        color: '#00ffcc',
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
        baseColor: '#d500ff',
        veilColor: '#1a1a1a',
        density: 1.0,
        speed: 0.2
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
        // Dispatch event for non-React parts (e.g., main.js) to hide/show UI
        window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: appId } }));
    };

    const handleIntroComplete = () => {
        setShowIntro(false);
        // Switch to main app mode
        window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: 'typeflow' } }));
    };

    const addShape = (type) => {
        const newShape = {
            id: Date.now(),
            type: type,
            x: 0,
            y: 0,
            color: 'rgba(255, 255, 255, 0.8)'
        };
        setShapes([...shapes, newShape]);
    };

    const clearShapes = () => {
        setShapes([]);
    };



    return (
        <div style={{ width: '100%', height: '100%' }}>
            {showIntro ? (
                <IntroScreen onComplete={handleIntroComplete} />
            ) : (
                <>
                    <VersionOverlay />
                    <Navigation activeApp={activeApp} onSwitchApp={handleSwitchApp} />

                    {/* New React-based Controls */}
                    {activeApp === 'typeflow' && (
                        <Controls
                            activeStep={activeStep}
                            activeApp={activeApp}
                            onSwitchApp={handleSwitchApp}
                            activeBackground={activeBackground}
                            shapes={shapes}
                            addShape={addShape}
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
                        />
                    )}

                    {/* New Type Effects */}


                    {/* Render TypeFlow Backgrounds only if in TypeFlow mode */}
                    {activeApp === 'typeflow' && (
                        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                            {/* Background Shapes: Z-index managed by CSS or default stacking. Should be above bg, below type. */}
                            <BackgroundShapes shapes={shapes} settings={shapeSettings} />

                            {activeBackground === 'silk' && <Silk {...silkSettings} />}
                            {activeBackground === 'spline' && <SplineBackground />}
                            {activeBackground === 'spline_new' && <SplineBackground sceneUrl="https://prod.spline.design/Gc46LQNHKmMSkOyq/scene.splinecode" />}
                            {activeBackground === 'starfield' && <StarField {...starfieldSettings} />}
                            {activeBackground === 'aurora' && <Aurora {...auroraSettings} />}
                            {activeBackground === 'blocks' && <Blocks {...blocksSettings} />}
                            {activeBackground === 'particles' && <Particles {...particleSettings} />}
                            {activeBackground === 'color_bends' && <ColorBends />}
                            {activeBackground === 'dark_veil' && <DarkVeil {...darkVeilSettings} />}
                            {activeBackground === 'dither' && <Dither {...ditherSettings} />}
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

                    <CommunityGallery isActive={activeApp === 'community'} />
                </>
            )}
        </div>
    );
}

export default App;
