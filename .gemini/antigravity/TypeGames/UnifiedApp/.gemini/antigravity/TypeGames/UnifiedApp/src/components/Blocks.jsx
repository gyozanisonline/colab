import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';

function RotatingBox({ hoveredColor, defaultColor, scaleFactor, speedFactor, ...props }) {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        mesh.current.rotation.x += delta * 0.5 * speedFactor;
        mesh.current.rotation.y += delta * 0.2 * speedFactor;
    });

    return (
        <Box
            {...props}
            ref={mesh}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={scaleFactor * (hovered ? 1.5 : 1)}
        >
            <meshStandardMaterial color={hovered ? hoveredColor : defaultColor} wireframe />
        </Box>
    );
}

export default function Blocks() {
    const { defaultColor, hoveredColor, scale, speed } = useControls('Blocks', {
        defaultColor: 'orange',
        hoveredColor: 'hotpink',
        scale: { value: 1, min: 0.5, max: 3 },
        speed: { value: 1, min: 0.1, max: 5 }
    });

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#222' }}>
            <Canvas>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <RotatingBox position={[-1.2, 0, 0]} hoveredColor={hoveredColor} defaultColor={defaultColor} scaleFactor={scale} speedFactor={speed} />
                <RotatingBox position={[1.2, 0, 0]} hoveredColor={hoveredColor} defaultColor={defaultColor} scaleFactor={scale} speedFactor={speed} />
                <RotatingBox position={[0, 1.2, 0]} hoveredColor={hoveredColor} defaultColor={defaultColor} scaleFactor={scale} speedFactor={speed} />
                <RotatingBox position={[0, -1.2, 0]} hoveredColor={hoveredColor} defaultColor={defaultColor} scaleFactor={scale} speedFactor={speed} />
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
}
