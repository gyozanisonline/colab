window.app = {
    currentStep: 1,

    init: function () {
        this.cacheDOM();
        this.bindEvents();
        // Initialize preset buttons
        document.querySelectorAll('.presets button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const presetName = e.target.innerText.toUpperCase().split(' ')[0]; // 'NEON', 'CLEAN', 'GLITCH'
                if (window.bgModule) window.bgModule.setPreset(presetName);
                if (window.typeModule) window.typeModule.setPreset(presetName);
            });
        });

        // Initialize Audio Button
        const playBtn = document.getElementById('play-audio');
        if (playBtn) {
            // Remove old listeners to be safe or just add new one (toggleAudio handled in AudioModule)
            // Actually AudioModule handles binding itself in DOMContentLoaded
            // We just ensure it's there.
        }

        // Initialize Background State
        const bgTypeSelect = document.getElementById('bg-type-select');
        if (bgTypeSelect) {
            // Trigger change to sync UI panels
            bgTypeSelect.dispatchEvent(new Event('change'));
        }

        this.setStep(1);
    },

    cacheDOM: function () {
        this.steps = document.querySelectorAll('.step-btn');
        this.panels = document.querySelectorAll('.controls-group');
    },

    bindEvents: function () {
        // Step 1: Background Controls
        const bgTypeSelect = document.getElementById('bg-type-select');
        if (bgTypeSelect) {
            bgTypeSelect.addEventListener('change', (e) => {
                const type = e.target.value;
                console.log('Background Type Changed:', type);

                // 1. Notify React (Silk)
                const event = new CustomEvent('change-background-type', { detail: type });
                window.dispatchEvent(event);

                // 2. Control p5.js (Wireframe) visibility
                const p5Canvas = document.getElementById('canvas-background');
                if (type === 'wireframe') {
                    if (p5Canvas) p5Canvas.style.display = 'block';
                    if (window.bgInstance) window.bgInstance.loop(); // Resume loop
                } else {
                    if (p5Canvas) p5Canvas.style.display = 'none';
                    if (window.bgInstance) window.bgInstance.noLoop(); // Save performance
                }

                // 3. Toggle Control Panels
                const silkControls = document.getElementById('bg-controls-silk');
                const wireframeControls = document.getElementById('bg-controls-wireframe');
                const splineControls = document.getElementById('bg-controls-spline');

                // Hide all first
                if (wireframeControls) wireframeControls.style.display = 'none';
                if (silkControls) silkControls.style.display = 'none';
                if (splineControls) splineControls.style.display = 'none';

                if (type === 'wireframe') {
                    if (wireframeControls) wireframeControls.style.display = 'block';
                } else if (type === 'silk') {
                    if (silkControls) silkControls.style.display = 'block';
                } else if (type === 'spline' || type === 'spline_new') {
                    if (splineControls) splineControls.style.display = 'block';
                }

                if (window.emitChange) window.emitChange('param', 'bg-type', type);
            });
        }

        document.getElementById('bg-cols').addEventListener('input', (e) => {
            console.log('BG Cols Input:', e.target.value);
            if (window.bgInstance) window.bgInstance.updateParams('cols', parseInt(e.target.value));
            if (window.emitChange) window.emitChange('param', 'bg-cols', e.target.value);
        });
        document.getElementById('bg-rows').addEventListener('input', (e) => {
            console.log('BG Rows Input:', e.target.value);
            if (window.bgInstance) window.bgInstance.updateParams('rows', parseInt(e.target.value));
            if (window.emitChange) window.emitChange('param', 'bg-rows', e.target.value);
        });
        document.getElementById('bg-speed').addEventListener('input', (e) => {
            console.log('BG Speed Input:', e.target.value);
            if (window.bgInstance) window.bgInstance.updateParams('speed', parseFloat(e.target.value));
            if (window.emitChange) window.emitChange('param', 'bg-speed', e.target.value);
        });
        document.getElementById('bg-color').addEventListener('input', (e) => {
            console.log('BG Color Input:', e.target.value);
            if (window.bgInstance) window.bgInstance.updateParams('color', e.target.value);
            if (window.emitChange) window.emitChange('param', 'bg-color', e.target.value);
        });
        document.getElementById('grid-color').addEventListener('input', (e) => {
            console.log('Grid Color Input:', e.target.value);
            if (window.bgInstance) window.bgInstance.updateParams('strokeColor', e.target.value);
            if (window.emitChange) window.emitChange('param', 'grid-color', e.target.value);
        });

        // Step 2: Type Controls
        const typeTextInput = document.getElementById('type-text');
        if (typeTextInput) {
            typeTextInput.addEventListener('input', (e) => {
                if (window.typeInstance) window.typeInstance.updateParams('text', e.target.value.toUpperCase());
                if (window.emitChange) window.emitChange('param', 'type-text', e.target.value);
            });
        }

        const typeSizeInput = document.getElementById('type-size');
        if (typeSizeInput) {
            typeSizeInput.addEventListener('input', (e) => {
                // ... legacy logic ...
            });
        }
        document.getElementById('type-size').addEventListener('input', (e) => {
            console.log('Type Size Input:', e.target.value);
            if (window.typeInstance) window.typeInstance.updateParams('size', parseInt(e.target.value));
            if (window.emitChange) window.emitChange('param', 'type-size', e.target.value);
        });
    },

    setStep: function (step) {
        this.currentStep = step;

        // Update Nav
        this.steps.forEach((btn, index) => {
            if (index + 1 === step) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Update Panels
        this.panels.forEach((panel) => {
            if (panel.id && panel.id.startsWith('controls-step-')) {
                panel.classList.add('hidden');
            }
        });
        const activePanel = document.getElementById(`controls-step-${step}`);
        if (activePanel) activePanel.classList.remove('hidden');
    },

    savePoster: async function () {
        const text = document.getElementById('textArea').value;
        const author = localStorage.getItem('playerName') || 'Guest';
        // Gather params
        const params = {
            // We can expand this to capture all detailed state
            text: text,
            foreColor: document.getElementById('foreColor').value,
            bgType: document.getElementById('bg-type-select').value
        };

        const payload = {
            text,
            author,
            params
        };

        console.log("Attempting to save poster:", payload);

        try {
            const res = await fetch('/api/posters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log("Save response status:", res.status);
            if (res.ok) {
                alert('Poster Saved to Community!');
            } else {
                alert('Failed to save poster.');
            }
        } catch (err) {
            console.error("Save error:", err);
            alert('Error saving poster.');
        }
    }
};

// Global Exposure
window.savePoster = () => window.app.savePoster();

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && typeof window.app.init === 'function') {
        window.app.init();
    } else {
        console.error("App object not found or init is not a function");
    }

    // Listen for App Switching from React
    window.addEventListener('app-changed', (e) => {
        const appId = e.detail.app;
        const uiOverlay = document.getElementById('ui-overlay');
        const p5Canvas = document.getElementById('canvas-background');

        if (appId === 'community') {
            if (uiOverlay) uiOverlay.style.display = 'none';
            // Optional: Hide p5 canvas to save resources, though it acts as a nice background if visible? 
            // The community gallery has its own specific background.
            if (p5Canvas) p5Canvas.style.display = 'none';
            const typeCanvas = document.getElementById('canvas-type');
            if (typeCanvas) typeCanvas.style.display = 'none';
        } else {
            if (uiOverlay) uiOverlay.style.display = 'block';
            // Restore p5 canvas if needed (check current bg type logic)
            // A simple way is to trigger the bg change event again to reset state or just let the user interact.
            // For now, let's just show it if active background is wireframe
            const bgType = document.getElementById('bg-type-select').value;
            if (bgType === 'wireframe' && p5Canvas) p5Canvas.style.display = 'block';
            const typeCanvas = document.getElementById('canvas-type');
            if (typeCanvas) typeCanvas.style.display = 'block';
        }
    });
});

