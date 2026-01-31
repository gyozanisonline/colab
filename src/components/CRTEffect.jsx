import { useEffect, useRef } from 'react';

/**
 * CRTEffect - CSS-only Balatro-style CRT overlay
 */
export default function CRTEffect({
    enabled = false,
    intensity = 70,
    scanlineDensity = 50,
    chromaAmount = 50,
    layer = 'type'
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const el = containerRef.current;
        const norm = intensity / 100;
        const scanNorm = scanlineDensity / 100;
        const chromaNorm = chromaAmount / 100;

        // Scanlines: at 0% = very wide gaps (10px), at 100% = tight (2px)
        const scanlineGap = 2 + (1 - scanNorm) * 8;

        el.style.setProperty('--scanline-opacity', 0.35 * norm * (0.3 + scanNorm * 0.7));
        el.style.setProperty('--scanline-gap', `${scanlineGap}px`);
        el.style.setProperty('--phosphor-opacity', 0.2 * norm);
        el.style.setProperty('--vignette-intensity', 0.45 * norm);
        el.style.setProperty('--chroma-intensity', 0.35 * norm * chromaNorm);
        el.style.setProperty('--chroma-size', `${5 + chromaNorm * 15}%`);
    }, [intensity, scanlineDensity, chromaAmount]);

    if (!enabled) return null;

    const zIndex = layer === 'type' ? 15 : 5;

    return (
        <div
            ref={containerRef}
            className={`crt-overlay-${layer}`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex,
                overflow: 'hidden'
            }}
        >
            {/* SCANLINES */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `repeating-linear-gradient(
                    0deg,
                    rgba(0, 0, 0, var(--scanline-opacity, 0.25)) 0px,
                    rgba(0, 0, 0, var(--scanline-opacity, 0.25)) 1px,
                    transparent 1px,
                    transparent var(--scanline-gap, 4px)
                )`
            }} />

            {/* RGB PHOSPHOR */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `repeating-linear-gradient(
                    90deg,
                    rgba(255, 0, 0, var(--phosphor-opacity, 0.12)) 0px,
                    rgba(0, 255, 0, var(--phosphor-opacity, 0.12)) 1px,
                    rgba(0, 100, 255, var(--phosphor-opacity, 0.12)) 2px,
                    transparent 3px
                )`,
                mixBlendMode: 'overlay'
            }} />

            {/* VIGNETTE */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(
                    ellipse 85% 85% at center,
                    transparent 45%,
                    rgba(0, 0, 0, var(--vignette-intensity, 0.35)) 100%
                )`,
                boxShadow: `
                    inset 0 0 120px rgba(0,0,0,0.35),
                    inset 0 0 60px rgba(0,0,0,0.25)
                `
            }} />

            {/* CHROMATIC ABERRATION - smooth fade, no hard edges */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                    radial-gradient(
                        ellipse 120% 120% at 0% 50%,
                        rgba(255, 50, 50, var(--chroma-intensity, 0.08)) 0%,
                        transparent var(--chroma-size, 8%)
                    ),
                    radial-gradient(
                        ellipse 120% 120% at 100% 50%,
                        rgba(50, 200, 255, var(--chroma-intensity, 0.08)) 0%,
                        transparent var(--chroma-size, 8%)
                    )
                `,
                mixBlendMode: 'screen'
            }} />

            {/* Top/bottom chromatic fringe - smooth */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                    radial-gradient(
                        ellipse 120% 120% at 50% 0%,
                        rgba(200, 50, 255, calc(var(--chroma-intensity, 0.08) * 0.4)) 0%,
                        transparent calc(var(--chroma-size, 8%) * 0.6)
                    ),
                    radial-gradient(
                        ellipse 120% 120% at 50% 100%,
                        rgba(50, 255, 100, calc(var(--chroma-intensity, 0.08) * 0.4)) 0%,
                        transparent calc(var(--chroma-size, 8%) * 0.6)
                    )
                `,
                mixBlendMode: 'screen'
            }} />

            {/* SCREEN CURVE SHADOW */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: `
                    inset 0 8px 50px rgba(0,0,0,0.4),
                    inset 0 -8px 50px rgba(0,0,0,0.4),
                    inset 8px 0 50px rgba(0,0,0,0.3),
                    inset -8px 0 50px rgba(0,0,0,0.3)
                `
            }} />

            {/* FLICKER */}
            <style>{`
                @keyframes crt-flicker-${layer} {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.988; }
                    75% { opacity: 1; }
                    90% { opacity: 0.992; }
                }
                .crt-overlay-${layer} {
                    animation: crt-flicker-${layer} 0.08s infinite;
                }
            `}</style>
        </div>
    );
}
