import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function Stars({ count, radius, color, size, speed, ...props }) {
    const ref = useRef();
    const sphere = useMemo(() => random.inSphere(new Float32Array(count * 3), { radius }), [count, radius]); // Recalculate when count/radius changes

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

export default function StarField({ count = 5000, radius = 1.5, color = '#f272c8', size = 0.005, speed = 1 }) {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#111' }}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars count={count} radius={radius} color={color} size={size} speed={speed} />
            </Canvas>
        </div>
    );
}
