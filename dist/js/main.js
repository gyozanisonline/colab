window.app = {
    currentStep: 1,

    init: function () {
        this.cacheDOM();
        this.bindEvents();

        // Listen for App Switching from React
        window.addEventListener('app-changed', (e) => {
            const appId = e.detail.app;
            console.log('App Changed to:', appId);

            // Get all UI elements that should be hidden when not in typeflow
            const uiOverlay = document.getElementById('ui-overlay');
            const chatContainer = document.getElementById('chat-container');
            const header = document.querySelector('#ui-overlay header');
            const stepNav = document.getElementById('step-nav');
            const controlsPanel = document.getElementById('controls-panel');
            const typeCanvas = document.getElementById('canvas-type');

            if (appId === 'typeflow') {
                // Show all TypeFlow UI elements
                // if (uiOverlay) uiOverlay.style.display = 'block'; // Legacy UI hidden in favor of React Controls
                if (chatContainer) chatContainer.style.display = 'block';
                if (header) header.style.display = 'block';
                if (stepNav) stepNav.classList.remove('hidden-app');
                if (controlsPanel) controlsPanel.classList.remove('hidden-app');
                if (typeCanvas) typeCanvas.style.display = 'block';

                // Show p5 background canvas (if wireframe is selected)
                const p5Canvas = document.getElementById('canvas-background');
                const bgTypeSelect = document.getElementById('bg-type-select');
                if (p5Canvas && bgTypeSelect && bgTypeSelect.value === 'wireframe') {
                    p5Canvas.style.display = 'block';
                }
            } else {
                // Hide all TypeFlow UI elements (for intro, community, or other apps)
                if (uiOverlay) uiOverlay.style.display = 'none';
                if (chatContainer) chatContainer.style.display = 'none';
                if (header) header.style.display = 'none';
                if (stepNav) stepNav.classList.add('hidden-app');
                if (controlsPanel) controlsPanel.classList.add('hidden-app');
                if (typeCanvas) typeCanvas.style.display = 'none';

                // If switching away, hide p5 background too
                const p5Canvas = document.getElementById('canvas-background');
                if (p5Canvas) p5Canvas.style.display = 'none';
            }
        });

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
                    // Lazy-load BackgroundModule.js on first use
                    if (!window.bgInstance && !window._bgModuleLoading) {
                        window._bgModuleLoading = true;
                        console.log('[main.js] Lazy-loading BackgroundModule.js...');
                        const script = document.createElement('script');
                        script.src = '/js/BackgroundModule.js';
                        script.onload = () => {
                            console.log('[main.js] BackgroundModule.js loaded');
                            if (p5Canvas) p5Canvas.style.display = 'block';
                        };
                        document.body.appendChild(script);
                    } else {
                        if (p5Canvas) p5Canvas.style.display = 'block';
                        if (window.bgInstance) window.bgInstance.loop(); // Resume loop
                    }
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
                    // Silk now uses Leva, so we can hide or show specific HTML if needed, but Leva handles it.
                    // if (silkControls) silkControls.style.display = 'block'; // Legacy controls hidden
                } else if (type === 'spline' || type === 'spline_new') {
                    if (splineControls) splineControls.style.display = 'block';
                }
                // React backgrounds (StarField, etc.) show Leva automatically.

                if (window.emitChange) window.emitChange('param', 'bg-type', type);
            });
        }

        // Corrected Wireframe Controls (matching index.html)
        const gridDensityInput = document.getElementById('grid-density');
        if (gridDensityInput) {
            gridDensityInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                console.log('Grid Density Input:', val);
                if (window.bgInstance) {
                    window.bgInstance.updateParams('cols', val);
                    window.bgInstance.updateParams('rows', val); // Keep square
                }
                if (window.emitChange) window.emitChange('param', 'grid-density', val);
            });
        }

        const scrollSpeedInput = document.getElementById('scroll-speed');
        if (scrollSpeedInput) {
            scrollSpeedInput.addEventListener('input', (e) => {
                const rawVal = parseInt(e.target.value);
                const speedVal = rawVal * 0.005; // Map 1-20 to 0.005-0.1
                console.log('Scroll Speed Input:', rawVal, '->', speedVal);
                if (window.bgInstance) window.bgInstance.updateParams('speed', speedVal);
                if (window.emitChange) window.emitChange('param', 'scroll-speed', rawVal);
            });
        }

        // Removed broken listeners for non-existent IDs (bg-cols, bg-rows, bg-speed, bg-color, grid-color)

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
    },

    setStep: function (step) {
        this.currentStep = step;

        // Notify React (App.jsx)
        window.dispatchEvent(new CustomEvent('app-step-changed', { detail: { step: step } }));

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
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Check if UI elements exist (they won't if intro is showing)
    const uiOverlay = document.getElementById('ui-overlay');
    const hasUIElements = uiOverlay && uiOverlay.querySelector('.step-btn');

    if (hasUIElements) {
        // UI is ready, initialize immediately
        if (window.app && typeof window.app.init === 'function') {
            window.app.init();
        } else {
            console.error("App object not found or init is not a function");
        }
    } else {
        console.log('🎬 UI elements not ready (intro showing), deferring app.init()');
        // Listen for when the intro completes and UI becomes available
        window.addEventListener('app-changed', (e) => {
            if (e.detail.app === 'typeflow' && !window.app.initialized) {
                console.log('🎬 Intro complete, initializing app now');
                window.app.initialized = true;
                if (window.app && typeof window.app.init === 'function') {
                    window.app.init();
                }
            }
        }, { once: false }); // Don't use once, in case we need to reinit
    }
});
