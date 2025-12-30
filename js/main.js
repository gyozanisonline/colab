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

        this.setStep(1);
    },

    cacheDOM: function () {
        this.steps = document.querySelectorAll('.step-btn');
        this.panels = document.querySelectorAll('.controls-group');
    },

    bindEvents: function () {
        // Step 1: Background Controls
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
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && typeof window.app.init === 'function') {
        window.app.init();
    } else {
        console.error("App object not found or init is not a function");
    }
});
