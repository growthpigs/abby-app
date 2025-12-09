/**
 * LiquidGlass6 - Swirling Waves with Hot Kernel
 *
 * Multiple soft waves/petals spiraling inward like a nautilus or rose.
 * Each wave: blue/purple outer → pink middle → fades toward center.
 * Bright yellow/orange kernel glowing at the core.
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

  const float PI = 3.14159265359;

  // Soft noise for organic variation
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

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);

    float t = time * 0.3;

    // Light background
    vec3 bgColor = vec3(0.96, 0.96, 0.98);
    vec3 color = bgColor;

    // Polar coordinates
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);

    // === THE HOT KERNEL (center) ===
    vec3 kernelColor = vec3(1.0, 0.85, 0.4); // Warm yellow
    vec3 kernelCore = vec3(1.0, 1.0, 0.95);  // Almost white hot center
    float kernelSize = 0.15;
    float kernel = smoothstep(kernelSize + 0.1, kernelSize - 0.05, dist);
    float kernelInner = smoothstep(0.08, 0.0, dist);
    vec3 kernelFinal = mix(kernelColor, kernelCore, kernelInner);

    // === SWIRLING WAVE LAYERS ===
    // Each wave is a soft petal that spirals around the center

    float totalAlpha = 0.0;
    vec3 waveColor = vec3(0.0);

    // 4 wave layers at different phases
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float phase = fi * PI * 0.5; // 90 degrees apart
      float speed = 0.4 + fi * 0.1;

      // Spiral angle - waves curl inward
      float spiralAngle = angle + dist * 2.5 - t * speed + phase;

      // Wave shape using sin - creates the curling ribbon effect
      float wave = sin(spiralAngle * 2.0 + fi) * 0.5 + 0.5;

      // Add noise for organic edges
      float n = noise(vec2(angle * 3.0 + fi, dist * 5.0 + t)) * 0.3;
      wave += n;

      // Soft falloff from center outward
      float radialFade = smoothstep(0.8, 0.2, dist);

      // Wave visibility - only show wave "peaks"
      float waveAlpha = smoothstep(0.3, 0.7, wave) * radialFade;

      // Don't show waves in the kernel area
      waveAlpha *= smoothstep(0.12, 0.25, dist);

      // Color gradient for this wave: blue/purple outer → pink inner
      vec3 outerColor = vec3(0.55, 0.45, 0.95); // Purple/blue
      vec3 midColor = vec3(0.95, 0.5, 0.7);     // Pink
      vec3 innerColor = vec3(1.0, 0.75, 0.6);   // Peachy/orange toward center

      // Vary colors slightly per wave
      outerColor = mix(outerColor, vec3(0.4, 0.6, 0.95), fi * 0.2); // More blue/cyan

      float colorDist = smoothstep(0.15, 0.6, dist);
      vec3 thisWaveColor = mix(innerColor, midColor, colorDist);
      thisWaveColor = mix(thisWaveColor, outerColor, smoothstep(0.4, 0.75, dist));

      // Accumulate waves with transparency
      waveColor = mix(waveColor, thisWaveColor, waveAlpha * 0.6);
      totalAlpha = max(totalAlpha, waveAlpha);
    }

    // Combine: background → waves → kernel
    color = mix(bgColor, waveColor, totalAlpha * 0.85);
    color = mix(color, kernelFinal, kernel);

    // Add soft glow around kernel
    float glow = exp(-dist * 4.0) * 0.4;
    color += kernelColor * glow;

    // Subtle outer vignette to fade edges
    float vignette = smoothstep(1.0, 0.5, dist);
    color = mix(bgColor, color, vignette);

    return vec4(color, 1.0);
  }
`);

export const LiquidGlass6: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: clock.value / 1000,
  }), [clock]);

  if (!LIQUID_GLASS_SHADER) {
    console.error('[LiquidGlass6] Shader failed to compile');
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

export default LiquidGlass6;
