import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const handleBgChange = (e) => {
            console.log("React received bg change:", e.detail);
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
        if (showIntro) {
            window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: 'intro' } }));
        }

        return () => {
            window.removeEventListener('change-background-type', handleBgChange);
            window.removeEventListener('app-step-changed', handleStepChange);
        };
    }, []); // Run once on mount


    const handleSwitchApp = (appId) => {
        setActiveApp(appId);
        // Dispatch event for non-React parts (e.g., main.js) to hide/show UI
        window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: appId } }));
    };

    const handleIntroComplete = () => {
        console.log('🎬 handleIntroComplete called - Hiding intro screen');
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

    console.log('🎬 App render - showIntro:', showIntro);

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
                        />
                    )}

                    {/* Render TypeFlow Backgrounds only if in TypeFlow mode */}
                    {activeApp === 'typeflow' && (
                        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                            {/* Background Shapes: Z-index managed by CSS or default stacking. Should be above bg, below type. */}
                            <BackgroundShapes shapes={shapes} settings={shapeSettings} />

                            {activeBackground === 'silk' && <Silk {...silkSettings} />}
                            {activeBackground === 'spline' && <SplineBackground />}
                            {activeBackground === 'spline_new' && <SplineBackground sceneUrl="https://prod.spline.design/Gc46LQNHKmMSkOyq/scene.splinecode" />}
                            {activeBackground === 'starfield' && <StarField />}
                            {activeBackground === 'aurora' && <Aurora />}
                            {activeBackground === 'blocks' && <Blocks />}
                            {activeBackground === 'particles' && <Particles {...particleSettings} />}
                            {activeBackground === 'color_bends' && <ColorBends />}
                            {activeBackground === 'dark_veil' && <DarkVeil />}
                            {activeBackground === 'dither' && <Dither />}
                        </div>
                    )}

                    <CommunityGallery isActive={activeApp === 'community'} />
                </>
            )}
        </div>
    );
}

export default App;
