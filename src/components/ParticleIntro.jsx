import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WORDS = [
    { text: "Create", font: "bold 150px Helvetica, Arial, sans-serif" },
    { text: "Together", font: "bold 150px Helvetica, Arial, sans-serif" },
    {
        type: "composite",
        parts: [
            { text: "CO", font: "oblique 150px Helvetica, Arial, sans-serif" },
            { text: "LAB", font: "bold 150px Helvetica, Arial, sans-serif" }
        ]
    }
];

const DURATION_PER_WORD = 3.0; // 1.8s read + ~1.2s delay
const TRANSITION_SPEED = 0.08;
const PARTICLE_COUNT = 4000; // Increased count for density
const CANVAS_SIZE = 1024;

// Helper to generate grid points from text
function getTextCoordinates(wordConfig) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';

    if (wordConfig.type === 'composite') {
        // Measure total width to center the group
        let totalWidth = 0;
        const partsWithWidth = wordConfig.parts.map(part => {
            ctx.font = part.font;
            const width = ctx.measureText(part.text).width;
            totalWidth += width;
            return { ...part, width };
        });

        let currentX = (CANVAS_SIZE - totalWidth) / 2;
        const y = CANVAS_SIZE / 2;

        partsWithWidth.forEach(part => {
            ctx.font = part.font;
            ctx.textAlign = 'left';
            ctx.fillText(part.text, currentX, y);
            currentX += part.width;
        });

    } else {
        // Simple text
        ctx.font = wordConfig.font;
        ctx.textAlign = 'center';
        ctx.fillText(wordConfig.text, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    }

    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const data = imageData.data;
    const coords = [];

    // Sample density
    const step = 3; // Denser sampling needed for 4000 particles

    for (let y = 0; y < CANVAS_SIZE; y += step) {
        for (let x = 0; x < CANVAS_SIZE; x += step) {
            const alpha = data[(y * CANVAS_SIZE + x) * 4 + 3];
            if (alpha > 128) {
                // Map to 3D space. 
                // Canvas 0..1024 -> -10..10 roughly
                coords.push({
                    x: (x - CANVAS_SIZE / 2) * 0.035,
                    y: -(y - CANVAS_SIZE / 2) * 0.035,
                    z: 0
                });
            }
        }
    }
    return coords;
}

function ParticleSwarmText({ onSequenceComplete }) {
    const mesh = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Pre-calculate positions for all words, and track where the text ends
    const wordData = useMemo(() => {
        return WORDS.map(word => {
            const coords = getTextCoordinates(word);
            // Pad or truncate to PARTICLE_COUNT
            const targets = new Array(PARTICLE_COUNT).fill(null).map((_, i) => {
                if (i < coords.length) {
                    return coords[i];
                } else {
                    // Excess particles scatter to random positions
                    return {
                        x: (Math.random() - 0.5) * 60,
                        y: (Math.random() - 0.5) * 40,
                        z: (Math.random() - 0.5) * 30 - 10
                    };
                }
            });
            return { targets, textEndIndex: coords.length };
        });
    }, []);

    // Individual particle state (current pos, velocity, offset parameters)
    const particles = useMemo(() => {
        return new Array(PARTICLE_COUNT).fill(null).map(() => ({
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            z: (Math.random() - 0.5) * 100,
            // Swarm parameters from original Particles.jsx
            t: Math.random() * 100,
            factor: 20 + Math.random() * 100,
            speed: 0.01 + Math.random() / 200,
            baseScale: 0.5 + Math.random() * 2.5, // Random scale between 0.5x and 3.0x
            mx: 0, my: 0
        }));
    }, []);

    const [wordIndex, setWordIndex] = useState(0);
    const timeRef = useRef(0);

    useFrame((state, delta) => {
        timeRef.current += delta;
        const time = state.clock.getElapsedTime();

        // Sequence logic
        if (wordIndex < WORDS.length - 1) {
            if (timeRef.current > DURATION_PER_WORD) {
                setWordIndex(prev => prev + 1);
                timeRef.current = 0;
            }
        } else {
            // Final word "COLAB"
            if (timeRef.current > 1.0) {
                // Trigger callback once, but keep running
                onSequenceComplete && onSequenceComplete();
            }
        }

        const { targets, textEndIndex } = wordData[wordIndex];

        particles.forEach((particle, i) => {
            // 1. Calculate Swarm Motion parameters
            particle.t += particle.speed / 2;

            // 2. Move towards Target
            const target = targets[i];
            const moveSpeed = TRANSITION_SPEED + (Math.random() * 0.01);

            particle.x += (target.x - particle.x) * moveSpeed;
            particle.y += (target.y - particle.y) * moveSpeed;
            particle.z += (target.z - particle.z) * moveSpeed;

            // 3. Apply final position with behavior based on Type (Text vs Background)
            const isBackground = i >= textEndIndex;

            let finalX = particle.x;
            let finalY = particle.y;
            let finalZ = particle.z;

            if (isBackground) {
                // Background Motion: Gentle floating drift
                // Using particle.t and some offsets to make it organic
                const drift = 2.0;
                finalX += Math.sin(time * 0.5 + particle.t) * drift;
                finalY += Math.cos(time * 0.3 + particle.t) * drift;
                finalZ += Math.sin(time * 0.2 + i) * drift;
            } else {
                // Text Motion: Stable with slight wobble
                const wobbleScale = 0.05; // tighter for text
                finalX += Math.cos((particle.t / 10) * particle.factor) * wobbleScale;
                finalY += Math.sin((particle.t / 10) * particle.factor) * wobbleScale;
                finalZ += Math.cos((particle.t / 10) * particle.factor) * wobbleScale;
            }

            dummy.position.set(finalX, finalY, finalZ);

            // 4. Scale and Rotate
            // Background particles can pulse differently
            let scaleSize = 0.8;
            if (isBackground) {
                // Background particles breathe more
                scaleSize = 0.5 + (Math.sin(time + i) * 0.3);
            } else {
                // Text particles stay solid
                scaleSize = 0.8 + (Math.sin(time * 5 + i) * 0.1);
            }

            dummy.scale.set(scaleSize * particle.baseScale, scaleSize * particle.baseScale, scaleSize * particle.baseScale);

            const r = isBackground ? time * 0.5 : 0; // Rotate background particles
            dummy.rotation.set(r, r, r);

            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <>
            <pointLight distance={40} intensity={8} color="lightblue" position={[0, 0, 20]} />
            <group position={[0, 2.5, 0]}>
                <instancedMesh ref={mesh} args={[null, null, PARTICLE_COUNT]}>
                    <dodecahedronGeometry args={[0.02, 0]} />
                    <meshBasicMaterial color="#ffffff" />
                </instancedMesh>
            </group>
        </>
    );
}

export default function ParticleIntro({ onComplete }) {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            background: 'transparent',
            pointerEvents: 'none'
        }}>
            <Canvas camera={{ position: [0, 0, 35], fov: 45 }}>
                {/* Removed black background color to let App background show or use transparent */}
                <ParticleSwarmText onSequenceComplete={onComplete} />
            </Canvas>
        </div>
    );
}
