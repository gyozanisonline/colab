import { useState, useRef, useEffect } from 'react';
import { RiPlayFill, RiPauseFill } from 'react-icons/ri';

const InstagramAudioPlayer = ({ src, song, onPlayLibrary, forcePause }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (forcePause && audioRef.current) {
            audioRef.current.pause();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsPlaying(false);
        }
    }, [forcePause]);

    // If song picks changes, auto-play with offset
    useEffect(() => {
        if (src && audioRef.current) {
            if (song?.startTime) {
                audioRef.current.currentTime = song.startTime;
            }
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log("Autoplay blocked", e));
        }
    }, [src, song?.startTime]);

    const handleTimeUpdate = (e) => {
        const audio = e.target;
        // Loop logic: if we have a defined start/duration
        if (song?.startTime !== undefined && song?.duration) {
            const endTime = song.startTime + song.duration;
            if (audio.currentTime >= endTime) {
                audio.currentTime = song.startTime;
                audio.play();
            }
        }
    };

    const togglePlay = (e) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(38, 38, 38, 0.9)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px',
            padding: '10px', gap: '12px', width: '240px', maxWidth: '100%',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'transform 0.1s'
        }}
            onClick={onPlayLibrary}
        >
            {/* Cover Art */}
            <div style={{
                width: '40px', height: '40px', borderRadius: '6px',
                background: song?.coverColor || '#333',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                overflow: 'hidden'
            }}>
                {song?.coverUrl ? (
                    <img src={song.coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <RiPlayFill color="rgba(255,255,255,0.5)" size={20} />
                )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {song?.title || 'Select a song'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {song?.artist || 'Tap to browse'}
                </div>
            </div>

            {/* Play/Pause Button */}
            {src && (
                <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#fff', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isPlaying ? <RiPauseFill size={24} /> : <RiPlayFill size={24} />}
                </button>
            )}

            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            />
        </div>
    );
};

export default InstagramAudioPlayer;
