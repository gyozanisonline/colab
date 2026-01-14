import React from 'react';
import { useControls } from 'leva';

export default function Aurora() {
    const { bg, color1, color2, color3, speed, blobSize } = useControls('Aurora', {
        bg: '#000000',
        color1: '#ff00cc',
        color2: '#3333ff',
        color3: '#00ffcc',
        speed: { value: 10, min: 2, max: 30 },
        blobSize: { value: 60, min: 30, max: 100, label: 'Blob Size (%)' }
    });

    const styles = {
        container: {
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            background: `linear-gradient(45deg, ${bg}, #1a0b2e)`,
            overflow: 'hidden',
        },
        blob: {
            position: 'absolute',
            filter: 'blur(80px)',
            opacity: 0.6,
            animation: `float ${speed}s infinite ease-in-out`,
            borderRadius: '50%',
        },
        blob1: {
            top: '-10%',
            left: '-10%',
            width: `${blobSize}vw`,
            height: `${blobSize}vw`,
            background: color1,
            animationDelay: '0s',
        },
        blob2: {
            top: '20%',
            right: '-20%',
            width: `${blobSize * 1.2}vw`,
            height: `${blobSize * 1.2}vw`,
            background: color2,
            animationDelay: '2s',
        },
        blob3: {
            bottom: '-20%',
            left: '20%',
            width: `${blobSize * 1.4}vw`,
            height: `${blobSize * 1.4}vw`,
            background: color3,
            animationDelay: '4s',
        }
    };

    return (
        <div style={styles.container}>
            <style>
                {`
          @keyframes float {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
        `}
            </style>
            <div style={{ ...styles.blob, ...styles.blob1 }}></div>
            <div style={{ ...styles.blob, ...styles.blob2 }}></div>
            <div style={{ ...styles.blob, ...styles.blob3 }}></div>
        </div>
    );
}
