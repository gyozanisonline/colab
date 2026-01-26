import { useEffect, useRef } from 'react';
// import p5 from 'p5'; // Conflict with global p5
import { Particle } from '../utils/Particle';

export default function PaintText({
    text = 'Colab Experiment Together',
    textColor = '#ffffff',
    textFontSize = 200, // Used as strip width basis
    stripHeight = 85,
    speed = 1,
    density = 200,
    stepDist = 100,
    mode = 'flow', // 'brush' | 'flow'
    isInteractive = true
}) {
    const containerRef = useRef(null);
    const p5Instance = useRef(null);
    const propsRef = useRef({ text, textColor, stripHeight, speed, density, stepDist, mode });

    // Update propsRef immediately when props change
    useEffect(() => {
        propsRef.current = { text, textColor, stripHeight, speed, density, stepDist, mode };
    }, [text, textColor, stripHeight, speed, density, stepDist, mode]);

    useEffect(() => {
        if (!containerRef.current) return;

        const sketch = (p) => {
            // --- State ---
            // Particles: Array of paths. Each path is Array of Particles.
            // Added property to path: totalLength
            // Added property to particle: distanceOnPath (cumulative length from start)
            let particles = [];
            let currentPathIndex = -1;

            // Texture
            let textGraphics;
            let currentText = '';
            let currentFontSize = 0;
            let currentTextColor = '';

            // Dragging state for creating new paths
            let isDrawingNewPath = false;
            let lastPoint = null;

            // --- Setup ---
            p.setup = () => {
                const { width, height } = containerRef.current.getBoundingClientRect();
                p.createCanvas(width, height, p.WEBGL);
                updateTexture();
                particles = [];
            };

            const updateTexture = () => {
                const { text: txt, textColor: col } = propsRef.current;

                currentText = txt;
                currentFontSize = 100;
                currentTextColor = col;

                p.textSize(currentFontSize);
                const estimatedWidth = p.textWidth(txt) + 100; // Extra padding

                if (textGraphics) textGraphics.remove();

                textGraphics = p.createGraphics(estimatedWidth, 150);
                textGraphics.pixelDensity(1);
                textGraphics.background(0, 0); // Transparent 
                textGraphics.fill(col);
                textGraphics.noStroke();
                textGraphics.textSize(100);
                textGraphics.textAlign(p.CENTER, p.CENTER);
                textGraphics.text(txt, textGraphics.width / 2, textGraphics.height / 2);
            };

            // --- Draw ---
            p.draw = () => {
                const { textColor: col, stripHeight: sh, speed: spd, density, mode } = propsRef.current;

                if (currentText !== propsRef.current.text || currentTextColor !== propsRef.current.textColor) {
                    updateTexture();
                }

                p.clear();
                p.background(0, 0);

                p.push();
                p.translate(-p.width / 2, -p.height / 2);

                p.textureMode(p.NORMAL);
                p.noStroke();

                // Global time for Flow mode
                // We use a rolling offset
                const time = (p.frameCount * spd * 0.01);

                const textureRepeatUnit = density;

                particles.forEach((path, pathIndex) => {
                    if (path.length < 2) return;

                    p.texture(textGraphics);

                    const steps = 20;

                    for (let j = 1; j < path.length; j++) {
                        const p1 = path[j - 1];
                        const p2 = path[j];

                        // Calculate Bezier properties
                        // To map UV correctly, we need approximate arc length of this segment
                        // We can estimate it by summing chord lengths involved in the steps

                        p.beginShape(p.TRIANGLE_STRIP);

                        // We need to know p1's cumulative distance to start
                        // But we want to calculate it dynamicall per segment for rendering?
                        // No, pre-calculating on creation is better for static brushes, 
                        // but handle editing changes lengths.
                        // For Prototype: Let's assume lengths are roughly proportional to t for now,
                        // but map U using a cumulative counter we reset per path draw?
                        // Actually, we can just accumulate in the loop since we draw sequentially.

                        // Better approach for Editable Bezier UVs:
                        // The 'distance' should be a property of the point or calculated on the fly.
                        // Let's rely on simple chord approximation in the step loop for smoothness.

                        let segmentDistStart = p1.distOnPath || 0;
                        // If we are editing handles, distOnPath might be stale.
                        // Ideally we re-calculate all lengths when handles move.
                        // For now, let's just use what we have or re-calc if needed.

                        // Since we don't have a robust "re-calc all on edit" system yet,
                        // let's track distance strictly in the draw loop for determining UVs.
                        // This fixes the "edit breaks texture" issue too.
                    }

                    // RE-IMAGINED DRAW LOOP FOR UV ACCURACY
                    let pathDistance = 0; // Tracks cumulative distance for this path

                    for (let j = 0; j < path.length - 1; j++) {
                        const p1 = path[j];
                        const p2 = path[j + 1];

                        p.beginShape(p.TRIANGLE_STRIP);
                        p.texture(textGraphics); // Ensure texture is bound

                        for (let k = 0; k <= steps; k++) {
                            const t = k / steps;

                            // Bezier Point
                            const x = p.bezierPoint(p1.x, p1.hx, p2.althx, p2.x, t);
                            const y = p.bezierPoint(p1.y, p1.hy, p2.althy, p2.y, t);

                            // Tangent
                            const tx = p.bezierTangent(p1.x, p1.hx, p2.althx, p2.x, t);
                            const ty = p.bezierTangent(p1.y, p1.hy, p2.althy, p2.y, t);
                            const angle = p.atan2(ty, tx) - p.HALF_PI;

                            // Calculate local distance for UV
                            // Simple approx: distance from previous point in loop
                            // For k=0, dist is 0 (relative to start of segment)
                            // But we need cumulative from path start (pathDistance)

                            // For accurate arc length on the fly:
                            // We need p_prev.
                            // In this nested loop, we can track it.

                            // Let's use PRECISE (ish) incremental distance.
                            // On k=0, we are at p1.

                            // We can't easily get 'previous x/y' for k=0 without context.
                            // But p1 is known.

                            // Actually, calculating EXACT bezier length is hard.
                            // Let's just use t? No, that causes stretching.

                            // Simplified fix:
                            // Use the stored particle distances if available? 
                            // No, let's recalculate segment length approx.

                            // Current Strategy:
                            // We know p1 and p2 are ~stepDist apart (usually 100).
                            // Let's assume linear distribution of t maps to linear distance for now
                            // BUT scale it by the actual chord length of the controls?
                            // Even simpler: The texture mapping problem was using X coordinate.
                            // Just using 'j' (index) would be better than X.
                            // But let's do proper cumulative distance tracking.
                        }
                        p.endShape();
                    }
                });

                // --- Real Draw Loop with UV Fix ---
                const steps = 20;
                particles.forEach(path => {
                    if (path.length < 2) return;

                    let cumLength = 0;

                    // We need to draw segment by segment
                    for (let j = 0; j < path.length - 1; j++) {
                        const p1 = path[j];
                        const p2 = path[j + 1];

                        p.beginShape(p.TRIANGLE_STRIP);
                        p.texture(textGraphics);

                        let prevX = p1.x;
                        let prevY = p1.y;

                        for (let k = 0; k <= steps; k++) {
                            const t = k / steps;

                            const x = p.bezierPoint(p1.x, p1.hx, p2.althx, p2.x, t);
                            const y = p.bezierPoint(p1.y, p1.hy, p2.althy, p2.y, t);

                            const tx = p.bezierTangent(p1.x, p1.hx, p2.althx, p2.x, t);
                            const ty = p.bezierTangent(p1.y, p1.hy, p2.althy, p2.y, t);
                            const angle = p.atan2(ty, tx) - p.HALF_PI;

                            // Add distance from previous internal step
                            const stepDist = p.dist(prevX, prevY, x, y);
                            cumLength += stepDist;

                            prevX = x;
                            prevY = y;

                            // UV MAPPING
                            // Check Mode
                            let u;
                            if (mode === 'brush') {
                                // Brush: Texture is stuck to the geometry. 
                                // U = cumulative_length / density
                                u = (cumLength / textureRepeatUnit);
                            } else {
                                // Flow: Texture moves along geometry.
                                // U = (cumulative_length / density) - time
                                u = (cumLength / textureRepeatUnit) - time;
                            }

                            const halfH = sh / 2;
                            p.vertex(x + p.cos(angle) * halfH, y + p.sin(angle) * halfH, u, 1);
                            p.vertex(x + p.cos(angle) * -halfH, y + p.sin(angle) * -halfH, u, 0);
                        }
                        p.endShape();
                    }
                });


                // --- Interact ---
                if (isInteractive) {
                    p.imageMode(p.CORNER);
                    particles.forEach(path => {
                        path.forEach(pt => {
                            pt.update(p.mouseX, p.mouseY);
                            pt.show(p, p.color(255, 100, 100), false);
                        });
                    });
                }

                p.pop();
            };

            // --- Input ---
            p.mousePressed = () => {
                if (!isInteractive) return;

                // Hit test existing
                let clicked = false;
                for (let path of particles) {
                    for (let pt of path) {
                        if (pt.pressed(p.mouseX, p.mouseY)) clicked = true;
                    }
                }

                if (!clicked) {
                    isDrawingNewPath = true;
                    currentPathIndex = particles.length;
                    particles[currentPathIndex] = [];
                    // Start point
                    const newPt = new Particle(p.mouseX, p.mouseY, 0, p.width / 10, stripHeight);
                    particles[currentPathIndex].push(newPt);
                    lastPoint = newPt;
                }
            };

            p.mouseDragged = () => {
                if (!isInteractive) return;

                if (isDrawingNewPath) {
                    const dist = p.dist(p.mouseX, p.mouseY, lastPoint.x, lastPoint.y);
                    // Use prop stepDist
                    if (dist > propsRef.current.stepDist) {
                        const angle = p.atan2(p.mouseY - lastPoint.y, p.mouseX - lastPoint.x);
                        // Make handles proportional to distance
                        const handleLen = dist * 0.4;

                        const newPt = new Particle(p.mouseX, p.mouseY, angle, handleLen, stripHeight);

                        // Update previous point handles to point to this new one smoothly
                        lastPoint.a = angle;
                        lastPoint.hl = handleLen;
                        lastPoint.althl = handleLen;
                        lastPoint.updateHandles();

                        particles[currentPathIndex].push(newPt);
                        lastPoint = newPt;
                    }
                }
            };

            p.mouseReleased = () => {
                isDrawingNewPath = false;
                lastPoint = null;
                particles.forEach(path => path.forEach(pt => pt.released()));
            };

            p.windowResized = () => {
                const { width, height } = containerRef.current.getBoundingClientRect();
                p.resizeCanvas(width, height);
            };
        };

        const P5 = window.p5;
        if (P5) {
            p5Instance.current = new P5(sketch, containerRef.current);
        } else {
            console.error("p5.js not found for PaintText");
        }

        return () => {
            if (p5Instance.current) p5Instance.current.remove();
        };
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15 }} />
    );
}
