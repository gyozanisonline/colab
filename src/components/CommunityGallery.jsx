
import { useState, useEffect } from 'react';
import InfiniteMenu from './InfiniteMenu';

const CommunityGallery = ({ isActive, onCreateClick }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isActive) return;

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
                // Fetch user created posters
                const response = await fetch('/api/posters');
                const userPosters = await response.json();

                const formattedUserPosters = userPosters.map(p => ({
                    image: 'https://placehold.co/600x900/222/FFF?text=' + encodeURIComponent(p.title), // Placeholder or thumbnail if we had one
                    video: p.videoUrl || p.video, // Cloudinary URL or legacy base64
                    link: '#',
                    title: p.title,
                    description: p.author,
                    state: p.state // Store state for remixing later
                }));

                // Combine with static items
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
    }, [isActive]);

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
                <InfiniteMenu items={items} scale={2.5} />
            )}

            {/* Title Overlay - same height as top-right buttons */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '40px',
                color: 'white',
                pointerEvents: 'none',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '50px' // Match approx height of button area
            }}>
                <h1 style={{ fontSize: '2rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '0.1em' }}>GALLERY</h1>
                <p style={{ opacity: 0.7, margin: '4px 0 0 0', fontSize: '0.85rem' }}>Drag to explore • Click to expand</p>
            </div>
        </div>
    );
};

export default CommunityGallery;
