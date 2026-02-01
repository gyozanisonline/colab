import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useControls } from 'leva';

function ParticleSwarm({ count = 100, color, size, speedFactor }) {
    const mesh = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame(() => {
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            // Apply speedFactor
            t = particle.t += (speed * speedFactor) / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            // Apply scale logic + global size control
            dummy.scale.set(s * size, s * size, s * size);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <>
            <pointLight distance={40} intensity={8} color="lightblue" />
            <instancedMesh ref={mesh} args={[null, null, count]}>
                <dodecahedronGeometry args={[0.2, 0]} /> {/* Base size, scaled by matrix */}
                <meshPhongMaterial color={color} />
            </instancedMesh>
        </>
    );
}

export default function Particles() {
    const { count, color, size, speed } = useControls('Particles', {
        count: { value: 500, min: 100, max: 2000, step: 50 },
        color: '#05c3dd',
        size: { value: 0.2, min: 0.05, max: 1.0 },
        speed: { value: 1, min: 0.1, max: 5 }
    });

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#000' }}>
            <Canvas camera={{ fov: 75, position: [0, 0, 70] }}>
                <ParticleSwarm count={count} color={color} size={size} speedFactor={speed} />
            </Canvas>
        </div>
    );
}
