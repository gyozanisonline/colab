import { createPortal } from 'react-dom';

const VersionOverlay = () => {
    return createPortal(
        <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '12px',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 9999
        }}>
            v{__APP_VERSION__}
        </div>,
        document.body
    );
};

export default VersionOverlay;
