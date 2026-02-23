import { useEffect, useRef } from 'react';

export default function ParticleText({
    text = 'Colab',
    color = '#05c3dd',
    particleCount = 3000,
    particleSize = 2,
    driftAmount = 0.8,
    interactionRadius = 80,
    fontSize = 180,
}) {
    const canvasRef = useRef(null);
    const propsRef = useRef({});
    const stateRef = useRef({
        particles: [],
        mouse: { x: -9999, y: -9999 },
        needsRebuild: true,
        frame: 0,
    });
    const rafRef = useRef(null);

    // Keep propsRef always current (no deps so it runs every render)
    useEffect(() => {
        propsRef.current = { text, color, particleCount, particleSize, driftAmount, interactionRadius, fontSize };
    });

    // Signal rebuild when shape-defining props change
    useEffect(() => {
        stateRef.current.needsRebuild = true;
    }, [text, fontSize, particleCount]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const sampleText = () => {
            const { text, fontSize } = propsRef.current;
            const offscreen = document.createElement('canvas');
            offscreen.width = canvas.width;
            offscreen.height = canvas.height;
            const octx = offscreen.getContext('2d');

            octx.fillStyle = '#ffffff';
            octx.textAlign = 'center';
            octx.textBaseline = 'middle';

            const lines = text.split('\n');
            const lineHeight = fontSize * 1.2;
            const totalHeight = lines.length * lineHeight;

            lines.forEach((line, i) => {
                // Try bold sans-serif that works without loading fonts
                octx.font = `900 ${fontSize}px Arial, sans-serif`;
                octx.fillText(
                    line,
                    canvas.width / 2,
                    canvas.height / 2 - totalHeight / 2 + i * lineHeight + lineHeight / 2
                );
            });

            const data = octx.getImageData(0, 0, offscreen.width, offscreen.height).data;
            const points = [];
            const step = 4;
            for (let y = 0; y < offscreen.height; y += step) {
                for (let x = 0; x < offscreen.width; x += step) {
                    if (data[(y * offscreen.width + x) * 4 + 3] > 128) {
                        points.push({ x, y });
                    }
                }
            }
            return points;
        };

        const buildParticles = () => {
            const { particleCount } = propsRef.current;
            const points = sampleText();
            if (points.length === 0) return;

            const particles = [];
            for (let i = 0; i < particleCount; i++) {
                const target = points[Math.floor(Math.random() * points.length)];
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: 0,
                    vy: 0,
                    tx: target.x,
                    ty: target.y,
                    noiseOffset: Math.random() * 1000,
                });
            }
            stateRef.current.particles = particles;
        };

        buildParticles();
        stateRef.current.needsRebuild = false;

        // Simple deterministic noise using sine sums
        const noise = (x) =>
            Math.sin(x * 127.1) * 0.5 +
            Math.sin(x * 311.7) * 0.3 +
            Math.sin(x * 74.7) * 0.2;

        const animate = () => {
            rafRef.current = requestAnimationFrame(animate);

            if (stateRef.current.needsRebuild) {
                buildParticles();
                stateRef.current.needsRebuild = false;
            }

            const { particleSize, driftAmount, interactionRadius, color } = propsRef.current;
            const { particles, mouse } = stateRef.current;
            const frame = stateRef.current.frame;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = color;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Spring toward target
                p.vx += (p.tx - p.x) * 0.05;
                p.vy += (p.ty - p.y) * 0.05;

                // Perlin-like noise drift
                const t = frame * 0.005 + p.noiseOffset;
                p.vx += noise(t) * driftAmount;
                p.vy += noise(t + 100) * driftAmount;

                // Mouse repulsion
                const mdx = p.x - mouse.x;
                const mdy = p.y - mouse.y;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mdist < interactionRadius && mdist > 0) {
                    const force = (interactionRadius - mdist) / interactionRadius;
                    p.vx += (mdx / mdist) * force * 6;
                    p.vy += (mdy / mdist) * force * 6;
                }

                // Damping
                p.vx *= 0.88;
                p.vy *= 0.88;
                p.x += p.vx;
                p.y += p.vy;

                ctx.beginPath();
                ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }

            stateRef.current.frame++;
        };

        const onMouseMove = (e) => {
            stateRef.current.mouse = { x: e.clientX, y: e.clientY };
        };
        const onMouseLeave = () => {
            stateRef.current.mouse = { x: -9999, y: -9999 };
        };
        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stateRef.current.needsRebuild = true;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('resize', onResize);
        animate();

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseleave', onMouseLeave);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
        />
    );
}
