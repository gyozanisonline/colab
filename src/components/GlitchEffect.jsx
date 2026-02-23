import { useEffect, useRef } from 'react';

/**
 * GlitchEffect - CSS-only digital glitch post-FX overlay.
 * Renders animated clip-path slices + RGB channel split + skew distortion.
 */
export default function GlitchEffect({
    enabled = false,
    intensity = 50,
    speed = 50,
    rgbSplit = 50,
    sliceCount = 5
}) {
    const styleRef = useRef(null);

    useEffect(() => {
        if (!styleRef.current) return;

        // Normalize
        const iNorm = intensity / 100;           // 0-1
        const sNorm = speed / 100;               // 0-1
        const rNorm = rgbSplit / 100;            // 0-1
        const count = Math.round(sliceCount);    // integer

        // Derived values
        const offsetPx = Math.round(iNorm * 40);     // max horizontal slice offset
        const splitPx = Math.round(rNorm * 20);      // RGB channel separation
        const durationMs = Math.round(800 - sNorm * 700); // 800ms (slow) → 100ms (fast)
        const skewDeg = (iNorm * 3).toFixed(2);      // max skew degrees

        // Build clip-path keyframe slices
        // Each slice is a horizontal band that jitters horizontally
        const sliceHeight = 100 / count;

        let slicesNormal = '';
        let slicesGlitched = '';
        for (let i = 0; i < count; i++) {
            const top = (i * sliceHeight).toFixed(2);
            const bottom = ((i + 1) * sliceHeight).toFixed(2);
            slicesNormal += `polygon(0% ${top}%, 100% ${top}%, 100% ${bottom}%, 0% ${bottom}%),\n`;
            // Alternate left/right offsets for each slice
            const dir = i % 2 === 0 ? 1 : -1;
            slicesGlitched += `polygon(${dir * offsetPx}px ${top}%, calc(100% + ${dir * offsetPx}px) ${top}%, calc(100% + ${dir * offsetPx}px) ${bottom}%, ${dir * offsetPx}px ${bottom}%),\n`;
        }
        // Remove trailing comma+newline
        slicesNormal = slicesNormal.slice(0, -2);
        slicesGlitched = slicesGlitched.slice(0, -2);

        const styleContent = `
            @keyframes glitch-slices {
                0%, 90%, 100% { clip-path: ${slicesNormal}; transform: skewX(0deg); }
                92% { clip-path: ${slicesGlitched}; transform: skewX(${skewDeg}deg); }
                94% { clip-path: ${slicesNormal}; transform: skewX(-${skewDeg}deg); }
                96% { clip-path: ${slicesGlitched}; transform: skewX(0deg); }
                98% { clip-path: ${slicesNormal}; transform: skewX(${skewDeg}deg); }
            }

            @keyframes glitch-rgb-r {
                0%, 90%, 100% { transform: translate(0, 0); opacity: 0; }
                92%, 96% { transform: translate(-${splitPx}px, 1px); opacity: ${rNorm * 0.6}; }
                94%, 98% { transform: translate(${splitPx}px, -1px); opacity: ${rNorm * 0.4}; }
            }

            @keyframes glitch-rgb-b {
                0%, 90%, 100% { transform: translate(0, 0); opacity: 0; }
                92%, 96% { transform: translate(${splitPx}px, -1px); opacity: ${rNorm * 0.6}; }
                94%, 98% { transform: translate(-${splitPx}px, 1px); opacity: ${rNorm * 0.4}; }
            }

            .glitch-main-layer {
                animation: glitch-slices ${durationMs}ms steps(1) infinite;
            }
            .glitch-rgb-r {
                animation: glitch-rgb-r ${durationMs}ms steps(1) infinite;
                mix-blend-mode: screen;
                background: rgba(255,0,0,0.5);
            }
            .glitch-rgb-b {
                animation: glitch-rgb-b ${durationMs}ms steps(1) infinite;
                mix-blend-mode: screen;
                background: rgba(0,0,255,0.5);
            }
        `;

        styleRef.current.textContent = styleContent;
    }, [intensity, speed, rgbSplit, sliceCount]);

    if (!enabled) return null;

    return (
        <>
            <style ref={styleRef} />
            {/* Main layer with clip-path slice glitch */}
            <div
                className="glitch-main-layer"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20,
                    background: 'transparent',
                    backdropFilter: intensity > 20 ? `contrast(${1 + intensity * 0.005})` : 'none',
                    overflow: 'hidden'
                }}
            />

            {/* RGB Red channel ghost */}
            <div
                className="glitch-rgb-r"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 21,
                    opacity: 0
                }}
            />

            {/* RGB Blue channel ghost */}
            <div
                className="glitch-rgb-b"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 21,
                    opacity: 0
                }}
            />
        </>
    );
}
