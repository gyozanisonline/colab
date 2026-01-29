/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { GradientTexture } from '@react-three/drei';
import * as THREE from 'three';

function BendingPlane() {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            // Subtle movement
            meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.1;
            meshRef.current.scale.setScalar(1 + Math.sin(time * 0.2) * 0.05);
        }
    });

    return (
        <mesh ref={meshRef} scale={[2, 2, 1]}>
            <planeGeometry args={[10, 10, 64, 64]} />
            <meshBasicMaterial>
                <GradientTexture
                    stops={[0, 0.3, 0.6, 1]} // As many stops as you want
                    colors={['#ff0080', '#7928ca', '#ff0080', '#7928ca']} // Colors to shift between
                    size={1024}
                />
            </meshBasicMaterial>
        </mesh>
    );
}

function AnimatedShaderPlane() {
    const materialRef = useRef();

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color("#EA2027") },
            uColor2: { value: new THREE.Color("#006266") },
            uColor3: { value: new THREE.Color("#1B1464") }
        },
        vertexShader: `
            varying vec2 vUv;
            uniform float uTime;
            void main() {
                vUv = uv;
                vec3 pos = position;
                // Add some wave distortion
                pos.z += sin(pos.x * 2.0 + uTime) * 0.2;
                pos.z += cos(pos.y * 2.0 + uTime * 1.5) * 0.2;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform vec3 uColor3;
            varying vec2 vUv;

            void main() {
                // Warping UVs
                vec2 uv = vUv;
                uv.x += sin(uv.y * 5.0 + uTime) * 0.1;
                uv.y += cos(uv.x * 5.0 + uTime * 0.8) * 0.1;

                // Color mixing
                vec3 color = mix(uColor1, uColor2, sin(uv.x * 10.0 + uTime * 0.5) * 0.5 + 0.5);
                color = mix(color, uColor3, cos(uv.y * 8.0 - uTime * 0.5) * 0.5 + 0.5);

                gl_FragColor = vec4(color, 1.0);
            }
        `
    }), []);

    return (
        <mesh rotation={[0, 0, 0]}>
            <planeGeometry args={[20, 12, 128, 128]} />
            <shaderMaterial ref={materialRef} args={[shaderArgs]} side={THREE.DoubleSide} />
        </mesh>
    );
}

export default function ColorBends() {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#000' }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <AnimatedShaderPlane />
            </Canvas>
        </div>
    );
}
