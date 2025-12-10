/**
 * LiquidGlass5 - Layered Depth with Parallax
 *
 * Multiple layers of blobs at different "depths" moving at different speeds.
 * Creates a 3D-like depth effect without actual 3D rendering.
 * Background blobs are larger, blurrier, slower. Foreground blobs are sharp and fast.
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

  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);
    float t = time;

    vec3 bgColor = vec3(0.02, 0.01, 0.04);
    vec3 finalColor = bgColor;

    // === LAYER 0: FAR BACKGROUND (depth = 1.0) ===
    // Large, slow, blurry, dim
    float depth0 = 1.0;
    float speed0 = 0.2;
    float blur0 = 0.12;

    vec2 pos0a = vec2(sin(t * speed0) * 0.4, cos(t * speed0 * 0.8) * 0.3);
    vec2 pos0b = vec2(cos(t * speed0 * 0.7) * 0.35, sin(t * speed0 * 1.1) * 0.35);

    float d0 = sdCircle(uv - pos0a, 0.45);
    d0 = smin(d0, sdCircle(uv - pos0b, 0.40), 0.5);

    float edge0 = smoothstep(blur0, -blur0, d0);
    vec3 color0 = vec3(0.3, 0.2, 0.5) * 0.4; // Dim purple
    finalColor = mix(finalColor, color0, edge0 * 0.5);

    // === LAYER 1: MID-BACKGROUND (depth = 0.7) ===
    float speed1 = 0.4;
    float blur1 = 0.08;

    vec2 pos1a = vec2(sin(t * speed1 + 1.0) * 0.3, cos(t * speed1 * 0.9 + 2.0) * 0.25);
    vec2 pos1b = vec2(cos(t * speed1 * 1.2 + 3.0) * 0.28, sin(t * speed1 + 1.5) * 0.3);
    vec2 pos1c = vec2(sin(t * speed1 * 0.8 + 4.0) * 0.25, cos(t * speed1 * 1.1 + 0.5) * 0.28);

    float d1 = sdCircle(uv - pos1a, 0.30);
    d1 = smin(d1, sdCircle(uv - pos1b, 0.25), 0.4);
    d1 = smin(d1, sdCircle(uv - pos1c, 0.22), 0.4);

    float edge1 = smoothstep(blur1, -blur1, d1);
    float glow1 = smoothstep(0.15, -0.1, d1);
    vec3 color1 = vec3(0.5, 0.3, 0.7); // Medium purple/magenta
    finalColor = mix(finalColor, color1 * 0.3, glow1 * 0.4);
    finalColor = mix(finalColor, color1 * 0.7, edge1 * 0.7);

    // === LAYER 2: MID-FOREGROUND (depth = 0.4) ===
    float speed2 = 0.7;
    float blur2 = 0.04;

    vec2 pos2a = vec2(sin(t * speed2 + 2.5) * 0.22, cos(t * speed2 * 1.1 + 1.0) * 0.2);
    vec2 pos2b = vec2(cos(t * speed2 * 0.9 + 0.5) * 0.2, sin(t * speed2 * 1.2 + 3.5) * 0.22);

    float d2 = sdCircle(uv - pos2a, 0.20);
    d2 = smin(d2, sdCircle(uv - pos2b, 0.18), 0.35);

    float edge2 = smoothstep(blur2, -blur2, d2);
    float glow2 = smoothstep(0.1, -0.08, d2);
    vec3 color2 = vec3(0.8, 0.4, 0.6); // Brighter pink
    finalColor = mix(finalColor, color2 * 0.3, glow2 * 0.5);
    finalColor = mix(finalColor, color2, edge2 * 0.85);

    // === LAYER 3: FOREGROUND (depth = 0.0) ===
    // Small, fast, sharp, bright
    float speed3 = 1.0;
    float blur3 = 0.02;

    vec2 pos3a = vec2(sin(t * speed3 + 4.0) * 0.15, cos(t * speed3 * 1.3 + 2.0) * 0.15);
    vec2 pos3b = vec2(cos(t * speed3 * 1.1 + 1.0) * 0.12, sin(t * speed3 * 0.9 + 5.0) * 0.14);
    vec2 pos3c = vec2(sin(t * speed3 * 1.4 + 3.0) * 0.1, cos(t * speed3 + 0.5) * 0.12);

    float d3 = sdCircle(uv - pos3a, 0.14);
    d3 = smin(d3, sdCircle(uv - pos3b, 0.12), 0.3);
    d3 = smin(d3, sdCircle(uv - pos3c, 0.10), 0.3);

    float edge3 = smoothstep(blur3, -blur3, d3);
    float glow3 = smoothstep(0.08, -0.06, d3);
    float inner3 = smoothstep(-0.15, 0.0, d3);

    vec3 color3 = vec3(1.0, 0.6, 0.8); // Bright pink/white
    finalColor = mix(finalColor, color3 * 0.4, glow3 * 0.6);
    finalColor = mix(finalColor, color3, edge3);

    // Bright highlight on foreground
    float highlight = pow(max(0.0, 1.0 - inner3), 3.0) * 0.6;
    finalColor += vec3(highlight);

    // Subtle overall color shift based on time
    finalColor *= 1.0 + sin(t * 0.3) * 0.05;

    // Alpha based on layers
    float alpha = max(max(edge0 * 0.5, edge1 * 0.7), max(edge2 * 0.85, edge3));
    alpha = max(alpha, glow3 * 0.5);

    return vec4(finalColor, alpha);
  }
`);

export const LiquidGlass5: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: clock.value / 1000,
  }), [clock]);

  if (!LIQUID_GLASS_SHADER) {
    console.error('[LiquidGlass5] Shader failed to compile');
    return null;
  }

  return (
    <Canvas style={styles.canvas}>
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

export default LiquidGlass5;
