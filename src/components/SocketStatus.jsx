import { useState, useEffect } from 'react';

const SocketStatus = () => {
    const [status, setStatus] = useState('connecting'); // 'connected' | 'disconnected' | 'connecting'

    useEffect(() => {
        // socketManager.js exposes window.socket before React mounts,
        // but we poll briefly in case of a race on first render.
        let socket = window.socket;
        let pollInterval = null;

        const attach = (s) => {
            // Reflect current state immediately
            setStatus(s.connected ? 'connected' : 'connecting');

            s.on('connect', () => setStatus('connected'));
            s.on('disconnect', () => setStatus('disconnected'));
            s.on('connect_error', () => setStatus('disconnected'));
            s.on('reconnect_attempt', () => setStatus('connecting'));
        };

        if (socket) {
            attach(socket);
        } else {
            // Socket not yet assigned — poll for up to 3 seconds
            pollInterval = setInterval(() => {
                if (window.socket) {
                    clearInterval(pollInterval);
                    attach(window.socket);
                }
            }, 100);
            setTimeout(() => clearInterval(pollInterval), 3000);
        }

        return () => {
            clearInterval(pollInterval);
            // No need to remove socket.io listeners — they live with the socket lifetime
        };
    }, []);

    const colors = {
        connected: '#00e676',
        disconnected: '#ff5252',
        connecting: '#ffab40'
    };

    const labels = {
        connected: 'Live',
        disconnected: 'Offline',
        connecting: 'Connecting'
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '14px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 9000,
            pointerEvents: 'none',
            opacity: status === 'connected' ? 0.45 : 0.9,
            transition: 'opacity 0.4s ease'
        }}>
            <div style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: colors[status],
                boxShadow: status === 'connected' ? `0 0 6px ${colors[status]}` : 'none',
                animation: status === 'connecting' ? 'socketPulse 1s infinite' : 'none'
            }} />
            <span style={{
                fontSize: '10px',
                color: colors[status],
                fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
            }}>
                {labels[status]}
            </span>
            <style>{`
                @keyframes socketPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default SocketStatus;
