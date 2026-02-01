import { useState, useRef, useEffect } from 'react';
import { RiPlayFill, RiPauseFill, RiCheckboxCircleFill, RiArrowLeftLine } from 'react-icons/ri';
import StarBorder from './StarBorder';

const AudioTrimmer = ({ song, isOpen, onClose, onSave, onPlayStateChange, onBack }) => {
    const [duration, setDuration] = useState(30);
    const [startTime, setStartTime] = useState(song?.startTime || 0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const CLIP_DURATION = 15;

    const audioRef = useRef(null);
    const animationFrame = useRef(null);
    const startTimeRef = useRef(startTime);

    useEffect(() => {
        startTimeRef.current = startTime;
    }, [startTime]);

    useEffect(() => {
        return () => {
            if (onPlayStateChange) onPlayStateChange(false);
        };
    }, []);

    useEffect(() => {
        if (isOpen && song?.url) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = song.url;
                audioRef.current.load();
            } else {
                audioRef.current = new Audio(song.url);
            }

            const audio = audioRef.current;
            const handleMetadata = () => {
                if (isFinite(audio.duration)) {
                    setDuration(audio.duration);
                    if (startTime + CLIP_DURATION > audio.duration) {
                        setStartTime(Math.max(0, audio.duration - CLIP_DURATION));
                    }
                }
            };

            audio.addEventListener('loadedmetadata', handleMetadata);
            return () => {
                audio.removeEventListener('loadedmetadata', handleMetadata);
                audio.pause();
                cancelAnimationFrame(animationFrame.current);
                if (onPlayStateChange) onPlayStateChange(false);
            };
        }
    }, [isOpen, song?.url]);

    const checkLoop = () => {
        const audio = audioRef.current;
        if (!audio) return;

        const sTime = startTimeRef.current;
        const endTime = Math.min(sTime + CLIP_DURATION, duration);
        const currentPos = audio.currentTime;
        const relPos = (currentPos - sTime) / CLIP_DURATION;
        setProgress(Math.max(0, Math.min(1, relPos)));

        if (currentPos >= endTime) {
            audio.currentTime = sTime;
            audio.play().catch(() => { });
        }

        if (!audio.paused) {
            animationFrame.current = requestAnimationFrame(checkLoop);
        }
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            if (onPlayStateChange) onPlayStateChange(false);
            cancelAnimationFrame(animationFrame.current);
        } else {
            if (audio.currentTime < startTime || audio.currentTime >= startTime + CLIP_DURATION) {
                audio.currentTime = startTime;
            }
            audio.play().then(() => {
                setIsPlaying(true);
                if (onPlayStateChange) onPlayStateChange(true);
                cancelAnimationFrame(animationFrame.current);
                animationFrame.current = requestAnimationFrame(checkLoop);
            }).catch(e => console.log("Play error", e));
        }
    };

    const handleDrag = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));

        const maxStart = Math.max(0, duration - CLIP_DURATION);
        let newStart = percent * duration - (CLIP_DURATION / 2);
        newStart = Math.max(0, Math.min(maxStart, newStart));

        setStartTime(newStart);
        startTimeRef.current = newStart;
        setProgress(0);

        if (audioRef.current && isPlaying) {
            audioRef.current.currentTime = newStart;
        }
    };

    const handleSave = () => {
        if (audioRef.current) audioRef.current.pause();
        onSave(startTime, CLIP_DURATION);
        onClose();
    };

    if (!isOpen) return null;

    const leftPercent = (startTime / duration) * 100;
    const widthPercent = (Math.min(CLIP_DURATION, duration) / duration) * 100;

    return (
        <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: '400px',
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px', padding: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,255,255,0.1)', zIndex: 10000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                background: 'transparent', border: 'none', color: '#888',
                                cursor: 'pointer', display: 'flex', transition: 'color 0.2s',
                                padding: '4px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'white'}
                            onMouseLeave={e => e.currentTarget.style.color = '#888'}
                        >
                            <RiArrowLeftLine size={24} />
                        </button>
                    )}
                    <span style={{ fontSize: '1rem', color: '#fff', fontWeight: '600', letterSpacing: '-0.02em' }}>
                        Trim Clip
                    </span>
                </div>

                <StarBorder
                    as="button"
                    className="save-btn"
                    color="#E5B020"
                    speed="4s"
                    onClick={handleSave}
                    style={{ fontSize: '0.8rem', '--star-padding': '6px 16px' }}
                >
                    DONE
                </StarBorder>
            </div>

            {/* Timeline Track */}
            <div
                style={{
                    position: 'relative', height: '60px', background: '#333',
                    borderRadius: '8px', marginBottom: '16px', cursor: 'ew-resize', overflow: 'hidden'
                }}
                onClick={handleDrag}
                onMouseMove={(e) => { if (e.buttons === 1) handleDrag(e); }}
            >
                {/* Fake Waveform Pattern */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', opacity: 0.3 }}>
                    {Array.from({ length: 60 }).map((_, i) => (
                        <div key={i} style={{ width: '4px', height: `${20 + Math.random() * 70}%`, background: '#fff', borderRadius: '2px' }} />
                    ))}
                </div>

                {/* Selected Window */}
                <div style={{
                    position: 'absolute', left: `${leftPercent}%`, width: `${widthPercent}%`,
                    top: 0, bottom: 0, background: 'rgba(229, 176, 32, 0.2)',
                    border: '2px solid #E5B020', borderRadius: '6px', boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {/* Center Play Button Overlay */}
                    <button
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        style={{
                            background: 'rgba(0,0,0,0.6)', borderRadius: '50%',
                            width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)',
                            zIndex: 10, transition: 'transform 0.1s active'
                        }}
                    >
                        {isPlaying ? <RiPauseFill size={20} /> : <RiPlayFill size={20} />}
                    </button>

                    {/* Playhead */}
                    {isPlaying && (
                        <div style={{
                            position: 'absolute', left: `${progress * 100}%`, top: 0, bottom: 0,
                            width: '2px', background: '#fff', boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                            pointerEvents: 'none'
                        }} />
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -45%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }
            `}</style>
        </div>
    );
};

export default AudioTrimmer;
