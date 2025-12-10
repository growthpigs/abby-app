/**
 * LiquidGlass3 - Central Core with Orbiting Satellites
 *
 * One large pulsing blob in the center with smaller blobs orbiting around it.
 * Creates a solar system / atom feel with clear focal point.
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

    // === CENTRAL CORE - pulsing ===
    float coreRadius = 0.25 + sin(t * 1.5) * 0.05;
    float core = sdCircle(uv, coreRadius);

    // === ORBITING SATELLITES ===
    float orbitRadius = 0.45;

    // 4 satellites at different speeds and phases
    vec2 sat1Pos = vec2(cos(t * 0.8), sin(t * 0.8)) * orbitRadius;
    vec2 sat2Pos = vec2(cos(t * 0.6 + 1.57), sin(t * 0.6 + 1.57)) * orbitRadius * 1.1;
    vec2 sat3Pos = vec2(cos(t * 1.0 + 3.14), sin(t * 1.0 + 3.14)) * orbitRadius * 0.9;
    vec2 sat4Pos = vec2(cos(t * 0.7 + 4.71), sin(t * 0.7 + 4.71)) * orbitRadius * 1.05;

    float sat1 = sdCircle(uv - sat1Pos, 0.12);
    float sat2 = sdCircle(uv - sat2Pos, 0.10);
    float sat3 = sdCircle(uv - sat3Pos, 0.08);
    float sat4 = sdCircle(uv - sat4Pos, 0.09);

    // Merge core with satellites using smin
    float d = core;
    d = smin(d, sat1, 0.4);
    d = smin(d, sat2, 0.4);
    d = smin(d, sat3, 0.4);
    d = smin(d, sat4, 0.4);

    // Colors - warm core, cool satellites
    vec3 bgColor = vec3(0.02, 0.01, 0.05);
    vec3 coreColor = vec3(1.0, 0.5, 0.2);    // Orange/gold
    vec3 satColor = vec3(0.2, 0.6, 1.0);     // Blue
    vec3 mixColor = vec3(0.8, 0.3, 0.9);     // Purple blend

    // Color based on distance from center
    float distFromCenter = length(uv);
    float colorMix = smoothstep(0.1, 0.5, distFromCenter);

    vec3 blobColor = mix(coreColor, satColor, colorMix);
    blobColor = mix(blobColor, mixColor, sin(atan(uv.y, uv.x) * 3.0 + t) * 0.3 + 0.3);

    float edge = smoothstep(0.02, -0.02, d);
    float glow = smoothstep(0.2, -0.15, d);
    float inner = smoothstep(-0.3, 0.0, d);

    vec3 color = blobColor;
    color += blobColor * (1.0 - inner) * 0.3;

    // Core highlight - extra bright center
    float coreGlow = smoothstep(0.3, 0.0, length(uv)) * 0.4;
    color += coreColor * coreGlow;

    float highlight = pow(max(0.0, 1.0 - inner), 3.0) * 0.5;
    color += vec3(highlight);

    // Alpha based on edge + glow
    float alpha = edge + glow * 0.4;

    return vec4(color, alpha);
  }
`);

export const LiquidGlass3: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: clock.value / 1000,
  }), [clock]);

  if (!LIQUID_GLASS_SHADER) {
    console.error('[LiquidGlass3] Shader failed to compile');
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

export default LiquidGlass3;
