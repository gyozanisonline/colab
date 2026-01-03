import React from 'react';

export default function Aurora() {
    const styles = {
        container: {
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'linear-gradient(45deg, #000000, #1a0b2e)',
            overflow: 'hidden',
        },
        blob: {
            position: 'absolute',
            filter: 'blur(80px)',
            opacity: 0.6,
            animation: 'float 10s infinite ease-in-out',
            borderRadius: '50%',
        },
        blob1: {
            top: '-10%',
            left: '-10%',
            width: '50vw',
            height: '50vw',
            background: '#ff00cc',
            animationDelay: '0s',
        },
        blob2: {
            top: '20%',
            right: '-20%',
            width: '60vw',
            height: '60vw',
            background: '#3333ff',
            animationDelay: '2s',
        },
        blob3: {
            bottom: '-20%',
            left: '20%',
            width: '70vw',
            height: '70vw',
            background: '#00ffcc',
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
