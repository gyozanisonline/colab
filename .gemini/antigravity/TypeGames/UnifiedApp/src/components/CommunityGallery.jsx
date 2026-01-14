
import React, { useState, useEffect } from 'react';

const CommunityGallery = ({ isActive, onBack }) => {
    const [posters, setPosters] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isActive) {
            fetchPosters();
        }
    }, [isActive]);

    const fetchPosters = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/posters');
            const data = await res.json();
            setPosters(data);
        } catch (err) {
            console.error("Failed to load posters", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isActive) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #111, #222)',
            color: 'white',
            zIndex: 2000, // Above everything
            padding: '80px 40px',
            overflowY: 'auto',
            fontFamily: 'sans-serif',
            pointerEvents: 'auto'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                Community Gallery
            </h1>

            {loading ? <p>Loading...</p> : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {posters.map(poster => (
                        <div key={poster.id} style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '10px',
                            padding: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <div style={{
                                height: '150px',
                                background: '#000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '5px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {/* Mini Preview - Just styled text for V1 */}
                                <div style={{
                                    color: poster.params?.foreColor || 'white',
                                    fontSize: '1.2rem',
                                    textAlign: 'center',
                                    lineHeight: 1.2
                                }}>
                                    {poster.text}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{poster.author}</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                                    {new Date(poster.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <button style={{
                                marginTop: 'auto',
                                padding: '8px 15px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                onClick={() => {
                                    // TODO: Load this poster
                                    // For now just log it
                                    console.log("Load poster:", poster);
                                    alert("Loading posters not implemented in V1 yet!\nBut here is the data:\n" + JSON.stringify(poster, null, 2));
                                }}
                            >
                                Inspect
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunityGallery;
