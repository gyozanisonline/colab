import './IntroScreen.css';
import StarBorder from './StarBorder';

export default function IntroScreen({ onComplete }) {
    return (
        <div className="intro-container">
            <div className="intro-content">
                <div className="intro-form">
                    <div style={{ marginTop: '20px' }}>
                        <StarBorder
                            as="button"
                            className="create-btn-wrapper"
                            color="#00ffcc"
                            speed="3s"
                            onClick={onComplete}
                            style={{ width: '100%' }}
                        >
                            ENTER EXPERIENCE
                        </StarBorder>
                    </div>
                </div>
            </div>
        </div>
    );
}

