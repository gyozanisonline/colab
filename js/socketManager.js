const socket = io();
window.socket = socket; // Expose immediately for React components

let isRemoteUpdate = false;
window.isRemoteUpdate = false; // Initial expose

// We need to keep window.isRemoteUpdate in sync or just use window.isRemoteUpdate everywhere.
// For safety with existing code, we'll sync them.
Object.defineProperty(window, 'isRemoteUpdate', {
    get: () => isRemoteUpdate,
    set: (val) => { isRemoteUpdate = val; }
});

// --- MOUSE CURSOR LOGIC ---
let myName = localStorage.getItem('playerName') || 'Guest';
let myColor = localStorage.getItem('playerColor') || '#' + Math.floor(Math.random() * 16777215).toString(16);

// Init Inputs (Moved inside DOMContentLoaded)
let cursorContainer; // Global scope for socket handlers

document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('player-name');
    const colorInput = document.getElementById('player-color');

    function forceUpdate() {
        socket.emit('mouse_move', {
            x: 0.5, // Center/Default or keep last position if we tracked it? 
            // Better to track last position, but for now 0.5 is safe or we can just send update event
            // actually 'mouse_move' expects x/y. 
            // Let's use a global lastX/lastY to be accurate
            x: window.lastMouseX || 0.5,
            y: window.lastMouseY || 0.5,
            color: myColor,
            name: myName
        });
    }

    if (nameInput) {
        nameInput.value = myName === 'Guest' ? '' : myName;
        nameInput.addEventListener('input', (e) => {
            myName = e.target.value || 'Guest';
            localStorage.setItem('playerName', myName);
            forceUpdate();
        });
    }

    if (colorInput) {
        colorInput.value = myColor;
        colorInput.addEventListener('input', (e) => {
            myColor = e.target.value;
            localStorage.setItem('playerColor', myColor);
            forceUpdate();
        });
    }

    cursorContainer = document.createElement('div');
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
    // Track global position for forceUpdate
    window.lastMouseX = e.clientX / window.innerWidth;
    window.lastMouseY = e.clientY / window.innerHeight;

    const now = Date.now();

    // Check high fives interactions
    if (typeof checkCollisions === 'function') {
        checkCollisions();
    }

    if (now - lastEmit > 40) { // Limit to ~25fps equivalent
        socket.emit('mouse_move', {
            x: window.lastMouseX,
            y: window.lastMouseY,
            color: myColor,
            name: myName
        });
        lastEmit = now;
    }
});

// Remote Cursors Map: { id: { x: 0, y: 0, lastHighFive: 0 } }
const remoteCursors = {};

// Render Remote Cursors
socket.on('remote_mouse_move', (data) => {
    // Update data map
    if (!remoteCursors[data.id]) {
        remoteCursors[data.id] = { x: data.x, y: data.y, lastHighFive: 0 };
    } else {
        remoteCursors[data.id].x = data.x;
        remoteCursors[data.id].y = data.y;
    }

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
    }
});

socket.on('remote_mouse_remove', (data) => {
    const cursor = document.getElementById(`cursor-${data.id}`);
    if (cursor) cursor.remove();
    delete remoteCursors[data.id];
});


// --- HIGH FIVE COLLISION LOGIC ---
function spawnHighFive(x, y) {
    const emoji = document.createElement('div');
    emoji.innerText = '✋'; // Or '✨'
    emoji.className = 'high-five-emoji';
    emoji.style.left = (x * 100) + '%';
    emoji.style.top = (y * 100) + '%';
    document.body.appendChild(emoji);

    // Remove after animation
    setTimeout(() => {
        emoji.remove();
    }, 1000);
}

function checkCollisions() {
    const myX = window.lastMouseX;
    const myY = window.lastMouseY;
    if (myX === undefined || myY === undefined) return;

    const threshold = 0.05; // ~5% of screen width distance
    const now = Date.now();

    for (const id in remoteCursors) {
        const remote = remoteCursors[id];
        // Euclidean distance
        const dist = Math.hypot(myX - remote.x, myY - remote.y);

        if (dist < threshold) {
            // Collision! Check cooldown
            if (now - remote.lastHighFive > 2000) {
                spawnHighFive(myX, myY);
                // Mark cooldown for THIS remote user
                remote.lastHighFive = now;
            }
        }
    }
}

// Check for high fives more frequently than emit? Or same loop?
// Let's hook into the mousemove loop since we have it.



// --- LISTEN FOR UPDATES FROM SERVER ---

