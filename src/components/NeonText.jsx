import { useEffect, useRef } from 'react';

// Parse a hex color into [r, g, b]
const hexToRgb = (hex) => {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
};

const toRgba = (r, g, b, a) => `rgba(${r},${g},${b},${a.toFixed(3)})`;

export default function NeonText({
    text = 'Colab',
    glowColor = '#ff00cc',
    bloomRadius = 40,
    pulseSpeed = 1,
    flickerIntensity = 0,
    fontSize = 180,
}) {
    const canvasRef = useRef(null);
    const propsRef = useRef({});
    const rafRef = useRef(null);
    // Per-character flicker state, rebuilt when text changes
    const charStateRef = useRef([]);

    useEffect(() => {
        propsRef.current = { text, glowColor, bloomRadius, pulseSpeed, flickerIntensity, fontSize };
    });

    // Rebuild per-char state when text changes
    useEffect(() => {
        const chars = text.replace(/\n/g, '').split('');
        charStateRef.current = chars.map((_, i) => ({
            flickerVal: 1,
            flickerTarget: 1,
            // Each char has a unique phase so the pulse rolls like a wave
            phase: (i / Math.max(chars.length - 1, 1)) * Math.PI * 1.5,
            stutterEnd: 0,
        }));
    }, [text]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Draw a single character with all its glow layers
        const drawChar = (char, x, y, brightness, rgb, bloom) => {
            const [r, g, b] = rgb;
            const font = `900 ${propsRef.current.fontSize}px Arial Black, Arial, sans-serif`;

            // --- Chromatic aberration: red fringe left, blue fringe right ---
            const caOffset = bloom * 0.15;

            // Red fringe (left)
            ctx.save();
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = bloom * 2;
            ctx.shadowColor = `rgba(255,0,80,0.6)`;
            ctx.fillStyle = toRgba(255, 30, 60, 0.08 * brightness);
            ctx.fillText(char, x - caOffset, y);
            ctx.restore();

            // Blue fringe (right)
            ctx.save();
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = bloom * 2;
            ctx.shadowColor = `rgba(0,80,255,0.6)`;
            ctx.fillStyle = toRgba(30, 60, 255, 0.08 * brightness);
            ctx.fillText(char, x + caOffset, y);
            ctx.restore();

            // --- Outer diffuse bloom ---
            ctx.save();
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = bloom * 3.5;
            ctx.shadowColor = toRgba(r, g, b, 0.9);
            ctx.fillStyle = toRgba(r, g, b, 0.08 * brightness);
            ctx.fillText(char, x, y);
            ctx.restore();

            // --- Mid bloom ---
            ctx.save();
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = bloom * 1.4;
            ctx.shadowColor = toRgba(r, g, b, 1);
            ctx.fillStyle = toRgba(r, g, b, 0.22 * brightness);
            ctx.fillText(char, x, y);
            ctx.restore();

            // --- Inner tight bloom ---
            ctx.save();
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = bloom * 0.5;
            ctx.shadowColor = toRgba(r, g, b, 1);
            ctx.fillStyle = toRgba(r, g, b, 0.55 * brightness);
            ctx.fillText(char, x, y);
            ctx.restore();

            // --- Core: thin hot tube (stroke) ---
            ctx.save();
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#ffffff';
            ctx.strokeStyle = toRgba(255, 255, 255, 0.9 * brightness);
            ctx.lineWidth = Math.max(1, propsRef.current.fontSize * 0.015);
            ctx.lineJoin = 'round';
            ctx.strokeText(char, x, y);
            ctx.restore();

            // --- White-hot fill center ---
            ctx.save();
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = toRgba(255, 255, 255, 0.7 * brightness);
            ctx.fillText(char, x, y);
            ctx.restore();
        };

        const animate = (time) => {
            rafRef.current = requestAnimationFrame(animate);
            const { text, glowColor, bloomRadius, pulseSpeed, flickerIntensity } = propsRef.current;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const rgb = hexToRgb(glowColor);
            const fs = propsRef.current.fontSize;
            const lines = text.split('\n');
            const lineHeight = fs * 1.2;
            const totalHeight = lines.length * lineHeight;

            // Measure characters
            ctx.font = `900 ${fs}px Arial Black, Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const charStates = charStateRef.current;
            let globalCharIdx = 0;

            lines.forEach((line, lineIdx) => {
                const lineY = canvas.height / 2 - totalHeight / 2 + lineIdx * lineHeight + lineHeight / 2;

                // Measure total line width to center manually
                const totalLineWidth = [...line].reduce((w, ch) => w + ctx.measureText(ch).width, 0);
                let curX = canvas.width / 2 - totalLineWidth / 2;

                for (let ci = 0; ci < line.length; ci++) {
                    const char = line[ci];
                    const charW = ctx.measureText(char).width;
                    const cx = curX + charW / 2;

                    const state = charStates[globalCharIdx];
                    if (state) {
                        // Per-char pulsing (phase-shifted wave across the text)
                        const pulseMag = 0.18;
                        const pulse = (1 - pulseMag) + pulseMag * Math.sin(time * pulseSpeed * 0.002 + state.phase);

                        // Stutter: random chance to kill a character briefly
                        if (flickerIntensity > 0 && time > state.stutterEnd) {
                            if (Math.random() < 0.001 * flickerIntensity) {
                                state.flickerTarget = 0.04 + Math.random() * 0.08;
                                state.stutterEnd = time + 80 + Math.random() * 250;
                            } else if (Math.random() < 0.003 * flickerIntensity) {
                                // Fast buzz flicker (doesn't go all the way dark)
                                state.flickerTarget = 0.5 + Math.random() * 0.4;
                                state.stutterEnd = time + 40 + Math.random() * 80;
                            } else {
                                state.flickerTarget = 1;
                            }
                        } else if (time >= state.stutterEnd && state.stutterEnd !== 0) {
                            state.flickerTarget = 1;
                        }

                        // Lerp toward target
                        const lerpRate = state.flickerVal < state.flickerTarget ? 0.15 : 0.35;
                        state.flickerVal += (state.flickerTarget - state.flickerVal) * lerpRate;

                        const brightness = pulse * state.flickerVal;
                        drawChar(char, cx, lineY, brightness, rgb, bloomRadius);
                    }

                    curX += charW;
                    globalCharIdx++;
                }

                // Floor glow spill — faint elliptical bloom below each line of text
                const spill = ctx.createRadialGradient(
                    canvas.width / 2, lineY + fs * 0.65,
                    0,
                    canvas.width / 2, lineY + fs * 0.65,
                    totalLineWidth * 0.55
                );
                spill.addColorStop(0, toRgba(rgb[0], rgb[1], rgb[2], 0.06));
                spill.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.save();
                ctx.fillStyle = spill;
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2, lineY + fs * 0.65, totalLineWidth * 0.55, fs * 0.18, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
        />
    );
}
