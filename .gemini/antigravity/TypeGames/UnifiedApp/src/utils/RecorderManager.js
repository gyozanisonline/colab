
// RecorderManager.js
// Handles compositing multiple canvases and recording them to WebM

class RecorderManager {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.compositorCanvas = document.createElement('canvas');
        this.ctx = this.compositorCanvas.getContext('2d');
        this.animationFrameId = null;

        // Settings
        this.fps = 30;
        this.width = 1920;
        this.height = 1080;
    }

    // Find all relevant canvases in the DOM
    findCanvases() {
        // We look for canvases. 
        // Strategy: Sort by z-index or DOM order.
        // Usually: Background is first, Type is last.
        const canvases = Array.from(document.querySelectorAll('canvas'));

        // Filter out the compositor itself if it somehow gets appended
        return canvases.filter(c => c !== this.compositorCanvas);
    }

    startRecording(durationMs = 0, onStopCallback) {
        if (this.isRecording) return;

        const sources = this.findCanvases();
        if (sources.length === 0) {
            console.error("No canvases found to record.");
            return;
        }

        // Setup Compositor Size (Match the first source or window)
        this.width = sources[0].width; // Use internal resolution
        this.height = sources[0].height;
        this.compositorCanvas.width = this.width;
        this.compositorCanvas.height = this.height;

        // Init Stream
        const stream = this.compositorCanvas.captureStream(this.fps);

        // Prefer VP9 for webm if available, else VP8
        const mimeTypes = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
        ];
        let selectedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

        try {
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: selectedType,
                videoBitsPerSecond: 5000000 // 5 Mbps
            });
        } catch (e) {
            console.warn("High quality config failed, falling back to default.", e);
            this.mediaRecorder = new MediaRecorder(stream);
        }

        this.recordedChunks = [];
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.recordedChunks.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            if (onStopCallback) onStopCallback(blob);
            this.cleanup();
        };

        // Start Composite Loop
        this.isRecording = true;
        this.mediaRecorder.start();
        this.compositeLoop(sources);

        // Auto-stop if duration provided
        if (durationMs > 0) {
            console.log(`Recording for ${durationMs}ms...`);
            setTimeout(() => {
                this.stopRecording();
            }, durationMs);
        }
    }

    compositeLoop(sources) {
        if (!this.isRecording) return;

        // Draw background color (optional, prevents transparency artifacts)
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw each canvas
        sources.forEach(source => {
            // Need to handle scaling if sources are different sizes?
            // For now assume all full-screen canvases match.
            try {
                this.ctx.drawImage(source, 0, 0, this.width, this.height);
            } catch {
                // Determine if source is ready
            }
        });

        this.animationFrameId = requestAnimationFrame(() => this.compositeLoop(sources));
    }

    stopRecording() {
        if (!this.isRecording) return;

        this.isRecording = false;
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        cancelAnimationFrame(this.animationFrameId);
    }

    cleanup() {
        this.isRecording = false;
        this.mediaRecorder = null;
        cancelAnimationFrame(this.animationFrameId);
    }
}

// Singleton export
const recorder = new RecorderManager();
export default recorder;
