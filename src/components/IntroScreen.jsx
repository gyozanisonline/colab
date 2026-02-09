import './IntroScreen.css';
import StarBorder from './StarBorder';

export default function IntroScreen({ onComplete }) {
    return (
        <div className="intro-container">
            <div className="intro-content">
                <div className="intro-form">
                    <div style={{
                        marginTop: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        width: '100%'
                    }}>
                        {/* Primary CTA */}
                        <StarBorder
                            as="button"
                            className="create-btn-wrapper"
                            color="#00ffcc"
                            speed="3s"
                            onClick={() => onComplete('create')}
                        >
                            CREATE POSTER
                        </StarBorder>

                        {/* Secondary CTA */}
                        <button
                            onClick={() => onComplete('gallery')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
                            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.5)'}
                        >
                            or explore gallery
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
