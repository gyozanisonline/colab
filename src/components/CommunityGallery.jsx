
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

    // Static items from video-gallery
    const videoItems = [
        {
            image: '/Sources/In Edit.png',
            video: '/Sources/5.mp4',
            link: '#',
            title: 'Video 5',
            description: 'Dynamic content'
        },
        {
            image: '/Sources/MOTIONO.jpg',
            video: '/Sources/8.mp4',
            link: '#',
            title: 'Video 8',
            description: 'High energy'
        },
        {
            image: '/Sources/No Fucking Way-02.png',
            video: '/Sources/19573402-uhd_2160_3840_60fps (1).mp4',
            link: '#',
            title: 'UHD Video',
            description: '4K Content'
        },
        {
            image: '/Sources/PHOTO-2024-12-26-21-52-41.jpg',
            video: '/Sources/310351041_837190630653178_3491063964510673308_n.mp4',
            link: '#',
            title: 'Social Clip',
            description: 'Viral moment'
        },
        {
            image: '/Sources/POST POSTER scanned and re edited.jpg',
            video: '/Sources/Aceite-De-Oliva-(feat.-Mayan-Green,-Yair-Divshi-&-Omri-Alon)---Single_coverImagePortraitMotionV2_2024-10-22T19_32.mp4',
            link: '#',
            title: 'Music Video',
            description: 'Aceite De Oliva'
        },
        {
            image: '/Sources/Poster Sized Puzzle pre lighting.png',
            video: '/Sources/6021FD78-4901-4735-B7A1-6C07A087FA11.MP4',
            link: '#',
            title: 'Video 6021',
            description: 'Raw footage'
        },
        {
            image: '/Sources/Ran Poster Draft.png',
            video: '/Sources/6151AFC9-9317-402F-BFD8-136304135786.MP4',
            link: '#',
            title: 'Video 6151',
            description: 'Creative draft'
        },
        {
            image: '/Sources/Road Safety-01.png',
            video: '/Sources/7cda882cf3e04386a7af53221c55a0ee.mp4',
            link: '#',
            title: 'Video 7cda',
            description: 'Safety first'
        },
        // Adding duplicates to fill out the grid if needed
        {
            image: '/Sources/WATER GONG.jpg',
            video: '/Sources/5.mp4',
            link: '#',
            title: 'Water Gong',
            description: 'Relaxing sounds'
        },
        {
            image: '/Sources/Yes Thats A chair.png',
            video: '/Sources/8.mp4',
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
