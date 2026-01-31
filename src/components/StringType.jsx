import { useEffect, useRef } from 'react';
import { Particle } from '../utils/Particle';

export default function StringType({
    text = 'YOU DON\'T UNDERSTAND THINGS, YOU JUST GET USED TO THEM.',
    stripHeightProp = 70,
    foreColorProp = '#ffffff',
    bgColorProp = '#0d0d0d',
    animationSpeed = 1,
    steps = 70,
    stripCount = 1,
    textColor = '#ffffff'
}) {
    const containerRef = useRef(null);
    const p5Instance = useRef(null);

    // Props ref to access latest values inside sketch closure
    const propsRef = useRef({ text, stripHeightProp, foreColorProp, bgColorProp, animationSpeed, steps, stripCount, textColor });

    useEffect(() => {
        propsRef.current = { text, stripHeightProp, foreColorProp, bgColorProp, animationSpeed, steps, stripCount, textColor };
    }, [text, stripHeightProp, foreColorProp, bgColorProp, animationSpeed, steps, stripCount, textColor]);

    useEffect(() => {
        if (!containerRef.current) return;

        const sketch = (p) => {
            // --- Global Variables (Scoped to Instance) ---
            let particles = [];
            let textureUnit = 5;
            let currentTextureUnit = 5;

            let stripCount = 1; // Default

            let squiggleCount = 1;
            let stripHeight = 85;

            let culmDist = [];

            let bkgdColor;

            let mainText1;
            let currentMainText1;
            let currentTextColor; // Track color changes for texture redraw

            let rSpeed = [];

            let handleColor;
            let drgHL = stripHeight; // Initial drag handle length
            let drgStartX, drgStartY, drgA = 0;
            let draggedIn = false;
            let noneSelected = true;

            // Textures
            let pgT, pgGH, pgStripes, pgG;

            // --- Helper Functions ---
            const drawTextures = () => {
                bkgdColor = p.color(propsRef.current.bgColorProp); // Use prop
                p.background(bkgdColor);

                // Re-create textures based on current text/colors
                // Text Texture
                pgT = p.createGraphics(1000, 150);
                pgT.background(0, 0, 0, 0);
                pgT.fill(p.color(propsRef.current.textColor)); // Use textColor prop
                pgT.textSize(100);
                pgT.textAlign(p.CENTER, p.CENTER);
                pgT.text(propsRef.current.text, pgT.width / 2, pgT.height / 2 - 15);

                // Gradient H?
                pgGH = p.createGraphics(100, 100);
                pgGH.background(0, 0, 0, 0);
                setGradient(pgGH, 0, 0, pgGH.width, pgGH.height, p.color('#2955d9'), p.color('#2793f2'), 1);

                // Stripes
                pgStripes = p.createGraphics(100, 100);
                pgStripes.background(0, 0, 0, 0);
                pgStripes.fill(p.color(propsRef.current.textColor)); // Use textColor prop
                pgStripes.noStroke();
                pgStripes.rect(0, 0, 100, 20);
                pgStripes.rect(0, 40, 100, 20);
                pgStripes.rect(0, 80, 100, 20);

                // Gradient
                pgG = p.createGraphics(100, 100);
                pgG.background(0, 0, 0, 0);
                setGradient(pgG, 0, 0, pgG.width, pgG.height, p.color('#f2c12e'), p.color('#f23e2e'), 2);
            };

            const setGradient = (pg, x, y, w, h, c1, c2, axis) => {
                pg.noFill();
                if (axis == 1) { // Top to bottom
                    for (let i = y; i <= y + h; i++) {
                        let inter = p.map(i, y, y + h, 0, 1);
                        let c = p.lerpColor(c1, c2, inter);
                        pg.stroke(c);
                        pg.line(x, i, x + w, i);
                    }
                } else if (axis == 2) { // Left to right
                    for (let i = x; i <= x + w; i++) {
                        let inter = p.map(i, x, x + w, 0, 1);
                        let c = p.lerpColor(c1, c2, inter);
                        pg.stroke(c);
                        pg.line(i, y, i, y + h);
                    }
                }
            };

            p.setup = () => {
                const { width, height } = containerRef.current.getBoundingClientRect();
                p.setAttributes('alpha', true); // Ensure transparency support
                p.createCanvas(width, height, p.WEBGL);

                handleColor = p.color(0, 0, 255);

                mainText1 = propsRef.current.text;
                currentMainText1 = propsRef.current.text;
                currentTextColor = propsRef.current.textColor;

                p.frameRate(30);
                p.rectMode(p.CENTER);

                culmDist[0] = [];
                particles[0] = [];

                // Initialize default particles - use screen coords (after translate, 0,0 is top-left)
                particles[0][0] = new Particle(p.width / 2, p.height * 3 / 4, p.PI, p.width / 4);
                particles[0][1] = new Particle(p.width / 2, p.height / 2, p.PI, p.width / 4);
                particles[0][2] = new Particle(p.width / 2, p.height / 4, p.PI, p.width / 4);

                drawTextures();

                for (let r = 0; r < 20; r++) {
                    let rs = p.random(5, 20);
                    rSpeed[r] = rs / 10;
                }

                // Remote Drag Listener
                window.addEventListener('remote-string-drag', (e) => {
                    const data = e.detail;
                    if (particles[data.sIndex] && particles[data.sIndex][data.pIndex]) {
                        const pt = particles[data.sIndex][data.pIndex];
                        // Denormalize
                        pt.x = data.x * p.width;
                        pt.y = data.y * p.height;
                        pt.hx = data.hx * p.width;
                        pt.hy = data.hy * p.height;
                        pt.althx = data.althx * p.width;
                        pt.althy = data.althy * p.height;
                        // Force update handles internally if needed, but we set them directly
                        // pt.updateHandles(); // Not needed if we set hx/hy directly
                    }
                });
            }

            p.draw = () => {
                p.clear(); // Clear to transparent

                // Sync Props
                stripHeight = propsRef.current.stripHeightProp;
                // foreColor = p.color(propsRef.current.foreColorProp);
                bkgdColor = p.color(propsRef.current.bgColorProp);
                mainText1 = propsRef.current.text;
                stripCount = propsRef.current.stripCount; // Use prop value

                // Don't fill background - keep transparent to show starfield

                // Compare current color prop with tracked color
                const newTextColor = propsRef.current.textColor;

                if (textureUnit != currentTextureUnit || mainText1 != currentMainText1 || newTextColor != currentTextColor) {
                    drawTextures();
                    currentTextureUnit = textureUnit;
                    currentMainText1 = mainText1;
                    currentTextColor = newTextColor;
                }

                p.push();

                // Camera fix if needed? or just translate centered
                // Original code translated -width/2, -height/2 because 0,0 is center in WEBGL
                // Particles in original code seem to be created in screen coordinates (0 to width), 
                // so we shift to align WEBGL center (0,0) with Top-Left (0,0) visual logic if needed
                p.translate(-p.width / 2, -p.height / 2);

                // --- UI / Interaction Overlay Lines ---
                let particleCt = particles[squiggleCount - 1].length;
                if (draggedIn) { // Creating new point
                    p.stroke(0, 0, 255);
                    p.strokeWeight(1);
                    p.noFill();

                    const lastPt = particles[squiggleCount - 1][particleCt - 1];
                    p.bezier(lastPt.x, lastPt.y, -2,
                        lastPt.althx, lastPt.althy, -2,
                        drgStartX + p.cos(drgA) * drgHL, drgStartY + p.sin(drgA) * drgHL, -2,
                        drgStartX, drgStartY, -2);
                    p.line(drgStartX + p.cos(drgA) * drgHL, drgStartY + p.sin(drgA) * drgHL, -2,
                        drgStartX - p.cos(drgA) * drgHL, drgStartY - p.sin(drgA) * drgHL, -2)
                } else if (particles[squiggleCount - 1].length > 1) {
                    // Dragging handle logic visualization...
                    // Simplified port for now: just basic bezier connection visual
                }

                // --- Render Strips ---
                for (let n = 0; n < squiggleCount; n++) {
                    for (let m = 0; m < stripCount; m++) {
                        // Strip logic reuse
                        // For simplicity in port, we just render strip 0 (Text) or use logic

                        culmDist[n][m] = 0;
                        for (let j = particles[n].length; j > 0; j--) {
                            if (j < particles[n].length) {
                                // Defaulting to Text Texture for 'String Type' feel
                                let stripSelect = pgT;

                                p.texture(stripSelect);
                                p.textureMode(p.NORMAL);

                                let heightRatio = stripSelect.width * (stripHeight / stripCount) / stripSelect.height;

                                p.beginShape(p.TRIANGLE_STRIP);

                                const steps = propsRef.current.steps; // Use prop value
                                for (let k = 0; k <= steps; k++) {
                                    let x = particles[n][j].x;
                                    let y = particles[n][j].y;
                                    let preX = particles[n][j - 1].x;
                                    let preY = particles[n][j - 1].y;

                                    let hX = particles[n][j].hx;
                                    let hY = particles[n][j].hy;
                                    let hPreX = particles[n][j - 1].althx; // hPreX is previous point's alt handle
                                    let hPreY = particles[n][j - 1].althy;

                                    let t = k / steps;
                                    let pointX = p.bezierPoint(x, hX, hPreX, preX, t);
                                    let pointY = p.bezierPoint(y, hY, hPreY, preY, t);
                                    let tangentX = p.bezierTangent(x, hX, hPreX, preX, t);
                                    let tangentY = p.bezierTangent(y, hY, hPreY, preY, t);
                                    let pointAngle = p.atan2(tangentY, tangentX) - p.HALF_PI;

                                    // Use animationSpeed from props
                                    let u = p.map((culmDist[n][m] + p.frameCount * propsRef.current.animationSpeed) % heightRatio, 0, heightRatio, 0, 1);

                                    // Strip width offsets
                                    let thisStripHeight = stripHeight / stripCount;
                                    let stripHeightBottom = -stripHeight / 2 + m * thisStripHeight;
                                    let stripHeightTop = -stripHeight / 2 + (m + 1) * thisStripHeight;

                                    // Calculate distance
                                    let preT = (k - 1) / steps;
                                    let prePointX = p.bezierPoint(x, hX, hPreX, preX, preT);
                                    let prePointY = p.bezierPoint(y, hY, hPreY, preY, preT);
                                    let thisStepDist = p.abs(p.dist(pointX, pointY, prePointX, prePointY));

                                    if (k != steps) culmDist[n][m] += thisStepDist;

                                    p.vertex(pointX + p.cos(pointAngle) * stripHeightBottom, pointY + p.sin(pointAngle) * stripHeightBottom, u, 1);
                                    p.vertex(pointX + p.cos(pointAngle) * stripHeightTop, pointY + p.sin(pointAngle) * stripHeightTop, u, 0);

                                    if (thisStepDist > textureUnit) textureUnit = thisStepDist;
                                }
                                p.endShape();
                            }
                        }
                    }
                }

                // --- Render Helpers (Particles) ---
                p.translate(0, 0, 1);
                for (let n = 0; n < squiggleCount; n++) {
                    for (let j = 0; j < particles[n].length; j++) {
                        // Pass p5 instance to Particle methods if needed, or if Particle handles it
                        // Particle class likely expects just x,y update
                        // show(p5, color, isSelected)
                        particles[n][j].update(p.mouseX + p.width / 2, p.mouseY + p.height / 2); // Adjustment for translate?
                        // Wait, we translated to -width/2, -height/2. So mouseX (0..width) refers to correct space?
                        // If we interact with mouseX, mouseY which are screen coords, we need to map them to world space.
                        // With translate(-width/2, -height/2), world 0,0 is at corner.
                        // So mouseX, mouseY should work directly if they are 0..width.
                        // Let's check Particle Update signature: update(mouseX, mouseY)

                        particles[n][j].update(p.mouseX, p.mouseY); // Should work if mouseX is relative to canvas corner

                        // Emit Sync if dragging
                        if ((particles[n][j].dragging || particles[n][j].draggingHandle || particles[n][j].draggingHandleAlt) && p.frameCount % 3 === 0) {
                            if (window.emitStringDrag) {
                                window.emitStringDrag({
                                    sIndex: n,
                                    pIndex: j,
                                    x: particles[n][j].x / p.width, // Normalize
                                    y: particles[n][j].y / p.height,
                                    hx: particles[n][j].hx / p.width,
                                    hy: particles[n][j].hy / p.height,
                                    althx: particles[n][j].althx / p.width, // Sync both handles
                                    althy: particles[n][j].althy / p.height
                                });
                            }
                        }

                        particles[n][j].over(p.mouseX, p.mouseY);
                        particles[n][j].show(p, handleColor, false);
                    }
                }

                p.pop();

                // Keep handles visible
                handleColor.setAlpha(255);
                // if (handleAlpha >= 0) handleAlpha -= 15;
            };

            p.mouseMoved = () => {
                // handleAlpha reset handled by constant visibility
            };

            p.mousePressed = () => {
                // clickedIn = true;
                drgStartX = p.mouseX;
                drgStartY = p.mouseY;
                noneSelected = true; // Assume none, prove otherwise

                for (var n = 0; n < squiggleCount; n++) {
                    for (var j = 0; j < particles[n].length; j++) {
                        if (particles[n][j].pressed(p.mouseX, p.mouseY)) {
                            noneSelected = false;
                        }
                    }
                }
            };

            p.mouseDragged = () => {
                // If we are dragging a handle, dragHL etc are updated by Particle class internally?
                // Particle.update takes mouseX, mouseY.
                // But here we calculate drag handle length for the NEW point visualization
                drgHL = p.dist(drgStartX, drgStartY, p.mouseX, p.mouseY);
                drgA = p.atan2(drgStartY - p.mouseY, drgStartX - p.mouseX);
                draggedIn = true;
            };

            p.mouseReleased = () => {
                // If we were dragging to create a new point
                if (draggedIn && noneSelected) {
                    // Add new particle
                    // Helper to get last particle of current squiggle
                    // let lastP = particles[squiggleCount - 1][particles[squiggleCount - 1].length - 1];

                    // New particle at drag start (where we clicked)
                    // Angle based on drag
                    // Handle length based on drag
                    let newP = new Particle(drgStartX, drgStartY, drgA, drgHL, stripHeight);
                    // Adjust handle of previous point to smooth? 
                    // Original logic usually adjusts previous point's alt handle or similar.
                    // For now simple add:
                    particles[squiggleCount - 1].push(newP);

                    // Update steps/particles count? loops handle .length automatically
                }

                for (var n = 0; n < squiggleCount; n++) {
                    for (var j = 0; j < particles[n].length; j++) {
                        particles[n][j].released();
                    }
                }
                // clickedIn = false;
                draggedIn = false;
                noneSelected = true;
            };
        };

        const P5 = window.p5;
        if (P5) {
            p5Instance.current = new P5(sketch, containerRef.current);
        }

        return () => {
            if (p5Instance.current) p5Instance.current.remove();
        };
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15 }} />
    );
}
