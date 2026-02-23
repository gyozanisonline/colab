import { useEffect, useRef } from 'react';

/**
 * HalftoneEffect - CSS post-FX overlay.
 * Renders a rotated dot-grid over the screen using repeating-radial-gradient.
 * Blend mode makes it interact naturally with whatever is beneath.
 */
export default function HalftoneEffect({
    enabled = false,
    dotSize = 4,
    spacing = 10,
    angle = 0,
    opacity = 80,
    color = '#000000',
    blendMode = 'multiply'
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;

        // Dot radius is half of dotSize, capped so it never exceeds spacing
        const radius = Math.min(dotSize / 2, spacing / 2 - 0.5);

        el.style.setProperty('--ht-color', color);
        el.style.setProperty('--ht-radius', `${radius}px`);
        el.style.setProperty('--ht-spacing', `${spacing}px`);
        el.style.setProperty('--ht-angle', `${angle}deg`);
        el.style.setProperty('--ht-opacity', opacity / 100);
    }, [dotSize, spacing, angle, opacity, color]);

    if (!enabled) return null;

    return (
        <>
            <style>{`
                .halftone-layer {
                    background-image: radial-gradient(
                        circle var(--ht-radius, 2px) at center,
                        var(--ht-color, #000) 0%,
                        transparent 100%
                    );
                    background-size: var(--ht-spacing, 10px) var(--ht-spacing, 10px);
                    transform: rotate(var(--ht-angle, 0deg));
                    /* Expand slightly so rotated grid fills the viewport without gaps */
                    inset: -10%;
                    width: 120%;
                    height: 120%;
                    opacity: var(--ht-opacity, 0.8);
                }
            `}</style>
            <div
                ref={containerRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 24,
                    overflow: 'hidden',
                    mixBlendMode: blendMode
                }}
            >
                <div className="halftone-layer" style={{ position: 'absolute' }} />
            </div>
        </>
    );
}
