
import { useState, useEffect } from 'react';
import InfiniteMenu from './InfiniteMenu';

const CommunityGallery = ({ isActive, onCreateClick }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load gallery data immediately on mount (during intro screen)
        // Component remains hidden via CSS until isActive is true

        // Static items from Cloudinary
        const videoItems = [
            {
                image: 'https://placehold.co/600x900/333/666?text=Kimchi',
                video: 'https://res.cloudinary.com/dl93c5cwm/video/upload/v1769962105/colab-gallery-static/kimchi.mov',
                link: '#',
                title: 'Kimchi',
                description: '8'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Hello+World',
                video: 'https://res.cloudinary.com/dl93c5cwm/video/upload/v1769962107/colab-gallery-static/baby_born.mov',
                link: '#',
                title: 'Hello World!',
                description: 'Baby Born'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=I+Love+Watson',
                video: 'https://res.cloudinary.com/dl93c5cwm/video/upload/v1769962108/colab-gallery-static/watson.mov',
                link: '#',
                title: 'I Love Watson',
                description: 'Ayala Niv'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Pigs+In+Space',
                video: 'https://res.cloudinary.com/dl93c5cwm/video/upload/v1769962111/colab-gallery-static/pigs_in_space.mov',
                link: '#',
                title: 'Pigs In Space',
                description: 'Ruth Zajdner'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Self+Portrait',
                video: 'https://res.cloudinary.com/dl93c5cwm/video/upload/v1769962113/colab-gallery-static/self_portrait.mov',
                link: '#',
                title: 'Self Portrait',
                description: 'Yonatan Alperin'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Smile',
                video: 'https://res.cloudinary.com/dl93c5cwm/video/upload/v1769962115/colab-gallery-static/smile.mov',
                link: '#',
                title: 'Smile',
                description: 'Yoel Zajdner'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Aliens',
                video: 'https://res.cloudinary.com/dl93c5cwm/video/upload/v1769962116/colab-gallery-static/aliens.mov',
                link: '#',
                title: 'The Aliens are coming',
                description: 'Rotem Ronen'
            }
        ];

        const loadItems = async () => {
            setLoading(true);
            try {
                // Start Cloudinary sync in background (non-blocking)
                // Don't await this - let it run while we load and show items
                fetch('/api/sync-cloudinary', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.synced > 0) {
                            console.log(`[Gallery] Recovered ${data.synced} missing posters from Cloudinary`);
                            // Optionally reload items after sync completes
                            // For now, just log - items will appear on next gallery visit
                        }
                    })
                    .catch(err => console.warn('[Gallery] Cloudinary sync unavailable:', err));

                // Fetch user created posters immediately (don't wait for sync)
                const response = await fetch('/api/posters');
                const userPosters = await response.json();

                const formattedUserPosters = userPosters.map(p => ({
                    image: 'https://placehold.co/600x900/222/FFF?text=' + encodeURIComponent(p.title || 'Poster'),
                    video: p.videoUrl || p.video, // Cloudinary URL or legacy base64
                    link: '#',
                    title: p.title || 'Untitled',
                    description: p.author || 'Anonymous',
                    state: p.state // Store state for remixing later
                }));

                console.log(`Loading ${formattedUserPosters.length} user posters + ${videoItems.length} static items`);

                // Combine with static items - InfiniteMenu handles video errors with fallback
                setItems([...formattedUserPosters, ...videoItems]);
            } catch (err) {
                console.error("Failed to load posters", err);
                // Fallback to static only
                setItems(videoItems);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, []); // Empty deps = run once on mount, preload during intro

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #111, #222)',
            zIndex: 2000, // Above everything
            pointerEvents: isActive ? 'auto' : 'none', // Disable interactions when hidden
            overflow: 'hidden', // Important for canvas
            display: isActive ? 'block' : 'none' // Hide with CSS instead of conditional render
        }}>
            {loading ? (
                <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    Loading Gallery...
                </div>
            ) : (
                <InfiniteMenu items={items} scale={2.5} />
            )}

        </div>
    );
};

export default CommunityGallery;
