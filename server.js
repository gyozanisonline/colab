import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        // [DEBUG]
        console.log(`[SERVER] Received update_state from ${socket.id}:`, data);

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

// Sync Cloudinary with posters.json - ensures no posters are lost
app.post('/api/sync-cloudinary', async (req, res) => {
    try {
        console.log('[SYNC] Starting Cloudinary sync...');

        // Get all videos from Cloudinary colab gallery static folder
        const result = await cloudinary.api.resources({
            type: 'upload',
            resource_type: 'video',
            prefix: 'colab-gallery-static/',
            max_results: 500
        });

        console.log(`[SYNC] Found ${result.resources.length} videos on Cloudinary`);

        // Read current posters
        const postersPath = path.join(__dirname, 'posters.json');
        const data = await fs.readFile(postersPath, 'utf-8');
        const posters = JSON.parse(data);

        // Find missing posters (on Cloudinary but not in JSON)
        const existingIds = new Set(posters.map(p => p.id));
        const missing = [];

        for (const resource of result.resources) {
            // Extract poster ID from public_id like "colab-posters/poster_1234567890"
            const match = resource.public_id.match(/poster_(\d+)/);
            if (match) {
                const id = match[1];
                if (!existingIds.has(id)) {
                    missing.push({
                        id,
                        videoUrl: resource.secure_url,
                        author: 'Unknown',
                        title: `Recovered Poster`,
                        text: 'Recovered from Cloudinary',
                        createdAt: resource.created_at
                    });
                    console.log(`[SYNC] Found missing poster: ${id}`);
                }
            }
        }

        if (missing.length > 0) {
            // Add missing posters at the beginning
            posters.unshift(...missing);
            await fs.writeFile(postersPath, JSON.stringify(posters, null, 2));
            console.log(`[SYNC] Added ${missing.length} recovered posters`);
        }

        res.json({
            synced: missing.length,
            total: posters.length,
            cloudinaryCount: result.resources.length
        });
    } catch (err) {
        console.error('[SYNC] Cloudinary sync failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Debug: List ALL videos on Cloudinary (any folder)
app.get('/api/cloudinary-all-videos', async (req, res) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            resource_type: 'video',
            max_results: 500
        });

        const videos = result.resources.map(r => ({
            public_id: r.public_id,
            created: r.created_at,
            url: r.secure_url
        }));

        res.json({
            count: videos.length,
            videos
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

        // Upload video to Cloudinary if present
        if (newPoster.video && newPoster.video.startsWith('data:video')) {
            try {
                const uploadResult = await cloudinary.uploader.upload(newPoster.video, {
                    resource_type: 'video',
                    folder: 'colab-gallery-static',
                    public_id: `poster_${newPoster.id}`,
                    overwrite: true
                });
                newPoster.videoUrl = uploadResult.secure_url;
                delete newPoster.video; // Don't store base64 anymore
                console.log(`Uploaded video to Cloudinary: ${uploadResult.secure_url}`);
            } catch (uploadErr) {
                console.error('Cloudinary upload failed:', uploadErr);
                // Fall back to keeping base64 if upload fails
            }
        }

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
