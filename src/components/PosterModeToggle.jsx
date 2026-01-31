import React, { useState, useEffect } from 'react';
import { MdAspectRatio } from 'react-icons/md';
import './PosterModeToggle.css';

const PosterModeToggle = ({ isActive, onToggle }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [localActive, setLocalActive] = useState(isActive || false);

    useEffect(() => {
        setLocalActive(isActive);
    }, [isActive]);

    const handleClick = () => {
        const newState = !localActive;
        setLocalActive(newState);
        if (onToggle) onToggle(newState);

        // Haptic-like visual feedback
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
    };

    return (
        <button
            onClick={handleClick}
            className={`poster-toggle ${localActive ? 'active' : ''} ${isPressed ? 'pressed' : ''}`}
            aria-label="Toggle Poster Mode"
            style={{
                background: localActive ? 'linear-gradient(135deg, #E5B020 0%, #B88A0E 100%)' : 'rgba(255, 255, 255, 0.05)',
                border: localActive ? '1px solid #ffd700' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: localActive
                    ? '0 0 15px rgba(229, 176, 32, 0.4), 0 4px 6px rgba(0,0,0,0.2)'
                    : 'none',
                transform: isPressed ? 'scale(0.96)' : 'scale(1)',
                marginBottom: '10px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    background: localActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.3s'
                }}>
                    <MdAspectRatio size={18} color={localActive ? '#3e2e00' : '#888'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: localActive ? '#3e2e00' : '#eee',
                        letterSpacing: '0.5px'
                    }}>
                        POSTER MODE
                    </span>
                    <span style={{
                        fontSize: '0.65rem',
                        color: localActive ? 'rgba(62, 46, 0, 0.7)' : '#666',
                        fontWeight: '500'
                    }}>
                        {localActive ? 'ACTIVE' : 'OFF'}
                    </span>
                </div>
            </div>

            {/* Switch UI */}
            <div style={{
                width: '40px',
                height: '22px',
                background: localActive ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.4)',
                borderRadius: '20px',
                position: 'relative',
                transition: 'background 0.3s',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
            }}>
                <div style={{
                    width: '18px',
                    height: '18px',
                    background: localActive ? '#fff' : '#444',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: localActive ? 'calc(100% - 20px)' : '2px',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
            </div>

            {/* Shine effect */}
            {localActive && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 60%)',
                    pointerEvents: 'none',
                    animation: 'shine 3s infinite',
                }} />
            )}
        </button>
    );
};

export default PosterModeToggle;
