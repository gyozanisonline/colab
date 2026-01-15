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

import VersionOverlay from './components/VersionOverlay';

import IntroScreen from './components/IntroScreen';

function App() {
    const [showIntro, setShowIntro] = useState(true);
    const [activeBackground, setActiveBackground] = useState('wireframe'); // Default to Wireframe
    const [activeApp, setActiveApp] = useState('typeflow');

    useEffect(() => {
        const handleBgChange = (e) => {
            console.log("React received bg change:", e.detail);
            setActiveBackground(e.detail);
        };
        window.addEventListener('change-background-type', handleBgChange);

        // Initial Sync: If Intro is showing, tell legacy system to hide its UI
        if (showIntro) {
            window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: 'intro' } }));
        }

        return () => window.removeEventListener('change-background-type', handleBgChange);
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

    console.log('🎬 App render - showIntro:', showIntro);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {showIntro ? (
                <IntroScreen onComplete={handleIntroComplete} />
            ) : (
                <>
                    <VersionOverlay />
                    <Navigation activeApp={activeApp} onSwitchApp={handleSwitchApp} />

                    {/* Render TypeFlow Backgrounds only if in TypeFlow mode */}
                    {activeApp === 'typeflow' && (
                        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                            {activeBackground === 'silk' && <Silk color="#00ffcc" speed={2.5} />}
                            {activeBackground === 'spline' && <SplineBackground />}
                            {activeBackground === 'spline_new' && <SplineBackground sceneUrl="https://prod.spline.design/Gc46LQNHKmMSkOyq/scene.splinecode" />}
                            {activeBackground === 'starfield' && <StarField />}
                            {activeBackground === 'aurora' && <Aurora />}
                            {activeBackground === 'blocks' && <Blocks />}
                            {activeBackground === 'particles' && <Particles />}
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
