import { useState, useEffect } from 'react';
import './IntroScreen.css';
import Lanyard from './Lanyard';

export default function IntroScreen({ onComplete }) {
    // Initialize state from localStorage to avoid cascading renders
    const [name, setName] = useState(() => localStorage.getItem('playerName') || '');
    const [color, setColor] = useState(() => localStorage.getItem('playerColor') || '#00ffcc');

    useEffect(() => {
        console.log('🎬 IntroScreen mounted');
        return () => console.log('🎬 IntroScreen unmounted');
    }, []);

    // Real-time sync with legacy input for cursor color update
    useEffect(() => {
        const colorInput = document.getElementById('player-color');
        if (colorInput) {
            colorInput.value = color;
            colorInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, [color]);

    const handleCreate = () => {
        console.log('🎬 handleCreate called - User clicked CREATE button');
        // 1. Save to localStorage
        const finalName = name.trim() || 'Guest';
        localStorage.setItem('playerName', finalName);
        localStorage.setItem('playerColor', color);

        // 2. Update the hidden inputs in the legacy DOM so socketManager picks it up
        const nameInput = document.getElementById('player-name');
        const colorInput = document.getElementById('player-color');

        if (nameInput) {
            nameInput.value = finalName;
            // Dispatch input event to trigger socketManager listeners
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (colorInput) {
            colorInput.value = color;
            colorInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // 3. Complete the intro
        onComplete();
    };

    return (
        <div className="intro-container">
            {/* Physics Lanyard with Embedded Form */}
            <Lanyard
                name={name}
                setName={setName}
                color={color}
                setColor={setColor}
                handleCreate={handleCreate}
                gravity={[0, -40, 0]}
                position={[0, 0, 20]}
            />

            {/* Logo Overlay - Commented out as logo is now on the card */}
            {/* <div className="intro-content-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '5vh',
                zIndex: 10
            }}>
                <img
                    src="./assets/Colab Logo White.svg"
                    alt="Colab Logo"
                    className="intro-logo"
                    style={{
                        width: '70vw',
                        height: 'auto',
                        maxHeight: '40vh',
                        objectFit: 'contain',
                        margin: 0,
                        transform: 'none'
                    }}
                />
            </div> */}
        </div>
    );
}
