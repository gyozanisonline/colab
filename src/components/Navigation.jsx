import { useState } from 'react';
import { createPortal } from 'react-dom';
import './InfiniteMenu.css'; // For action-button style
import SignUpModal from './SignUpModal';
import StarBorder from './StarBorder';

const Navigation = ({ activeApp, onSwitchApp }) => {
    const [showSignUp, setShowSignUp] = useState(false);
    const isGalleryMode = activeApp === 'community';

    // Check if user is already registered
    const isUserRegistered = () => {
        const playerName = localStorage.getItem('playerName');
        // Consider registered if name exists and is not empty or 'Guest'
        return playerName && playerName.trim() !== '' && playerName !== 'Guest';
    };

    const handleButtonClick = () => {
        if (isGalleryMode) {
            // If user already registered, skip sign-up and go directly to creation
            if (isUserRegistered()) {
                onSwitchApp && onSwitchApp('typeflow');
            } else {
                // Show sign-up modal first
                setShowSignUp(true);
            }
        } else {
            // In creation mode, button goes back to gallery
            onSwitchApp && onSwitchApp('community');
        }
    };

    const handleSignUpComplete = () => {
        setShowSignUp(false);
        // Now go to poster creation
        onSwitchApp && onSwitchApp('typeflow');
    };

    return createPortal(
        <>
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 3000,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '20px',
                pointerEvents: 'auto'
            }}>
                {/* Button - to the LEFT of the logo */}
                <StarBorder
                    as="button"
                    className="create-btn-wrapper"
                    color="#00ffcc"
                    speed="3s"
                    onClick={handleButtonClick}
                    style={{
                        position: 'relative',
                        left: 'auto',
                        bottom: 'auto',
                        transform: 'none',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {isGalleryMode ? 'Create a Poster' : 'Gallery'}
                </StarBorder>

                {/* COLAB Logo - 30% bigger (120px * 1.3 = 156px) */}
                <div style={{ cursor: 'pointer' }}>
                    <img
                        src="/assets/Colab Logo White.svg"
                        alt="Colab"
                        style={{
                            width: '156px',
                            height: 'auto',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            opacity: 0.95
                        }}
                    />
                </div>
            </div>

            {/* Sign Up Modal - shown when clicking Create a Poster */}
            {showSignUp && (
                <SignUpModal
                    onComplete={handleSignUpComplete}
                    onClose={() => setShowSignUp(false)}
                />
            )}
        </>,
        document.body
    );
};

export default Navigation;
