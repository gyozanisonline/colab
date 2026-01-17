
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

    // Static items from video-gallery (Assets removed to save space)
    const videoItems = [
        {
            image: 'https://placehold.co/600x900/333/666?text=Video+5',
            video: null,
            link: '#',
            title: 'Video 5',
            description: 'Dynamic content'
        },
        {
            image: 'https://placehold.co/600x900/333/666?text=Video+8',
            video: null,
            link: '#',
            title: 'Video 8',
            description: 'High energy'
        },
        {
            image: 'https://placehold.co/600x900/333/666?text=UHD+Video',
            video: null,
            link: '#',
            title: 'UHD Video',
            description: '4K Content'
        },
        {
            image: 'https://placehold.co/600x900/333/666?text=Social+Clip',
            video: null,
            link: '#',
            title: 'Social Clip',
            description: 'Viral moment'
        },
        {
            image: 'https://placehold.co/600x900/333/666?text=Music+Video',
            video: null,
            link: '#',
            title: 'Music Video',
            description: 'Aceite De Oliva'
        },
        {
            image: 'https://placehold.co/600x900/333/666?text=Video+6021',
            video: null,
            link: '#',
            title: 'Video 6021',
            description: 'Raw footage'
        },
        {
            image: 'https://placehold.co/600x900/333/666?text=Video+6151',
            video: null,
            link: '#',
            title: 'Video 6151',
            description: 'Creative draft'
        },
        {
            image: 'https://placehold.co/600x900/333/666?text=Video+7cda',
            video: null,
            link: '#',
            title: 'Video 7cda',
            description: 'Safety first'
        },
        // Adding duplicates to fill out the grid if needed
        {
            image: 'https://placehold.co/600x900/333/666?text=Water+Gong',
            video: null,
            link: '#',
            title: 'Water Gong',
            description: 'Relaxing sounds'
        },
        {
            image: 'https://placehold.co/600x900/333/666?text=Chair+Study',
            video: null,
            link: '#',
            title: 'Chair Study',
            description: 'Modern art'
        }
    ];

    const fetchPosters = async () => {
        setLoading(true);
        try {
            // For now, use static video items instead of API
            // const res = await fetch('/api/posters');
            // const data = await res.json();

            // Just set the static items
            setItems(videoItems);

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
