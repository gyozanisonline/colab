const socket = io();

let isRemoteUpdate = false;

// --- LISTEN FOR UDPATES FROM SERVER ---

socket.on('update_state', (data) => {
    // data = { type: 'text', value: '...', key: '...' }
    console.log('Remote update received:', data);

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

// Expose to window so other scripts can use it
window.emitChange = emitChange;
window.emitFunction = emitFunction;
window.isRemoteUpdate = () => isRemoteUpdate;
