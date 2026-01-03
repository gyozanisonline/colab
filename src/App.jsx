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

function App() {
    const [activeBackground, setActiveBackground] = useState('wireframe'); // Default to Wireframe

    useEffect(() => {
        const handleBgChange = (e) => {
            console.log("React received bg change:", e.detail);
            setActiveBackground(e.detail);
        };
        window.addEventListener('change-background-type', handleBgChange);
        return () => window.removeEventListener('change-background-type', handleBgChange);
    }, []);

    // NOTE: Leva controls appear automatically when components mount.

    return (
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
    );
}

export default App;
