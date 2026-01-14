// Background Controls Bridge
// This file syncs Leva controls with the existing HTML UI

import { useControls } from 'leva';

// Export a function to get current background controls
export function useBackgroundControls(backgroundType) {
    switch (backgroundType) {
        case 'silk':
            return useControls('Silk', {
                speed: { value: 5, min: 0.1, max: 20 },
                scale: { value: 1, min: 0.1, max: 5 },
                color: { value: '#7B7481' },
                noiseIntensity: { value: 1.5, min: 0, max: 5 },
                rotation: { value: 0, min: 0, max: 6.28 }
            });

        case 'aurora':
            return useControls('Aurora', {
                bg: '#000000',
                color1: '#ff00cc',
                color2: '#3333ff',
                color3: '#00ffcc',
                speed: { value: 10, min: 2, max: 30 },
                blobSize: { value: 60, min: 30, max: 100, label: 'Blob Size (%)' }
            });

        case 'starfield':
            return useControls('StarField', {
                count: { value: 5000, min: 1000, max: 20000, step: 100 },
                radius: { value: 1.5, min: 0.5, max: 5.0 },
                color: '#f272c8',
                size: { value: 0.005, min: 0.001, max: 0.05, step: 0.001 },
                speed: { value: 1, min: 0, max: 5 }
            });

        case 'blocks':
            return useControls('Blocks', {
                defaultColor: 'orange',
                hoveredColor: 'hotpink',
                scale: { value: 1, min: 0.5, max: 3 },
                speed: { value: 1, min: 0.1, max: 5 }
            });

        case 'particles':
            return useControls('Particles', {
                count: { value: 500, min: 100, max: 2000, step: 50 },
                color: '#05c3dd',
                size: { value: 0.2, min: 0.05, max: 1.0 },
                speed: { value: 1, min: 0.1, max: 5 }
            });

        case 'color_bends':
            return useControls('Color Bends', {
                color1: '#ff0055',
                color2: '#0055ff',
                color3: '#55ff00',
                speed: { value: 0.2, min: 0.0, max: 2.0 },
                complexity: { value: 3.0, min: 1.0, max: 10.0 }
            });

        case 'dark_veil':
            return useControls('Dark Veil', {
                baseColor: '#050505',
                veilColor: '#1a1a1a',
                density: { value: 1.0, min: 0.1, max: 3.0 },
                speed: { value: 0.2, min: 0.0, max: 2.0 }
            });

        case 'dither':
            return useControls('Dither', {
                color1: '#ffffff',
                color2: '#000000',
                pixelSize: { value: 64.0, min: 2.0, max: 256.0, step: 2.0 }
            });

        default:
            return {};
    }
}

// Expose controls to window for HTML access
export function exposeControlsToWindow(backgroundType, controls) {
    if (!window.backgroundControls) {
        window.backgroundControls = {};
    }
    window.backgroundControls[backgroundType] = controls;
}