// Receive Initial State (On Connection)
socket.on('initial_state', (state) => {
    if (state.text) {
        // Update text area and type instance
        const textArea = document.getElementById('textArea');
        const typeInput = document.getElementById('type-text');

        if (textArea) textArea.value = state.text;
        if (typeInput) typeInput.value = state.text;

        if (window.typeInstance) window.typeInstance.updateParams('text', state.text);
    }

    if (state.params) {
        // Update all stored parameters
        Object.keys(state.params).forEach(key => {
            const value = state.params[key];
            updateParamFromSocket(key, value);
        });
    }
});

// Receive State Update
socket.on('update_state', (data) => {
    // console.log('Received update:', data);
    isRemoteUpdate = true; // Flag to prevent echo loop

    try {
        if (data.type === 'text') {
            const textArea = document.getElementById('textArea');
            if (textArea) {
                textArea.value = data.value;
                if (window.setText) window.setText();
            }
        } else if (data.type === 'param') {
            updateParamFromSocket(data.key, data.value);
        }
    } catch (err) {
        console.error("Error handling remote update:", err);
    } finally {
        isRemoteUpdate = false;
    }
});

// Helper function to update UI and Instances
function updateParamFromSocket(key, value) {
    // 1. Update UI Input
    const input = document.getElementById(key);
    if (input) {
        if (input.type === 'checkbox') {
            input.checked = (value === true || value === 'true');
        } else {
            input.value = value;
        }
    }

    // Handle background type sync for legacy DOM
    if (key === 'active_background' || key === 'bg-type') {
        const bgSelect = document.getElementById('bg-type-select');
        if (bgSelect) {
            bgSelect.value = value;
            bgSelect.dispatchEvent(new Event('change'));
        }
    }

    // 2. Update Instance

    // Background Params (Using CORRECT keys from main.js/index.html)
    if (key === 'bg-rows' && window.bgInstance) window.bgInstance.updateParams('rows', parseInt(value));
    if (key === 'bg-cols' && window.bgInstance) window.bgInstance.updateParams('cols', parseInt(value));
    if (key === 'bg-speed' && window.bgInstance) window.bgInstance.updateParams('speed', parseFloat(value));
    if (key === 'bg-color' && window.bgInstance) window.bgInstance.updateParams('color', value);
    if (key === 'grid-color' && window.bgInstance) window.bgInstance.updateParams('strokeColor', value);

    // Type Params
    if (key === 'type-text' && window.typeInstance) window.typeInstance.updateParams('text', value);
    if (key === 'type-size' && window.typeInstance) window.typeInstance.updateParams('size', parseInt(value));
    if (key === 'foreColor' && window.typeInstance) window.typeInstance.updateParams('color', value); // ID is foreColor
    if (key === 'layerCount' && window.typeInstance) window.typeInstance.updateParams('layers', parseInt(value)); // ID is layerCount

    if (key === 'motion-type' && window.typeInstance) window.typeInstance.updateParams('motionType', value);
    if (key === 'intensity' && window.typeInstance) window.typeInstance.updateParams('intensity', parseFloat(value));
    if (key === 'shape-type' && window.typeInstance) window.typeInstance.updateParams('shapeType', value);
    if (key === 'poster-mode' && window.typeInstance) {
        window.typeInstance.updateParams('posterMode', (value === true || value === 'true'));
    }

    // React State Bridge - Broaden to ALL keys not handled above (or just all keys period)
    // We dispatch for EVERYTHING so App.jsx can decide what to listen to.
    window.dispatchEvent(new CustomEvent('remote-settings-update', {
        detail: { key, value }
    }));

    // --- EMIT UPDATES TO SERVER ---

    function emitChange(type, key, value) {
        if (isRemoteUpdate) return; // Don't emit if we just received this from server
        // console.log('[Socket] emitChange:', key, value); 
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

    // Expose to window immediately
    window.emitChange = emitChange;
    window.emitFunction = emitFunction;

    // --- CANVAS SYNC EVENTS ---
    window.emitPaintStroke = function (data) { socket.emit('paint_stroke', data); };
    socket.on('paint_stroke', (data) => { window.dispatchEvent(new CustomEvent('remote-paint-stroke', { detail: data })); });

    window.emitStringDrag = function (data) { socket.emit('string_drag', data); };
    socket.on('string_drag', (data) => { window.dispatchEvent(new CustomEvent('remote-string-drag', { detail: data })); });
}

