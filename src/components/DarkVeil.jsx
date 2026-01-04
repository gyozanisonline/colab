import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import * as THREE from 'three';

const DarkVeilShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#000000') },
        uVeilColor: { value: new THREE.Color('#333333') },
        uDensity: { value: 1.0 },
        uSpeed: { value: 0.2 },
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
    uniform vec3 uColor;
    uniform vec3 uVeilColor;
    uniform float uDensity;
    uniform float uSpeed;
    varying vec2 vUv;

    // Simplex Noise
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
        float noise = snoise(vUv * 3.0 + vec2(0.0, uTime * uSpeed * 0.5));
        float noise2 = snoise(vUv * 6.0 - vec2(uTime * uSpeed, 0.0));
        
        float intensity = (noise + noise2) * uDensity;
        
        vec3 finalColor = mix(uColor, uVeilColor, smoothstep(-0.2, 0.8, intensity));
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

function VeilPlane() {
    const mesh = useRef();
    const { baseColor, veilColor, density, speed } = useControls('Dark Veil', {
        baseColor: '#d500ff',
        veilColor: '#1a1a1a',
        density: { value: 1.0, min: 0.1, max: 3.0 },
        speed: { value: 0.2, min: 0.0, max: 2.0 }
    });

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.material.uniforms.uTime.value += delta;
            mesh.current.material.uniforms.uColor.value.set(baseColor);
            mesh.current.material.uniforms.uVeilColor.value.set(veilColor);
            mesh.current.material.uniforms.uDensity.value = density;
            mesh.current.material.uniforms.uSpeed.value = speed;
        }
    });

    return (
        <mesh ref={mesh} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial args={[DarkVeilShader]} />
        </mesh>
    );
}

export default function DarkVeil() {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <Canvas>
                <VeilPlane />
            </Canvas>
        </div>
    );
}
