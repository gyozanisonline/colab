import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useControls } from 'leva';

function Stars({ count, radius, color, size, speed, ...props }) {
    const ref = useRef();
    const [sphere] = useState(() => random.inSphere(new Float32Array(count * 3), { radius })); // *3 for xyz

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10 * speed;
        ref.current.rotation.y -= delta / 15 * speed;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial transparent color={color} size={size} sizeAttenuation={true} depthWrite={false} />
            </Points>
        </group>
    );
}

export default function StarField() {
    const { count, radius, color, size, speed } = useControls('StarField', {
        count: { value: 5000, min: 1000, max: 20000, step: 100 },
        radius: { value: 1.5, min: 0.5, max: 5.0 },
        color: '#f272c8',
        size: { value: 0.005, min: 0.001, max: 0.05, step: 0.001 },
        speed: { value: 1, min: 0, max: 5 }
    });

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#111' }}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars count={count} radius={radius} color={color} size={size} speed={speed} />
            </Canvas>
        </div>
    );
}
