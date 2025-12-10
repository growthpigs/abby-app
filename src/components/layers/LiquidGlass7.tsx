/**
 * LiquidGlass7 - WAVE SHELL ORB
 *
 * The contained orb (G2) with waves crashing over it,
 * like shells of water closing around the sphere.
 * Charcoal background for visibility.
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

const WAVE_SHELL_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  // SDF circle
  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  // Smooth minimum - blob merging
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  // Blob position - internal motion
  vec2 blobPos(float seed, float t) {
    return vec2(
      sin(t * 0.7 + seed * 6.28) * 0.25,
      cos(t * 0.9 + seed * 4.17) * 0.25
    );
  }

  // Wave shell SDF - creates crashing wave shape
  float sdWaveShell(vec2 p, float radius, float thickness, float waveAmp, float waveFreq, float phase) {
    float angle = atan(p.y, p.x);
    float dist = length(p);

    // Wave modulation on the shell
    float wave = sin(angle * waveFreq + phase) * waveAmp;
    float wave2 = sin(angle * (waveFreq * 1.5) - phase * 0.7) * waveAmp * 0.5;

    // Shell shape - arc/crescent
    float shellDist = abs(dist - radius - wave - wave2) - thickness;

    // Only show part of the shell (crashing wave effect)
    float arcMask = smoothstep(-0.3, 0.3, sin(angle + phase * 0.3));

    return shellDist + (1.0 - arcMask) * 0.5;
  }

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);
    float t = time;

    // === CHARCOAL BACKGROUND ===
    vec3 bgColor = vec3(0.12, 0.12, 0.14);

    // === CORE ORB (from G2) ===
    float coreRadius = 0.45;
    coreRadius += sin(t * 0.8) * 0.02;

    // Internal blobs
    float d1 = sdCircle(uv - blobPos(0.0, t), 0.28);
    float d2 = sdCircle(uv - blobPos(0.33, t * 1.1), 0.22);
    float d3 = sdCircle(uv - blobPos(0.66, t * 0.9), 0.25);
    float d4 = sdCircle(uv - blobPos(0.15, t * 1.2), 0.2);

    float coreBlobs = d1;
    coreBlobs = smin(coreBlobs, d2, 0.4);
    coreBlobs = smin(coreBlobs, d3, 0.4);
    coreBlobs = smin(coreBlobs, d4, 0.4);

    // Core boundary
    float coreBoundary = sdCircle(uv, coreRadius);
    float core = smin(coreBlobs, coreBoundary, 0.25);

    // === WAVE SHELLS - crashing over the orb ===
    // Multiple shells at different phases, creating the "closing" effect

    // Shell 1 - large outer wave
    float shell1 = sdWaveShell(uv, 0.55, 0.08, 0.06, 3.0, t * 1.2);

    // Shell 2 - medium wave, different phase
    float shell2 = sdWaveShell(uv, 0.48, 0.06, 0.05, 4.0, -t * 1.5 + 2.0);

    // Shell 3 - inner wave
    float shell3 = sdWaveShell(uv, 0.52, 0.05, 0.04, 5.0, t * 0.9 + 4.0);

    // Shell 4 - thin fast shell
    float shell4 = sdWaveShell(uv, 0.58, 0.04, 0.07, 2.5, -t * 1.8 + 1.0);

    // Merge shells with each other
    float waves = shell1;
    waves = smin(waves, shell2, 0.15);
    waves = smin(waves, shell3, 0.15);
    waves = smin(waves, shell4, 0.15);

    // === COLORS ===
    // Core colors - warm oranges/pinks
    vec3 coreColor1 = vec3(1.0, 0.5, 0.3);   // Orange
    vec3 coreColor2 = vec3(0.9, 0.3, 0.5);   // Pink
    vec3 coreColor3 = vec3(1.0, 0.7, 0.4);   // Gold

    // Wave colors - cooler blues/teals
    vec3 waveColor1 = vec3(0.2, 0.6, 0.9);   // Blue
    vec3 waveColor2 = vec3(0.3, 0.8, 0.8);   // Cyan
    vec3 waveColor3 = vec3(0.4, 0.5, 0.9);   // Violet-blue

    // Color mixing based on position and time
    float colorMix = sin(atan(uv.y, uv.x) * 2.0 + t) * 0.5 + 0.5;
    float colorMix2 = sin(length(uv) * 6.0 - t * 2.0) * 0.5 + 0.5;
    float colorMix3 = cos(atan(uv.y, uv.x) * 3.0 - t * 0.5) * 0.5 + 0.5;

    vec3 coreColor = mix(coreColor1, coreColor2, colorMix);
    coreColor = mix(coreColor, coreColor3, colorMix2 * 0.4);

    vec3 waveColor = mix(waveColor1, waveColor2, colorMix3);
    waveColor = mix(waveColor, waveColor3, colorMix * 0.5);

    // === RENDERING ===
    vec3 color = bgColor;

    // Core orb
    float coreEdge = smoothstep(0.02, -0.02, core);
    float coreGlow = smoothstep(0.2, -0.15, core);
    float coreInner = smoothstep(-0.2, 0.0, core);

    color = mix(color, coreColor * 0.25, coreGlow);
    color = mix(color, coreColor, coreEdge);
    color += coreColor * (1.0 - coreInner) * 0.2;

    // Wave shells - render on top with transparency
    float waveEdge = smoothstep(0.015, -0.015, waves);
    float waveGlow = smoothstep(0.12, -0.08, waves);
    float waveInner = smoothstep(-0.15, 0.0, waves);

    // Waves have transparency - we can see the orb through them
    color = mix(color, waveColor * 0.2, waveGlow * 0.6);
    color = mix(color, waveColor * 0.9, waveEdge * 0.7);

    // Interaction glow where waves meet orb
    float interaction = smoothstep(0.1, -0.05, core) * smoothstep(0.15, -0.1, waves);
    color += vec3(0.8, 0.9, 1.0) * interaction * 0.4;

    // Highlights
    float coreHighlight = pow(max(0.0, 1.0 - coreInner), 3.0) * 0.4;
    float waveHighlight = pow(max(0.0, 1.0 - waveInner), 4.0) * 0.3;
    color += vec3(coreHighlight * 0.9, coreHighlight * 0.7, coreHighlight * 0.5);
    color += vec3(waveHighlight * 0.5, waveHighlight * 0.7, waveHighlight * 0.9);

    // Subtle outer glow
    float outerGlowAmt = exp(-length(uv) * 2.5) * 0.15;
    color += mix(coreColor, waveColor, 0.5) * outerGlowAmt;

    // Alpha based on core + waves
    float alpha = max(coreEdge, waveEdge * 0.7);
    alpha = max(alpha, max(coreGlow, waveGlow) * 0.5);

    return vec4(color, alpha);
  }
`);

export const LiquidGlass7: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: clock.value / 1000,
  }), [clock]);

  if (!WAVE_SHELL_SHADER) {
    console.error('[LiquidGlass7] Shader failed to compile');
    return null;
  }

  return (
    <Canvas style={styles.canvas} mode="continuous">
      <Fill>
        <Shader source={WAVE_SHELL_SHADER} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default LiquidGlass7;
