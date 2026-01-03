```javascript
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';

function RotatingBox({ hoveredColor, defaultColor, ...props }) {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        mesh.current.rotation.x += delta * 0.5;
        mesh.current.rotation.y += delta * 0.2;
    });

    return (
        <Box
            {...props}
            ref={mesh}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hovered ? 1.5 : 1}
        >
            <meshStandardMaterial color={hovered ? hoveredColor : defaultColor} wireframe />
        </Box>
    );
}

export default function Blocks() {
    const { defaultColor, hoveredColor } = useControls('Blocks', {
        defaultColor: 'orange',
        hoveredColor: 'hotpink'
    });

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#222' }}>
            <Canvas>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <RotatingBox position={[-1.2, 0, 0]} hoveredColor={hoveredColor} defaultColor={defaultColor} />
                <RotatingBox position={[1.2, 0, 0]} hoveredColor={hoveredColor} defaultColor={defaultColor} />
                <RotatingBox position={[0, 1.2, 0]} hoveredColor={hoveredColor} defaultColor={defaultColor} />
                <RotatingBox position={[0, -1.2, 0]} hoveredColor={hoveredColor} defaultColor={defaultColor} />
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
}
```
