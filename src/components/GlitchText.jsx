import { useEffect, useRef } from 'react';

/**
 * GlitchText - Canvas2D type mode.
 * Renders text with animated RGB channel split, horizontal slice offsets,
 * and occasional full-frame shake — inspired by the endlesstools glitch style.
 */
export default function GlitchText({
    text = 'GLITCH',
    color = '#ffffff',
    fontSize = 180,
    intensity = 0.5,
    rgbSplit = 15,
    sliceCount = 6
}) {
    const canvasRef = useRef(null);
    const propsRef = useRef({ text, color, fontSize, intensity, rgbSplit, sliceCount });
    const rafRef = useRef(null);

    // Keep props ref current without restarting the loop
    useEffect(() => {
        propsRef.current = { text, color, fontSize, intensity, rgbSplit, sliceCount };
    }, [text, color, fontSize, intensity, rgbSplit, sliceCount]);

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

        // Glitch state
        let glitchTimer = 0;
        let glitchActive = false;
        let glitchDuration = 0;

        const draw = (timestamp) => {
            rafRef.current = requestAnimationFrame(draw);
            const { text: t, color: col, fontSize: fs, intensity: inten, rgbSplit: rgb, sliceCount: slices } = propsRef.current;

            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // Decide whether to trigger a glitch burst
            glitchTimer -= 16;
            if (glitchTimer <= 0) {
                glitchActive = Math.random() < inten;
                glitchDuration = glitchActive ? Math.random() * 120 + 40 : 0;
                glitchTimer = glitchActive
                    ? Math.random() * 200 + 100
                    : Math.random() * (1200 - inten * 800) + 200;
            }
            if (glitchDuration > 0) glitchDuration -= 16;
            else glitchActive = false;

            const isGlitching = glitchActive && glitchDuration > 0;

            // --- Draw text helper ---
            const drawText = (xOff = 0, yOff = 0, fillColor = col) => {
                ctx.save();
                ctx.font = `bold ${fs}px 'Bebas Neue', 'Arial Black', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = fillColor;

                const lines = t.split('\n');
                const lineHeight = fs * 1.1;
                const totalH = lines.length * lineHeight;
                const startY = h / 2 - totalH / 2 + lineHeight / 2;

                lines.forEach((line, i) => {
                    ctx.fillText(line, w / 2 + xOff, startY + i * lineHeight + yOff);
                });
                ctx.restore();
            };

            if (isGlitching) {
                const splitX = rgb * inten;

                // RGB layer separation
                ctx.globalCompositeOperation = 'source-over';
                drawText(-splitX, 0, 'rgba(255,0,80,0.85)');
                drawText(splitX, 0, 'rgba(0,220,255,0.85)');

                // Horizontal slice offsets
                const sliceH = h / slices;
                ctx.save();
                for (let i = 0; i < slices; i++) {
                    if (Math.random() > 0.6) {
                        const sy = i * sliceH;
                        const offset = (Math.random() - 0.5) * 60 * inten;
                        // Copy a horizontal strip shifted
                        const imgData = ctx.getImageData(0, sy, w, sliceH);
                        ctx.putImageData(imgData, offset, sy);
                    }
                }
                ctx.restore();

                // Draw crisp white core on top
                drawText(0, 0, col);

                // Rare full flicker
                if (Math.random() < 0.05) {
                    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`;
                    ctx.fillRect(0, 0, w, h);
                }
            } else {
                // Clean draw
                drawText(0, 0, col);
            }
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10
            }}
        />
    );
}
