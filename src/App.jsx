import React, { useState, useEffect } from 'react';
import Silk from './components/Silk';
import SplineBackground from './components/SplineBackground';
import StarField from './components/StarField';
import Aurora from './components/Aurora';
import Blocks from './components/Blocks';
import Particles from './components/Particles';

function App() {
    const [activeBackground, setActiveBackground] = useState('wireframe'); // Default to Wireframe

    useEffect(() => {
        // Listen for custom event from Vanilla JS
        const handleBgChange = (e) => {
            console.log("React received bg change:", e.detail);
            setActiveBackground(e.detail);
        };

        window.addEventListener('change-background-type', handleBgChange);
        return () => window.removeEventListener('change-background-type', handleBgChange);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
            {activeBackground === 'silk' && <Silk color="#00ffcc" speed={2.5} />}
            {activeBackground === 'spline' && <SplineBackground />}
            {activeBackground === 'spline_new' && <SplineBackground sceneUrl="https://prod.spline.design/Gc46LQNHKmMSkOyq/scene.splinecode" />}
            {activeBackground === 'starfield' && <StarField />}
            {activeBackground === 'aurora' && <Aurora />}
            {activeBackground === 'blocks' && <Blocks />}
            {activeBackground === 'particles' && <Particles />}
        </div>
    );
}

export default App;
