import React from 'react';

const Navigation = ({ activeApp, onSwitchApp }) => {
    const apps = [
        { id: 'typeflow', label: 'TypeFlow' }
    ];

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            gap: '10px',
            background: 'rgba(0,0,0,0.6)',
            padding: '10px',
            borderRadius: '8px',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {apps.map(app => (
                <button
                    key={app.id}
                    onClick={() => onSwitchApp(app.id)}
                    style={{
                        background: activeApp === app.id ? '#00ffcc' : 'transparent',
                        color: activeApp === app.id ? '#000' : '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontWeight: activeApp === app.id ? 'bold' : 'normal',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {app.label}
                </button>
            ))}
        </div>
    );
};

export default Navigation;
