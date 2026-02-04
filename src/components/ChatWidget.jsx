import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdChatBubbleOutline, MdClose, MdSend } from 'react-icons/md';

const ChatWidget = () => {
    // UI State
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [hasUnread, setHasUnread] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Get User Identity from LocalStorage (or defaults)
    const getMyIdentity = () => ({
        name: localStorage.getItem('playerName') || 'Guest',
        color: localStorage.getItem('playerColor') || '#00ffcc'
    });

    // --- Socket Logic ---
    // --- Socket Logic ---
    useEffect(() => {
        let socket = window.socket;
        let intervalId = null;

        const handleMessage = (data) => {
            setMessages(prev => [...prev, data]);
            if (!isOpen) {
                setHasUnread(true);
            }
        };

        const attachListeners = (s) => {
            console.log('[ChatWidget] Attaching listeners to socket', s.id);
            s.off('chat_message', handleMessage); // cleanup old to be safe
            s.on('chat_message', handleMessage);
        };

        if (socket) {
            attachListeners(socket);
        } else {
            console.log('[ChatWidget] Waiting for socket...');
            intervalId = setInterval(() => {
                if (window.socket) {
                    console.log('[ChatWidget] Socket found!');
                    socket = window.socket;
                    attachListeners(socket);
                    clearInterval(intervalId);
                }
            }, 500);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (socket) {
                socket.off('chat_message', handleMessage);
            }
        };
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = () => {
        if (!inputValue.trim()) return;

        const { name, color } = getMyIdentity();
        const payload = {
            text: inputValue.trim(),
            name,
            color
        };

        // Emit to server
        if (window.socket) {
            window.socket.emit('chat_message', payload);
        }

        // Optimistic UI update (optional, but socket broadcast usually sends it back)
        // If server broadcasts to sender too, we don't need this. 
        // Based on server.js: socket.broadcast.emit -> Sends to everyone ELSE. 
        // So we MUST add it locally for ourselves.
        setMessages(prev => [...prev, payload]);

        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // --- Styles ---
    const styles = {
        container: {
            position: 'fixed',
            bottom: '30px',
            right: '20px',
            zIndex: 9000,
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            pointerEvents: 'auto' // Ensure clicks work
        },
        toggleButton: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: hasUnread ? '#E5B020' : 'linear-gradient(135deg, #222, #111)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isOpen ? 'rotate(90deg) scale(0)' : 'scale(1)',
            opacity: isOpen ? 0 : 1,
            position: 'absolute',
            bottom: 0,
            right: 0
        },
        chatWindow: {
            width: '300px',
            height: '400px',
            background: 'rgba(15, 15, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'bottom right',
            transform: isOpen ? 'scale(1)' : 'scale(0.8)',
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
            marginBottom: '0px'
        },
        header: {
            padding: '12px 15px',
            background: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#eee',
            fontSize: '0.9rem',
            fontWeight: '600',
            letterSpacing: '0.5px'
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.2rem',
            transition: 'color 0.2s'
        },
        messageList: {
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        message: {
            fontSize: '0.85rem',
            lineHeight: '1.4',
            maxWidth: '100%',
            wordBreak: 'break-word'
        },
        author: {
            fontWeight: 'bold',
            fontSize: '0.75rem',
            marginBottom: '2px',
            display: 'block'
        },
        inputArea: {
            padding: '10px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '8px',
            background: 'rgba(0,0,0,0.2)'
        },
        input: {
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.2s'
        },
        sendBtn: {
            background: 'none',
            border: 'none',
            color: '#E5B020',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'transform 0.1s'
        }
    };

    return createPortal(
        <div style={styles.container}>
            {/* Toggle Button (Icon) */}
            <button
                onClick={() => {
                    setIsOpen(true);
                    setHasUnread(false);
                }}
                style={styles.toggleButton}
                title="Open Chat"
            >
                <MdChatBubbleOutline size={24} />
                {hasUnread && <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    width: '12px',
                    height: '12px',
                    background: '#ff4444',
                    borderRadius: '50%',
                    border: '2px solid #222'
                }} />}
            </button>

            {/* Chat Window */}
            <div style={styles.chatWindow}>
                <div style={styles.header}>
                    <span>COMMUNITY CHAT</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={styles.closeBtn}
                        onMouseEnter={e => e.target.style.color = 'white'}
                        onMouseLeave={e => e.target.style.color = '#aaa'}
                    >
                        <MdClose />
                    </button>
                </div>

                <div style={styles.messageList}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#555', marginTop: '20px', fontSize: '0.8rem' }}>
                            No messages yet.<br />Say hello!
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} style={styles.message}>
                            <span style={{ ...styles.author, color: msg.color }}>{msg.name}</span>
                            <span style={{ color: '#ddd' }}>{msg.text}</span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div style={styles.inputArea}>
                    <input
                        ref={inputRef}
                        type="text"
                        name="chat-message"
                        id="chat-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        style={styles.input}
                        maxLength={140}
                    />
                    <button
                        onClick={sendMessage}
                        style={styles.sendBtn}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <MdSend />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ChatWidget;
