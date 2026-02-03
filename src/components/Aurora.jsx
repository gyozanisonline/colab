// Aurora background component with animated blobs - Canvas-based for recording support
import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Color } from 'three';

// Convert hex color to normalized RGB array
const hexToNormalizedRGB = (hex) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return [r, g, b];
};

const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uSpeed;
uniform float uBlobSize;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uBgColor;
varying vec2 vUv;

// Smooth noise function
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = vUv;
    float t = uTime * uSpeed * 0.1;
    
    // Blob size factor (normalized from 20-100 range to 0.2-1.0)
    float blobFactor = uBlobSize / 100.0;
    
    // Create animated blob positions
    vec2 blob1Pos = vec2(
        0.2 + 0.15 * sin(t * 0.5),
        0.3 + 0.2 * cos(t * 0.7)
    );
    vec2 blob2Pos = vec2(
        0.7 + 0.2 * cos(t * 0.6),
        0.4 + 0.15 * sin(t * 0.8)
    );
    vec2 blob3Pos = vec2(
        0.4 + 0.2 * sin(t * 0.4),
        0.7 + 0.2 * cos(t * 0.5)
    );
    
    // Calculate blob influences with noise distortion
    float noiseVal1 = fbm(uv * 3.0 + t * 0.2);
    float noiseVal2 = fbm(uv * 2.5 - t * 0.15);
    float noiseVal3 = fbm(uv * 2.0 + t * 0.1);
    
    // Distance-based blob effect with size control
    float blobRadius = 0.3 * blobFactor;
    float blob1 = smoothstep(blobRadius + 0.2, 0.0, length(uv - blob1Pos + 0.1 * noiseVal1));
    float blob2 = smoothstep(blobRadius * 1.2 + 0.2, 0.0, length(uv - blob2Pos + 0.1 * noiseVal2));
    float blob3 = smoothstep(blobRadius * 1.4 + 0.2, 0.0, length(uv - blob3Pos + 0.1 * noiseVal3));
    
    // Mix colors based on blob presence
    vec3 color = uBgColor;
    color = mix(color, uColor1, blob1 * 0.6);
    color = mix(color, uColor2, blob2 * 0.6);
    color = mix(color, uColor3, blob3 * 0.6);
    
    // Add subtle gradient overlay
    vec3 gradientColor = mix(uBgColor, vec3(0.1, 0.04, 0.18), uv.x * 0.5 + uv.y * 0.5);
    color = mix(gradientColor, color, 0.7);
    
    // Add subtle pulsing glow
    float glow = 0.05 * sin(t * 2.0) * (blob1 + blob2 + blob3);
    color += glow;
    
    gl_FragColor = vec4(color, 1.0);
}
`;

function AuroraPlane({ speed, blobSize, color1, color2, color3, bg }) {
    const meshRef = useRef();
    const { viewport } = useThree();

    const [uniforms] = useState(() => ({
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uBlobSize: { value: blobSize },
        uColor1: { value: new Color(...hexToNormalizedRGB(color1)) },
        uColor2: { value: new Color(...hexToNormalizedRGB(color2)) },
        uColor3: { value: new Color(...hexToNormalizedRGB(color3)) },
        uBgColor: { value: new Color(...hexToNormalizedRGB(bg)) }
    }));

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value += delta;
            meshRef.current.material.uniforms.uSpeed.value = 10 / speed; // Invert so higher = slower like CSS version
            meshRef.current.material.uniforms.uBlobSize.value = blobSize;
            meshRef.current.material.uniforms.uColor1.value.set(color1);
            meshRef.current.material.uniforms.uColor2.value.set(color2);
            meshRef.current.material.uniforms.uColor3.value.set(color3);
            meshRef.current.material.uniforms.uBgColor.value.set(bg);
        }
    });

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
            />
        </mesh>
    );
}

export default function Aurora({ bg = '#000000', color1 = '#ff00cc', color2 = '#3333ff', color3 = '#00ffcc', speed = 10, blobSize = 60 }) {
    return (
        <Canvas
            dpr={[1, 2]}
            frameloop="always"
            gl={{ preserveDrawingBuffer: true }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
            }}
        >
            <AuroraPlane
                speed={speed}
                blobSize={blobSize}
                color1={color1}
                color2={color2}
                color3={color3}
                bg={bg}
            />
        </Canvas>
    );
}
