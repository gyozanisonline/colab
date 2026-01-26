import { useEffect, useRef } from 'react';

export default function PaintToys({
    text = "There was a table set out under a tree in front of the house...",
    textColor = "#ffffff"
}) {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const stateRef = useRef({
        position: { x: 0, y: 0 },
        mouse: { x: 0, y: 0, down: false },
        textIndex: 0,
        text: text,
        minFontSize: 8,
        maxFontSize: 300,
        angleDistortion: 0.01,
        textColor: textColor
    });

    // Update state when props change
    useEffect(() => {
        stateRef.current.text = text;
        stateRef.current.textColor = textColor;
    }, [text, textColor]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const scale = 2; // High DPI support

        // Resize handling
        const handleResize = () => {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth * scale;
            canvas.height = parent.clientHeight * scale;
            canvas.style.width = `${parent.clientWidth}px`;
            canvas.style.height = `${parent.clientHeight}px`;
            context.scale(scale, scale);
            // No background fill - keep transparent
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial size

        const state = stateRef.current;

        // Initialize position
        state.position = { x: canvas.width / (2 * scale), y: canvas.height / (2 * scale) };

        // Helper functions
        const distance = (pt, pt2) => {
            const xs = (pt2.x - pt.x) ** 2;
            const ys = (pt2.y - pt.y) ** 2;
            return Math.sqrt(xs + ys);
        };

        const getTextWidth = (string, size) => {
            context.font = `${size}px Georgia`;
            return context.measureText(string).width;
        };

        // Draw Loop
        const draw = () => {
            if (state.mouse.down) {
                const newDistance = distance(state.position, state.mouse);
                let fontSize = state.minFontSize + newDistance / 2;

                if (fontSize > state.maxFontSize) {
                    fontSize = state.maxFontSize;
                }

                const letter = state.text[state.textIndex];
                const stepSize = getTextWidth(letter, fontSize);

                if (newDistance > stepSize) {
                    const angle = Math.atan2(state.mouse.y - state.position.y, state.mouse.x - state.position.x);

                    context.font = `${fontSize}px Georgia`;
                    context.fillStyle = state.textColor;

                    context.save();
                    context.translate(state.position.x, state.position.y);
                    context.rotate(angle + (Math.random() * (state.angleDistortion * 2) - state.angleDistortion));
                    context.fillText(letter, 0, 0);
                    context.restore();

                    state.textIndex++;
                    if (state.textIndex > state.text.length - 1) {
                        state.textIndex = 0;
                    }

                    state.position.x = state.position.x + Math.cos(angle) * stepSize;
                    state.position.y = state.position.y + Math.sin(angle) * stepSize;
                }
            }
        };

        const update = () => {
            draw();
            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);

        // Input Handlers
        const getMousePos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const onDown = (e) => {
            state.mouse.down = true;
            const pos = getMousePos(e);
            state.position.x = pos.x;
            state.position.y = pos.y;
            state.mouse.x = pos.x;
            state.mouse.y = pos.y;
        };

        const onUp = () => {
            state.mouse.down = false;
        };

        const onMove = (e) => {
            const pos = getMousePos(e);
            state.mouse.x = pos.x;
            state.mouse.y = pos.y;
        };

        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        canvas.addEventListener('touchstart', onDown, { passive: false });
        canvas.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            canvas.removeEventListener('mousedown', onDown);
            canvas.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            canvas.removeEventListener('touchstart', onDown);
            canvas.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 15, pointerEvents: 'auto' }}>
            <canvas ref={canvasRef} style={{ display: 'block', cursor: 'crosshair', pointerEvents: 'auto' }} />
        </div>
    );
}
