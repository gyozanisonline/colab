import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

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


// --- POSTER COMMUNITY API ---
import fs from 'fs/promises';

const HAS_DB = await fs.access(path.join(__dirname, 'posters.json')).then(() => true).catch(() => false);
if (!HAS_DB) {
    await fs.writeFile(path.join(__dirname, 'posters.json'), '[]');
}

app.use(express.json({ limit: '50mb' })); // Enable JSON body parsing with increased limit for video uploads

// Get all posters
app.get('/api/posters', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'posters.json'), 'utf-8');
        const posters = JSON.parse(data);
        res.json(posters);
    } catch (err) {
        console.error("Error reading posters:", err);
        res.status(500).json({ error: 'Failed to fetch posters' });
    }
});

// --- MUSIC SEARCH API (iTunes proxy) ---
app.get('/api/music-search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json({ results: [] });

        // Search songs, limit to 50 for better variety
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=50`;
        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (err) {
        console.error("Error searching music:", err);
        res.status(500).json({ error: 'Failed to search music' });
    }
});

// Save a poster
app.post('/api/posters', async (req, res) => {
    try {
        const newPoster = req.body;
        // Basic Validation
        if (!newPoster.text || !newPoster.author) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Add Timestamp
        newPoster.id = Date.now().toString();
        newPoster.createdAt = new Date().toISOString();

        const data = await fs.readFile(path.join(__dirname, 'posters.json'), 'utf-8');
        const posters = JSON.parse(data);

        // Add to beginning
        posters.unshift(newPoster);

        await fs.writeFile(path.join(__dirname, 'posters.json'), JSON.stringify(posters, null, 2));

        console.log(`Saved new poster by ${newPoster.author}`);
        res.status(201).json(newPoster);
    } catch (err) {
        console.error("Error saving poster:", err);
        res.status(500).json({ error: 'Failed to save poster' });
    }
});

server.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`);
});
