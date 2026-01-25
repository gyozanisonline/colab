const Navigation = ({ onSwitchApp }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto', // Enable clicks
            cursor: 'pointer'
        }}
            onClick={() => onSwitchApp && onSwitchApp('typeflow')}
        >
            <img
                src="/assets/Colab Logo White.svg"
                alt="Colab"
                style={{
                    width: '120px', // Adjust size as needed
                    height: 'auto',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    opacity: 0.95
                }}
            />
        </div>
    );
};

export default Navigation;
