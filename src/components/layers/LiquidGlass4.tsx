/**
 * LiquidGlass4 - Noisy Organic Edges
 *
 * Blobs with wavy, breathing edges using noise distortion.
 * Creates a more biological, cellular feel - like living organisms.
 */

import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

const LIQUID_GLASS_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  // Simple hash for pseudo-random
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal brownian motion - layered noise
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

  // SDF circle with noisy edge
  float sdCircleNoisy(vec2 p, float r, float noiseScale, float noiseAmount, float t) {
    float angle = atan(p.y, p.x);
    float n = fbm(vec2(angle * noiseScale, t * 0.5)) * noiseAmount;
    return length(p) - r - n;
  }

  // Smooth minimum
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  vec2 blobPos(float seed, float t) {
    return vec2(
      sin(t * 0.5 + seed * 6.28) * 0.25,
      cos(t * 0.6 + seed * 4.17) * 0.25
    );
  }

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);
    float t = time;

    // Blobs with noisy edges - each has different noise characteristics
    float d1 = sdCircleNoisy(uv - blobPos(0.0, t), 0.30, 3.0, 0.08, t);
    float d2 = sdCircleNoisy(uv - blobPos(0.33, t * 0.9), 0.25, 4.0, 0.06, t * 1.3);
    float d3 = sdCircleNoisy(uv - blobPos(0.66, t * 1.1), 0.28, 2.5, 0.10, t * 0.8);
    float d4 = sdCircleNoisy(uv - blobPos(0.5, t * 0.7), 0.22, 5.0, 0.05, t * 1.5);

    // Merge with high smoothness for organic feel
    float d = d1;
    d = smin(d, d2, 0.6);
    d = smin(d, d3, 0.6);
    d = smin(d, d4, 0.6);

    // Breathing effect - whole shape pulses
    d += sin(t * 1.2) * 0.02;

    // Colors - bioluminescent greens and teals
    vec3 bgColor = vec3(0.01, 0.03, 0.05);
    vec3 color1 = vec3(0.1, 0.8, 0.6);   // Teal
    vec3 color2 = vec3(0.3, 0.9, 0.4);   // Green
    vec3 color3 = vec3(0.0, 0.5, 0.7);   // Deep teal

    // Color varies with noise
    float colorNoise = fbm(uv * 3.0 + t * 0.3);
    float colorMix = sin(atan(uv.y, uv.x) * 3.0 + t) * 0.5 + 0.5;

    vec3 blobColor = mix(color1, color2, colorMix);
    blobColor = mix(blobColor, color3, colorNoise * 0.5);

    // Edge and glow
    float edge = smoothstep(0.02, -0.02, d);
    float glow = smoothstep(0.2, -0.15, d);
    float inner = smoothstep(-0.25, 0.0, d);

    // Combine
    vec3 color = bgColor;
    color = mix(color, blobColor * 0.25, glow);
    color = mix(color, blobColor, edge);
    color += blobColor * (1.0 - inner) * 0.35;

    // Highlight with noise variation
    float highlight = pow(max(0.0, 1.0 - inner), 3.0) * 0.4;
    highlight *= (0.8 + colorNoise * 0.4);
    color += vec3(highlight);

    return vec4(color, 1.0);
  }
`);

export const LiquidGlass4: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: clock.value / 1000,
  }), [clock]);

  if (!LIQUID_GLASS_SHADER) {
    console.error('[LiquidGlass4] Shader failed to compile');
    return null;
  }

  return (
    <Canvas style={styles.canvas} mode="continuous">
      <Fill>
        <Shader source={LIQUID_GLASS_SHADER} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default LiquidGlass4;
