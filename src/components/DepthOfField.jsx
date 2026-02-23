import { useEffect, useRef } from 'react';

/**
 * DepthOfField - CSS post-FX overlay.
 * Blurs the edges of the screen while keeping a circular focus zone sharp.
 * Uses a layered approach: a blurred backdrop sits behind a sharp cutout mask.
 */
export default function DepthOfField({
    enabled = false,
    blurAmount = 8,
    focusRadius = 35,
    focusX = 50,
    focusY = 50
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;

        // The focus zone is an ellipse; outside it gets blurred.
        // We express focusRadius in vmin so it scales with the viewport.
        const innerEdge = focusRadius;
        const outerEdge = focusRadius + 25; // feather band width

        el.style.setProperty('--dof-blur', `${blurAmount}px`);
        el.style.setProperty('--dof-mask', `radial-gradient(
            ellipse ${innerEdge}vmin ${innerEdge * 0.7}vmin at ${focusX}% ${focusY}%,
            transparent 0%,
            transparent 70%,
            rgba(0,0,0,0.3) 85%,
            rgba(0,0,0,1) 100%
        )`);
        el.style.setProperty('--dof-outer', `radial-gradient(
            ellipse ${outerEdge}vmin ${outerEdge * 0.7}vmin at ${focusX}% ${focusY}%,
            transparent 0%,
            transparent 60%,
            rgba(0,0,0,${Math.min(blurAmount / 20, 0.85)}) 100%
        )`);
    }, [blurAmount, focusRadius, focusX, focusY]);

    if (!enabled) return null;

    return (
        <>
            <style>{`
                .dof-blur-layer {
                    -webkit-mask-image: var(--dof-mask);
                    mask-image: var(--dof-mask);
                    backdrop-filter: blur(var(--dof-blur, 8px));
                    -webkit-backdrop-filter: blur(var(--dof-blur, 8px));
                }
            `}</style>

            {/* Blurred edge layer — sharp center is cut out via mask */}
            <div
                ref={containerRef}
                className="dof-blur-layer"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 22,
                    overflow: 'hidden'
                }}
            />

            {/* Vignette darkening on blurred region */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 23,
                    background: 'var(--dof-outer)',
                    overflow: 'hidden'
                }}
            />
        </>
    );
}
