import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import * as THREE from 'three';

const ColorBendsShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#ff0000') },
        uColor2: { value: new THREE.Color('#0000ff') },
        uColor3: { value: new THREE.Color('#00ff00') },
        uSpeed: { value: 0.5 },
        uComplexity: { value: 3.0 },
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
    uniform float uSpeed;
    uniform float uComplexity;
    varying vec2 vUv;

    // Simplex noise function
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float noise = snoise(vUv * uComplexity + uTime * uSpeed);
      vec3 color = mix(uColor1, uColor2, vUv.x + noise * 0.2);
      color = mix(color, uColor3, vUv.y + noise * 0.2);
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

function GradientPlane() {
    const mesh = useRef();

    // Leva controls
    const { color1, color2, color3, speed, complexity } = useControls('Color Bends', {
        color1: '#ff0055',
        color2: '#0055ff',
        color3: '#55ff00',
        speed: { value: 0.2, min: 0.0, max: 2.0 },
        complexity: { value: 3.0, min: 1.0, max: 10.0 }
    });

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.material.uniforms.uTime.value += delta;
            mesh.current.material.uniforms.uColor1.value.set(color1);
            mesh.current.material.uniforms.uColor2.value.set(color2);
            mesh.current.material.uniforms.uColor3.value.set(color3);
            mesh.current.material.uniforms.uSpeed.value = speed;
            mesh.current.material.uniforms.uComplexity.value = complexity;
        }
    });

    return (
        <mesh ref={mesh} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial args={[ColorBendsShader]} />
        </mesh>
    );
}

export default function ColorBends() {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <Canvas>
                <GradientPlane />
            </Canvas>
        </div>
    );
}
