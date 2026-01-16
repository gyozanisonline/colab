
import { forwardRef, useMemo, useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
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

const SilkPlane = forwardRef(function SilkPlane({ uniforms }, ref) {
    const { viewport } = useThree();

    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.scale.set(viewport.width, viewport.height, 1);
        }
    }, [ref, viewport]);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.material.uniforms.uTime.value += 0.1 * delta;
        }
    });

    return (
        <mesh ref={ref}>
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
        </mesh>
    );
});

const Silk = ({ speed: defaultSpeed = 5, scale: defaultScale = 1, color: defaultColor = '#7B7481', noiseIntensity: defaultNoise = 1.5, rotation: defaultRotation = 0 }) => {
    const meshRef = useRef(null);

    // Leva Controls
    const { speed, scale, color, noiseIntensity, rotation } = useControls('Silk', {
        speed: { value: defaultSpeed, min: 0.1, max: 20 },
        scale: { value: defaultScale, min: 0.1, max: 5 },
        color: { value: defaultColor },
        noiseIntensity: { value: defaultNoise, min: 0, max: 5 },
        rotation: { value: defaultRotation, min: 0, max: 6.28 }
    });

    const uniforms = useMemo(
        () => ({
            uSpeed: { value: speed },
            uScale: { value: scale },
            uNoiseIntensity: { value: noiseIntensity },
            uColor: { value: new Color(...hexToNormalizedRGB(color)) },
            uRotation: { value: rotation },
            uTime: { value: 0 }
        }),
        [speed, scale, noiseIntensity, color, rotation]
    );

    useFrame(() => {
        if (meshRef.current) {
            // Ensure uniforms update if memo changes ref (though R3F handles this usually, manual update is safer for uniforms)
            meshRef.current.material.uniforms.uSpeed.value = speed;
            meshRef.current.material.uniforms.uScale.value = scale;
            meshRef.current.material.uniforms.uNoiseIntensity.value = noiseIntensity;
            meshRef.current.material.uniforms.uColor.value.set(color);
            meshRef.current.material.uniforms.uRotation.value = rotation;
        }
    });

    return (
        <Canvas dpr={[1, 2]} frameloop="always" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <SilkPlane ref={meshRef} uniforms={uniforms} />
        </Canvas>
    );
};

export default Silk;
