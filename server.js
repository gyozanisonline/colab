const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist'))); // Serve built React files first
app.use(express.static(__dirname)); // Fallback to root for assets not bundled

// Store current state to send to new clients
let appState = {
    // Initial state matching client defaults
    text: "Colab\nExperiment Together",
    // We can expand this object as needed, or just rely on 'update_state' events
    // to propagate changes without strict server-side validation for this prototype.
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send current app state to new user
    socket.emit('initial_state', appState);

    // Listen for state updates from a client
    socket.on('update_state', (data) => {
        // data format: { type: 'text', value: '...' } OR { type: 'param', key: '...', value: '...' }

        // Update server-side state
        if (data.type === 'text') {
            appState.text = data.value;
        } else if (data.type === 'param') {
            // Ensure params object exists
            if (!appState.params) appState.params = {};
            appState.params[data.key] = data.value;
        }

        // Broadcast to ALL OTHER clients (excluding sender)
        socket.broadcast.emit('update_state', data);
    });

    // Handle Mouse Movement
    socket.on('mouse_move', (data) => {
        // Broadcast mouse position to others
        // data: { x: 0.5, y: 0.5 } (normalized coordinates)
        socket.broadcast.emit('remote_mouse_move', {
            id: socket.id,
            x: data.x,
            y: data.y,
            color: data.color || '#ff0000', // Fallback color
            name: data.name
        });
    });

    // Handle Chat Messages
    socket.on('chat_message', (data) => {
        // Broadcast to EVERYONE (including sender, for simplicity or explicit sync)
        // Or io.emit to send to sender too.
        // Let's use broadcast so sender adds immediately, others receive.
        socket.broadcast.emit('chat_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Notify others to remove this user's cursor
        io.emit('remote_mouse_remove', { id: socket.id });
    });
});

server.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`);
});
