import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ParticleSphereSwarm({ count = 1500, color, size = 0.15 }) {
    const mesh = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Create particles arranged in a sphere
    const particles = useMemo(() => {
        const temp = [];
        const radius = 25; // Sphere radius

        for (let i = 0; i < count; i++) {
            // Distribute points on a sphere using fibonacci sphere algorithm
            const phi = Math.acos(1 - 2 * (i + 0.5) / count);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            // Add some randomness to make it more organic
            const t = Math.random() * 100;
            const speed = 0.005 + Math.random() / 400;
            const factor = 0.5 + Math.random() * 0.5;

            temp.push({
                x, y, z,
                baseX: x, baseY: y, baseZ: z,
                t, speed, factor,
                floatOffset: Math.random() * Math.PI * 2
            });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        particles.forEach((particle, i) => {
            particle.t += particle.speed;

            // Gentle floating animation around sphere positions
            const floatX = Math.sin(time * 0.5 + particle.floatOffset) * 1.5;
            const floatY = Math.cos(time * 0.3 + particle.floatOffset) * 1.5;
            const floatZ = Math.sin(time * 0.4 + particle.floatOffset) * 1.5;

            // Breathing effect - sphere expands and contracts
            const breathe = 1 + Math.sin(time * 0.5) * 0.1;

            dummy.position.set(
                particle.baseX * breathe + floatX,
                particle.baseY * breathe + floatY,
                particle.baseZ * breathe + floatZ
            );

            // Gentle pulsing size
            const s = size * (0.8 + Math.sin(particle.t * 2) * 0.2);
            dummy.scale.set(s, s, s);

            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;

        // Slowly rotate the whole sphere
        mesh.current.rotation.y = time * 0.1;
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 50]} intensity={2} color={color} />
            <pointLight position={[0, 0, -50]} intensity={1} color={color} />
            <instancedMesh ref={mesh} args={[null, null, count]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </instancedMesh>
        </>
    );
}

export default function ParticleSphere({ color = '#00ffcc', count = 1500 }) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            background: '#000',
            zIndex: 0
        }}>
            <Canvas camera={{ fov: 60, position: [0, 0, 60] }}>
                <ParticleSphereSwarm count={count} color={color} />
            </Canvas>
        </div>
    );
}
