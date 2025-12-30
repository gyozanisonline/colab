const socket = io();

let isRemoteUpdate = false;

// --- MOUSE CURSOR LOGIC ---
let myName = localStorage.getItem('playerName') || 'Guest';
let myColor = localStorage.getItem('playerColor') || '#' + Math.floor(Math.random() * 16777215).toString(16);

// Init Inputs (Moved inside DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('player-name');
    const colorInput = document.getElementById('player-color');

    if (nameInput) {
        nameInput.value = myName === 'Guest' ? '' : myName;
        nameInput.addEventListener('input', (e) => {
            myName = e.target.value || 'Guest';
            localStorage.setItem('playerName', myName);
        });
    }

    if (colorInput) {
        colorInput.value = myColor;
        colorInput.addEventListener('input', (e) => {
            myColor = e.target.value;
            localStorage.setItem('playerColor', myColor);
        });
    }

    const cursorContainer = document.createElement('div');
    cursorContainer.id = 'cursor-layer';
    cursorContainer.style.position = 'fixed';
    cursorContainer.style.top = '0';
    cursorContainer.style.left = '0';
    cursorContainer.style.width = '100%';
    cursorContainer.style.height = '100%';
    cursorContainer.style.pointerEvents = 'none'; // Click through
    cursorContainer.style.zIndex = '9999';
    document.body.appendChild(cursorContainer);
});

// Track and Emit Mouse Movement (Throttled)
let lastEmit = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastEmit > 40) { // Limit to ~25fps equivalent
        socket.emit('mouse_move', {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
            color: myColor,
            name: myName
        });
        lastEmit = now;
    }
});

// Render Remote Cursors
socket.on('remote_mouse_move', (data) => {
    let cursor = document.getElementById(`cursor-${data.id}`);

    // Create cursor if new
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = `cursor-${data.id}`;
        cursor.className = 'remote-cursor';
        cursor.style.position = 'absolute';
        cursor.style.width = '15px';
        cursor.style.height = '15px';
        cursor.style.borderRadius = '50%';
        cursor.style.border = '2px solid white';
        cursor.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
        cursor.style.transition = 'top 0.1s linear, left 0.1s linear'; // Smooth movement

        // Add Label
        const label = document.createElement('span');
        label.className = 'cursor-label';
        label.style.position = 'absolute';
        label.style.whiteSpace = 'nowrap';
        label.style.fontSize = '12px';
        label.style.backgroundColor = 'rgba(0,0,0,0.7)';
        label.style.color = 'white';
        label.style.padding = '2px 5px';
        label.style.borderRadius = '3px';
        label.style.left = '20px';
        label.style.top = '0px';
        cursor.appendChild(label);

        cursorContainer.appendChild(cursor);
    }

    // Update visual properties
    cursor.style.left = (data.x * 100) + '%';
    cursor.style.top = (data.y * 100) + '%';
    cursor.style.backgroundColor = data.color;

    // Update Label
    const label = cursor.querySelector('.cursor-label');
    if (label) {
        label.innerText = data.name || 'Guest';
        // Optional: Hide label if it's strictly "Guest" to reduce clutter, or keep it.
        // label.style.display = data.name ? 'block' : 'none'; 
    }
});

socket.on('remote_mouse_remove', (data) => {
    const cursor = document.getElementById(`cursor-${data.id}`);
    if (cursor) cursor.remove();
});


// --- LISTEN FOR UPDATES FROM SERVER ---

socket.on('update_state', (data) => {
    // data = { type: 'text', value: '...', key: '...' }
    // console.log('Remote update received:', data);

    isRemoteUpdate = true; // Flag to prevent echo loops

    try {
        if (data.type === 'text') {
            // Update Text Area
            const textArea = document.getElementById("textArea");
            if (textArea) {
                textArea.value = data.value;
                if (window.setText) window.setText(); // Trigger p5 update
            }
        } else if (data.type === 'param') {
            // Update Sliders / Inputs
            const input = document.getElementById(data.key);
            if (input) {
                input.value = data.value;
                // Dispatch input event to trigger existing listeners
                input.dispatchEvent(new Event('input'));
                input.dispatchEvent(new Event('change'));
            }
        } else if (data.type === 'function') {
            // Direct function call (e.g. toggles)
            if (typeof window[data.name] === 'function') {
                // For toggles that expect TRUE/FALSE
                window[data.name](data.value);
            }
        }
    } catch (e) {
        console.error("Error applying remote update:", e);
    }

    isRemoteUpdate = false; // Reset flag
});

// --- EMIT UPDATES TO SERVER ---

function emitChange(type, key, value) {
    if (isRemoteUpdate) return; // Don't emit if we just received this from server

    socket.emit('update_state', {
        type: type,
        key: key,
        value: value
    });
}

function emitFunction(funcName, value) {
    if (isRemoteUpdate) return;

    socket.emit('update_state', {
        type: 'function',
        name: funcName,
        value: value
    });
}

// --- CHAT LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const toggleChatBtn = document.getElementById('toggle-chat');
    const chatHeader = document.getElementById('chat-header');

    // Toggle Chat
    if (toggleChatBtn && chatContainer) {
        const toggle = () => {
            chatContainer.classList.toggle('minimized');
            toggleChatBtn.innerText = chatContainer.classList.contains('minimized') ? 'square' : '_';
        };
        toggleChatBtn.addEventListener('click', toggle);
        chatHeader.addEventListener('click', toggle);
    }

    // Send Message Logic
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text) {
            const payload = {
                text: text,
                name: myName,
                color: myColor
            };

            // Emit to server
            socket.emit('chat_message', payload);

            // Show locally immediately
            appendMessage(payload, true);

            chatInput.value = '';
        }
    }

    if (chatSend) chatSend.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Expose append function for socket event to use
    window.appendChatMessage = function (data, isMe) {
        if (!chatMessages) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg';
        msgDiv.style.borderLeft = `3px solid ${data.color || 'white'}`;

        const nameSpan = document.createElement('strong');
        nameSpan.innerText = (data.name || 'Guest') + ':';
        nameSpan.style.color = data.color || 'white';

        const textSpan = document.createElement('span');
        textSpan.innerText = data.text;

        msgDiv.appendChild(nameSpan);
        msgDiv.appendChild(textSpan);

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };
});

// Receive Message (can be outside because socket object exists)
socket.on('chat_message', (data) => {
    if (window.appendChatMessage) {
        window.appendChatMessage(data, false);
    }
});

// Helper for local append (needs to wait for window.appendChatMessage to be ready)
function appendMessage(data, isMe) {
    if (window.appendChatMessage) {
        window.appendChatMessage(data, isMe);
    }
}


// Expose to window so other scripts can use it
window.emitChange = emitChange;
window.emitFunction = emitFunction;

