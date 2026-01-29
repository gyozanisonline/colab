import { forwardRef, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Color } from 'three';

const hexToNormalizedRGB = (hex) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return [r, g, b];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

const SilkPlane = forwardRef(function SilkPlane({ speed, scale, color, noiseIntensity, rotation }, ref) {
    const { viewport } = useThree();

    // Uniforms ref to avoid re-creating object every frame
    const uniforms = useMemo(
        () => ({
            uSpeed: { value: speed },
            uScale: { value: scale },
            uNoiseIntensity: { value: noiseIntensity },
            uColor: { value: new Color(...hexToNormalizedRGB(color)) },
            uRotation: { value: rotation },
            uTime: { value: 0 }
        }),
        [] // Initial setup only
    );

    useFrame((state, delta) => {
        // ref might be attached to the mesh, but we need to access material
        // We can use a local ref for the material if needed, or assume the forwarded ref is the mesh
        if (ref.current) {
            ref.current.material.uniforms.uTime.value += 0.1 * delta;
            // Update uniforms from props
            ref.current.material.uniforms.uSpeed.value = speed;
            ref.current.material.uniforms.uScale.value = scale;
            ref.current.material.uniforms.uNoiseIntensity.value = noiseIntensity;
            ref.current.material.uniforms.uColor.value.set(color);
            ref.current.material.uniforms.uRotation.value = rotation;
        }
    });

    return (
        <mesh ref={ref} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
            />
        </mesh>
    );
});

const Silk = (props) => {
    const meshRef = useRef(null);

    return (
        <Canvas dpr={[1, 2]} frameloop="always" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <SilkPlane ref={meshRef} {...props} />
        </Canvas>
    );
};

export default Silk;
