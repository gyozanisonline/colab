
import React, { useState, useEffect } from 'react';
import InfiniteMenu from './InfiniteMenu';

const CommunityGallery = ({ isActive }) => {
    const [items, setItems] = useState([]);
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

            // Map posters to InfiniteMenu items format
            const menuItems = data.map(poster => ({
                // Dynamic placeholder image with text
                image: `https://placehold.co/600x900/111/fff?text=${encodeURIComponent(poster.text.replace(/\n/g, ' '))}`,
                title: poster.author || 'Anonymous',
                description: new Date(poster.createdAt).toLocaleDateString(),
                link: '' // No link for now
            }));

            // If no items, add a default one or InfiniteMenu might break/be empty
            if (menuItems.length === 0) {
                menuItems.push({
                    image: 'https://placehold.co/600x900/111/fff?text=No+Posters+Yet',
                    title: 'Empty',
                    description: 'Be the first to share!',
                    link: ''
                });
            }

            setItems(menuItems);
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
            zIndex: 2000, // Above everything
            pointerEvents: 'auto',
            overflow: 'hidden' // Important for canvas
        }}>
            {loading ? (
                <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    Loading Gallery...
                </div>
            ) : (
                <InfiniteMenu items={items} scale={0.5} />
            )}

            {/* Title Overlay */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '40px',
                color: 'white',
                pointerEvents: 'none',
                zIndex: 10
            }}>
                <h1 style={{ fontSize: '2rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Community Gallery</h1>
                <p style={{ opacity: 0.7, margin: 0 }}>Drag to explore • Click to expand</p>
            </div>
        </div>
    );
};

export default CommunityGallery;
