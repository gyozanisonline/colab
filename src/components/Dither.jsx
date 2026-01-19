import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import * as THREE from 'three';

const DitherShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#ffffff') },
        uColor2: { value: new THREE.Color('#000000') },
        uPixelSize: { value: 10.0 },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uPixelSize;
    varying vec2 vUv;

    void main() {
      float dx = 1.0 / uPixelSize;
      float dy = 1.0 / uPixelSize;
      vec2 coord = vec2(dx * floor(vUv.x / dx), dy * floor(vUv.y / dy));
      
      float grad = coord.x + coord.y * 0.5 + sin(uTime * 0.5) * 0.5;
      
      // Bayer Matrix Dithering (2x2)
      int x = int(mod(gl_FragCoord.x, 2.0));
      int y = int(mod(gl_FragCoord.y, 2.0));
      float threshold = 0.0;
      if (x == 0 && y == 0) threshold = 0.25;
      else if (x == 1 && y == 0) threshold = 0.75;
      else if (x == 0 && y == 1) threshold = 1.00; // Adjusted for visual balance
      else if (x == 1 && y == 1) threshold = 0.50;
      
      vec3 finalColor = grad > threshold ? uColor1 : uColor2;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

function DitherPlane({ color1, color2, pixelSize }) {
    const mesh = useRef();

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.material.uniforms.uTime.value += delta;
            mesh.current.material.uniforms.uColor1.value.set(color1);
            mesh.current.material.uniforms.uColor2.value.set(color2);
            mesh.current.material.uniforms.uPixelSize.value = pixelSize;
        }
    });

    return (
        <mesh ref={mesh} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial args={[DitherShader]} />
        </mesh>
    );
}

export default function Dither({ color1 = '#ffffff', color2 = '#000000', pixelSize = 64.0 }) {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <Canvas>
                <DitherPlane color1={color1} color2={color2} pixelSize={pixelSize} />
            </Canvas>
        </div>
    );
}
