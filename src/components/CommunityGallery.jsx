
import { useState, useEffect } from 'react';
import InfiniteMenu from './InfiniteMenu';

import videoKimchi from '../../assets/Video Gallery Content/kimchi.mov';
import videoBaby from '../../assets/Video Gallery Content/baby_born.mov';
import videoWatson from '../../assets/Video Gallery Content/watson.mov';
import videoPigs from '../../assets/Video Gallery Content/pigs_in_space.mov';
import videoPortrait from '../../assets/Video Gallery Content/self_portrait.mov';
import videoSmile from '../../assets/Video Gallery Content/smile.mov';
import videoAliens from '../../assets/Video Gallery Content/aliens.mov';

const CommunityGallery = ({ isActive }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isActive) return;

        // Static items from video-gallery (Assets removed to save space)
        // Imported video items
        const videoItems = [
            {
                image: 'https://placehold.co/600x900/333/666?text=Kimchi',
                video: videoKimchi,
                link: '#',
                title: 'Kimchi',
                description: '8'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Hello+World',
                video: videoBaby,
                link: '#',
                title: 'Hello World!',
                description: 'Baby Born'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=I+Love+Watson',
                video: videoWatson,
                link: '#',
                title: 'I Love Watson',
                description: 'Ayala Niv'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Pigs+In+Space',
                video: videoPigs,
                link: '#',
                title: 'Pigs In Space',
                description: 'Ruth Zajdner'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Self+Portrait',
                video: videoPortrait,
                link: '#',
                title: 'Self Portrait',
                description: 'Yonatan Alperin'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Smile',
                video: videoSmile,
                link: '#',
                title: 'Smile',
                description: 'Yoel Zajdner'
            },
            {
                image: 'https://placehold.co/600x900/333/666?text=Aliens',
                video: videoAliens,
                link: '#',
                title: 'The Aliens are coming',
                description: 'Rotem Ronen'
            }
        ];

        const loadItems = async () => {
            setLoading(true);
            try {
                // For now, use static video items instead of API
                setItems(videoItems);
            } catch (err) {
                console.error("Failed to load posters", err);
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
