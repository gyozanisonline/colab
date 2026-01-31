import { useState, useRef, useEffect, useCallback } from 'react';
import { RiSearchLine, RiPlayFill, RiPauseFill, RiAddCircleLine } from 'react-icons/ri';

const MusicLibrary = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewSong, setPreviewSong] = useState(null);
    const audioRef = useRef(new Audio());
    const searchTimeout = useRef(null);

    const fetchTracks = async (query) => {
        try {
            const res = await fetch(`/api/music-search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.results) {
                // Strict filter for Gyozan to avoid "Gyoza"
                let tracks = data.results;
                if (query.toLowerCase() === 'gyozan') {
                    tracks = tracks.filter(t => t.artistName.toLowerCase().includes('gyozan'));
                }

                return tracks.map(item => ({
                    id: item.trackId,
                    title: item.trackName,
                    artist: item.artistName,
                    coverColor: '#333',
                    coverUrl: item.artworkUrl100,
                    url: item.previewUrl
                }));
            }
            return [];
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const searchMusic = useCallback(async (query) => {
        if (!query) return;
        setLoading(true);
        const songs = await fetchTracks(query);
        setResults(songs);
        setLoading(false);
    }, []);

    // Initial load of specific artists
    useEffect(() => {
        if (isOpen && results.length === 0) {
            const loadDefaults = async () => {
                setLoading(true);
                // Fetch Gyozan first to ensure he's represented
                const gyozanTracks = await fetchTracks('Gyozan');

                const otherArtists = ['Flume', 'DJ Shadow', 'Clams Casino', 'Aphex Twin', 'Boards of Canada']; // Added a few more for diversity
                const promises = otherArtists.map(artist => fetchTracks(artist));
                const otherOutcomes = await Promise.all(promises);

                let combinedOthers = [];
                otherOutcomes.forEach(list => combinedOthers.push(...list));

                // 1. Featured Song: Pick randomly from ALL fetched Gyozan tracks for maximum variety
                let featured = null;
                let gyozanPool = [...gyozanTracks];

                if (gyozanPool.length > 0) {
                    // Pick from the entire available pool, not just top 5
                    const randIndex = Math.floor(Math.random() * gyozanPool.length);
                    featured = gyozanPool[randIndex];
                    // Remove featured from pool so it's not duplicated
                    gyozanPool.splice(randIndex, 1);
                }

                // 2. High Priority Mix (Next 7 spots to make top 8)
                // We want at least 2 more Gyozan tracks here (so 1 + 2 = 3 in top 8)
                const moreGyozan = gyozanPool.length > 1 ? gyozanPool.slice(0, 2) : gyozanPool;
                const remainingGyozan = gyozanPool.length > 2 ? gyozanPool.slice(2) : [];

                // Fill the rest of the top 8 (7 slots total) with others
                // 7 slots - moreGyozan.length needed from others
                const neededFromOthers = 7 - moreGyozan.length;
                const topOthers = combinedOthers.slice(0, neededFromOthers);
                const remainingOthers = combinedOthers.slice(neededFromOthers);

                // Mix the priority pool (excluding featured)
                const priorityPool = [...moreGyozan, ...topOthers];
                // Shuffle priority pool
                for (let i = priorityPool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [priorityPool[i], priorityPool[j]] = [priorityPool[j], priorityPool[i]];
                }

                // 3. The General Pool (Everything else)
                const mainPool = [...remainingGyozan, ...remainingOthers];
                // Shuffle main pool
                for (let i = mainPool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [mainPool[i], mainPool[j]] = [mainPool[j], mainPool[i]];
                }

                // Final list: Featured -> Priority Mix -> General Pool
                const finalResults = [];
                if (featured) finalResults.push(featured);
                finalResults.push(...priorityPool);
                finalResults.push(...mainPool);

                setResults(finalResults);
                setLoading(false);
            };
            loadDefaults();
        }
    }, [isOpen, results.length]);

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (val.length > 2) {
            searchTimeout.current = setTimeout(() => {
                searchMusic(val);
            }, 500);
        }
    };

    if (!isOpen) return null;

    const handlePreview = (song) => {
        if (previewSong?.id === song.id) {
            audioRef.current.pause();
            setPreviewSong(null);
        } else {
            audioRef.current.src = song.url;
            audioRef.current.play().catch(e => console.log('Audio play error', e));
            setPreviewSong(song);
        }
    };

    const handleSelect = (song) => {
        audioRef.current.pause();
        onSelect(song);
        onClose();
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(20, 20, 20, 0.98)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
            borderRadius: '12px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                        <RiSearchLine />
                    </div>
                    <input
                        type="text"
                        placeholder="Search music..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{
                            width: '90%',
                            background: '#333',
                            border: 'none',
                            padding: '12px 12px 12px 40px',
                            borderRadius: '8px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '1rem'
                        }}
                        autoFocus
                    />
                </div>
                <button
                    onClick={() => { audioRef.current.pause(); onClose(); }}
                    style={{ background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px' }}>
                    Cancel
                </button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading && <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>Searching...</div>}

                {!loading && results.map(song => (
                    <div key={song.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '15px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        {/* Cover Art */}
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '6px',
                            marginRight: '15px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                            onClick={() => handlePreview(song)}
                        >
                            <img src={song.coverUrl} alt="art" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {/* Play Overlay */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(0,0,0,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {previewSong?.id === song.id ? <RiPauseFill size={24} color="white" /> : <RiPlayFill size={24} color="white" />}
                            </div>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }} onClick={() => handleSelect(song)}>
                            <div style={{ color: 'white', fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>{song.title}</div>
                            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{song.artist}</div>
                        </div>

                        {/* Add Icon */}
                        <div onClick={() => handleSelect(song)} style={{ opacity: 0.7, padding: '5px' }}>
                            <RiAddCircleLine size={28} />
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
            `}</style>
        </div>
    );
};

export default MusicLibrary;
