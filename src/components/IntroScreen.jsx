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
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '30px',
                        width: '100%'
                    }}>
                        <StarBorder
                            as="button"
                            className="create-btn-wrapper"
                            color="#00ffcc"
                            speed="3s"
                            onClick={() => onComplete('create')}
                        >
                            CREATE POSTER
                        </StarBorder>

                        <StarBorder
                            as="button"
                            className="create-btn-wrapper"
                            color="#ff00cc"
                            speed="3s"
                            onClick={() => onComplete('gallery')}
                        >
                            EXPLORE GALLERY
                        </StarBorder>
                    </div>
                </div>
            </div>
        </div>
    );
}
