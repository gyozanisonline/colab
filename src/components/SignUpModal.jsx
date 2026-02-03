import { useState, useEffect } from 'react';
import './IntroScreen.css'; // Reuse same styles
import StarBorder from './StarBorder';
import { filterProfanity } from '../utils/profanityFilter';
import ParticleSphere from './ParticleSphere';

export default function SignUpModal({ onComplete, onClose }) {
    const [name, setName] = useState(() => localStorage.getItem('playerName') || '');
    const [color, setColor] = useState(() => localStorage.getItem('playerColor') || '#00ffcc');

    // Real-time sync with legacy input for cursor color update
    useEffect(() => {
        const colorInput = document.getElementById('player-color');
        if (colorInput) {
            colorInput.value = color;
            colorInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, [color]);

    const handleCreate = () => {
        const finalName = name.trim() || 'Guest';
        localStorage.setItem('playerName', finalName);
        localStorage.setItem('playerColor', color);

        // Update the hidden inputs in the legacy DOM
        const nameInput = document.getElementById('player-name');
        const colorInput = document.getElementById('player-color');

        if (nameInput) {
            nameInput.value = finalName;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (colorInput) {
            colorInput.value = color;
            colorInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        onComplete();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 5000,
                background: '#000'
            }}
        >
            {/* Particle Sphere Background - color updates in real-time */}
            <ParticleSphere color={color} count={600} />

            {/* Form Overlay */}
            <div
                className="intro-container"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'transparent'
                }}
                onClick={(e) => {
                    // Close when clicking backdrop (not form elements)
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div className="intro-content">
                    <div className="intro-form" style={{
                        background: 'rgba(0, 0, 0, 0.5)',
                        padding: '40px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div className="intro-row">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="intro-name-input"
                                    placeholder="YOUR NAME"
                                    value={name}
                                    onChange={(e) => {
                                        const filtered = filterProfanity(e.target.value);
                                        setName(filtered);
                                    }}
                                    maxLength={15}
                                />
                            </div>

                            <div className="input-group color-picker-section">
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
        </div>
    );
}

