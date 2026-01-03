import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useControls } from 'leva';

function Stars({ count, radius, color, ...props }) {
    const ref = useRef();
    const [sphere] = useState(() => random.inSphere(new Float32Array(count * 3), { radius })); // *3 for xyz

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial transparent color={color} size={0.005} sizeAttenuation={true} depthWrite={false} />
            </Points>
        </group>
    );
}

export default function StarField() {
    const { count, radius, color } = useControls('StarField', {
        count: { value: 5000, min: 1000, max: 20000, step: 100 },
        radius: { value: 1.5, min: 0.5, max: 5.0 },
        color: '#f272c8'
    });

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#111' }}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars count={count} radius={radius} color={color} />
            </Canvas>
        </div>
    );
}
