import { useState, useEffect } from 'react';
import './IntroScreen.css';
import StarBorder from './StarBorder';

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
            <div className="intro-content">
                <img
                    src="./assets/Colab Logo White.svg"
                    alt="Colab Logo"
                    className="intro-logo"
                />

                <div className="intro-form">
                    <div className="intro-row">
                        <div className="input-group">
                            {/* <label className="intro-label">NAME</label> */}
                            <input
                                type="text"
                                className="intro-name-input"
                                placeholder="YOUR NAME"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={15}
                            />
                        </div>

                        <div className="input-group color-picker-section">
                            <label className="intro-label">COLOR</label>
                            <input
                                type="color"
                                className="intro-color-input"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{ backgroundColor: color }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <StarBorder
                            as="button"
                            className="create-btn-wrapper"
                            color={color}
                            speed="3s"
                            onClick={handleCreate}
                            style={{ width: '100%' }}
                        >
                            CREATE
                        </StarBorder>
                    </div>
                </div>
            </div>
        </div>
    );
}
