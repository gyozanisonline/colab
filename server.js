import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
const REQUIRED_ENV = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnv = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
    console.warn(`[Server] Missing env vars: ${missingEnv.join(', ')} — video upload/sync will fail. Copy .env.example to .env and fill in values.`);
}

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

        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`;
        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (err) {
        console.error("Error searching music:", err);
        res.status(500).json({ error: 'Failed to search music' });
    }
});

// Sync Cloudinary with posters.json - bidirectional sync:
// 1. Recover missing posters (on Cloudinary but not in JSON)
// 2. Remove dead posters (in JSON but video deleted from Cloudinary)
app.post('/api/sync-cloudinary', async (req, res) => {
    // Guard: skip silently if Cloudinary credentials are not configured
    if (missingEnv.length > 0) {
        return res.json({ synced: 0, removed: 0, total: 0, skipped: true, reason: 'Cloudinary credentials not configured' });
    }

    try {
        console.log('[SYNC] Starting bidirectional Cloudinary sync...');

        // Get all videos from Cloudinary - check both folders
        const [staticResult, legacyResult] = await Promise.all([
            cloudinary.api.resources({
                type: 'upload',
                resource_type: 'video',
                prefix: 'colab-gallery-static/',
                max_results: 500,
                context: true
            }),
            cloudinary.api.resources({
                type: 'upload',
                resource_type: 'video',
                prefix: 'colab-posters/',
                max_results: 500,
                context: true
            })
        ]);

        const allResources = [...staticResult.resources, ...legacyResult.resources];
        console.log(`[SYNC] Found ${allResources.length} videos on Cloudinary (${staticResult.resources.length} static + ${legacyResult.resources.length} legacy)`);

        // Create lookup sets
        const cloudinaryIds = new Set(allResources.map(r => r.public_id));
        const cloudinaryIdToResource = new Map(allResources.map(r => [r.public_id, r]));

        // Read current posters
        const postersPath = path.join(__dirname, 'posters.json');
        const data = await fs.readFile(postersPath, 'utf-8');
        let posters = JSON.parse(data);
        const existingIds = new Set(posters.map(p => p.id));

        // --- STEP 1: Remove dead posters ---
        const originalCount = posters.length;
        posters = posters.filter(poster => {
            if (!poster.videoUrl) return true; // Keep legacy posters without videoUrl

            const staticMatch = poster.videoUrl.match(/colab-gallery-static\/([^.]+)/);
            const legacyMatch = poster.videoUrl.match(/colab-posters\/([^.]+)/);

            let publicId = null;
            if (staticMatch) {
                publicId = `colab-gallery-static/${staticMatch[1]}`;
            } else if (legacyMatch) {
                publicId = `colab-posters/${legacyMatch[1]}`;
            }

            if (!publicId) return true; // Keep non-Cloudinary posters

            const exists = cloudinaryIds.has(publicId);
            if (!exists) {
                console.log(`[SYNC] Removing dead poster ${poster.id} - "${poster.title}"`);
            }
            return exists;
        });
        const removedCount = originalCount - posters.length;

        // --- STEP 2: Recover missing posters ---
        const updatedExistingIds = new Set(posters.map(p => p.id));
        const missing = [];

        for (const resource of allResources) {
            const match = resource.public_id.match(/poster_(\d+)/);
            if (match) {
                const id = match[1];
                if (!updatedExistingIds.has(id)) {
                    missing.push({
                        id,
                        videoUrl: resource.secure_url,
                        author: resource.context?.custom?.author || 'Unknown',
                        title: resource.context?.custom?.title || 'Recovered Poster',
                        text: resource.context?.custom?.text || 'Recovered from Cloudinary',
                        createdAt: resource.created_at
                    });
                    console.log(`[SYNC] Recovered missing poster: ${id}`);
                }
            }
        }

        if (missing.length > 0) {
            posters.unshift(...missing);
        }

        // Save if changes were made
        if (removedCount > 0 || missing.length > 0) {
            await fs.writeFile(postersPath, JSON.stringify(posters, null, 2));
            console.log(`[SYNC] Updated posters.json: removed ${removedCount}, recovered ${missing.length}`);
        }

        res.json({
            synced: missing.length,
            removed: removedCount,
            total: posters.length,
            cloudinaryCount: allResources.length
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

// Cleanup dead posters - removes posters whose videos no longer exist on Cloudinary
app.post('/api/cleanup-posters', async (req, res) => {
    try {
        console.log('[CLEANUP] Starting dead poster cleanup...');

        // Get all videos from Cloudinary - check both folders
        const [staticResult, legacyResult] = await Promise.all([
            cloudinary.api.resources({
                type: 'upload',
                resource_type: 'video',
                prefix: 'colab-gallery-static/',
                max_results: 500
            }),
            cloudinary.api.resources({
                type: 'upload',
                resource_type: 'video',
                prefix: 'colab-posters/',
                max_results: 500
            })
        ]);

        // Create a set of existing Cloudinary public IDs for fast lookup
        const cloudinaryIds = new Set([
            ...staticResult.resources.map(r => r.public_id),
            ...legacyResult.resources.map(r => r.public_id)
        ]);
        console.log(`[CLEANUP] Found ${cloudinaryIds.size} videos on Cloudinary (${staticResult.resources.length} static + ${legacyResult.resources.length} legacy)`);

        // Read current posters
        const postersPath = path.join(__dirname, 'posters.json');
        const data = await fs.readFile(postersPath, 'utf-8');
        const posters = JSON.parse(data);
        const originalCount = posters.length;

        // Filter out posters whose videos don't exist on Cloudinary
        const validPosters = posters.filter(poster => {
            // If no videoUrl, it's a legacy poster - keep it for now
            if (!poster.videoUrl) {
                console.log(`[CLEANUP] Keeping legacy poster ${poster.id} (no videoUrl)`);
                return true;
            }

            // Extract public_id from Cloudinary URL
            // URL formats: 
            // - https://res.cloudinary.com/.../colab-gallery-static/poster_1234567890.webm
            // - https://res.cloudinary.com/.../colab-posters/poster_1234567890.webm
            const staticMatch = poster.videoUrl.match(/colab-gallery-static\/([^.]+)/);
            const legacyMatch = poster.videoUrl.match(/colab-posters\/([^.]+)/);

            let publicId = null;
            if (staticMatch) {
                publicId = `colab-gallery-static/${staticMatch[1]}`;
            } else if (legacyMatch) {
                publicId = `colab-posters/${legacyMatch[1]}`;
            }

            if (!publicId) {
                console.log(`[CLEANUP] Keeping poster ${poster.id} (non-Cloudinary URL or unknown format)`);
                return true;
            }

            const exists = cloudinaryIds.has(publicId);

            if (!exists) {
                console.log(`[CLEANUP] Removing dead poster ${poster.id} - "${poster.title}" (video not found on Cloudinary)`);
            }

            return exists;
        });

        const removedCount = originalCount - validPosters.length;

        if (removedCount > 0) {
            await fs.writeFile(postersPath, JSON.stringify(validPosters, null, 2));
            console.log(`[CLEANUP] Removed ${removedCount} dead posters`);
        }

        res.json({
            removed: removedCount,
            remaining: validPosters.length,
            cloudinaryCount: cloudinaryIds.size
        });
    } catch (err) {
        console.error('[CLEANUP] Cleanup failed:', err);
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
                    overwrite: true,
                    // Re-encode to MP4 — auto:best preserves quality for animated/graphic content
                    eager: [
                        { format: 'mp4', quality: 'auto:best', video_codec: 'h264' }
                    ],
                    eager_async: false,
                    // Save metadata to Cloudinary context (custom fields)
                    context: {
                        title: newPoster.title,
                        author: newPoster.author,
                        text: newPoster.text
                    }
                });
                // Prefer the eager MP4 (re-encoded, optimized) over the raw WebM source
                const eagerMp4 = uploadResult.eager && uploadResult.eager[0];
                newPoster.videoUrl = eagerMp4 ? eagerMp4.secure_url : uploadResult.secure_url;
                delete newPoster.video; // Don't store base64 anymore
                console.log(`Uploaded video to Cloudinary: ${newPoster.videoUrl}`);
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

    // Auto-sync posters from Cloudinary on every startup so the gallery
    // is always populated after a fresh deploy (Render filesystem is ephemeral)
    if (missingEnv.length === 0) {
        fetch(`http://localhost:${PORT}/api/sync-cloudinary`, { method: 'POST' })
            .then(r => r.json())
            .then(result => console.log(`[STARTUP] Cloudinary sync complete — recovered: ${result.synced}, removed: ${result.removed}, total: ${result.total}`))
            .catch(err => console.warn('[STARTUP] Auto-sync failed:', err.message));
    }
});
