/**
 * LiquidGlass6 - Tight Waves with Hard Edges
 *
 * Compact core with waves that have sharp outer edges and soft inner edges.
 * Waves curl and overlap like petals/shells crashing inward.
 * Tighter, more defined, more layers.
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

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  vec2 blobPos(float seed, float t) {
    return vec2(
      sin(t * 0.7 + seed * 6.28) * 0.3,
      cos(t * 0.9 + seed * 4.17) * 0.3
    );
  }

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);
    float t = time;

    // Dark charcoal background
    vec3 bgColor = vec3(0.06, 0.06, 0.08);
    vec3 color = bgColor;

    float dist = length(uv);
    float angle = atan(uv.y, uv.x);

    // === COMPACT INNER CORE ===
    float coreScale = 0.35; // Smaller, tighter
    float boundaryRadius = 0.18;
    boundaryRadius += sin(t * 0.8) * 0.01;

    float d1 = sdCircle(uv - blobPos(0.0, t) * coreScale * 0.5, 0.10);
    float d2 = sdCircle(uv - blobPos(0.33, t * 1.1) * coreScale * 0.5, 0.08);
    float d3 = sdCircle(uv - blobPos(0.66, t * 0.9) * coreScale * 0.5, 0.09);

    float coreBlobs = smin(d1, smin(d2, d3, 0.2), 0.2);
    float core = smin(coreBlobs, sdCircle(uv, boundaryRadius), 0.15);

    // Core colors - hot center
    vec3 coreYellow = vec3(1.0, 0.92, 0.6);
    vec3 coreOrange = vec3(1.0, 0.65, 0.4);
    vec3 corePink = vec3(1.0, 0.5, 0.55);

    float coreColorMix = sin(angle * 2.0 + t) * 0.5 + 0.5;
    vec3 coreCol = mix(coreYellow, coreOrange, smoothstep(0.0, 0.12, dist));
    coreCol = mix(coreCol, corePink, smoothstep(0.08, 0.2, dist));

    // === MULTIPLE WAVE LAYERS with HARD + SOFT edges ===
    vec3 waveAccum = vec3(0.0);
    float waveAlphaAccum = 0.0;

    // 8 waves for more density
    for (int i = 0; i < 8; i++) {
      float fi = float(i);

      // Each wave at different angle
      float wavePhase = fi * PI * 0.25 + t * (0.15 + fi * 0.03);

      // Wave center direction
      float waveDir = wavePhase;
      float angleFromWave = angle - waveDir;

      // Wrap angle
      angleFromWave = mod(angleFromWave + PI, 2.0 * PI) - PI;

      // Wave arc - how wide the petal/wave spans
      float arcWidth = 0.8 + sin(fi * 1.5) * 0.3; // Varies per wave

      // Petal shape - hard edge on outside, soft on inside curl
      float petalShape = 1.0 - abs(angleFromWave) / arcWidth;
      petalShape = clamp(petalShape, 0.0, 1.0);

      // Sharpen one side (the leading edge)
      float sharpEdge = smoothstep(-arcWidth, -arcWidth * 0.3, angleFromWave);
      float softEdge = smoothstep(arcWidth, arcWidth * 0.5, angleFromWave);
      petalShape *= sharpEdge * (1.0 - softEdge * 0.5);

      // Radial bounds - each wave at different distance, TIGHTER
      float innerR = 0.20 + fi * 0.04;
      float outerR = 0.28 + fi * 0.06;

      // Breathing
      innerR += sin(t * 0.4 + fi * 0.8) * 0.015;
      outerR += sin(t * 0.3 + fi * 0.5) * 0.02;

      // HARD outer edge, SOFT inner edge
      float radialMask = smoothstep(outerR + 0.01, outerR - 0.02, dist) * // Sharp outer
                         smoothstep(innerR - 0.06, innerR + 0.03, dist);   // Soft inner

      float waveAlpha = petalShape * radialMask;

      // Thin some waves, thicken others (use mod() instead of %)
      int imod3 = i - (i / 3) * 3;
      if (imod3 == 0) {
        waveAlpha *= 1.3; // Thicker
      } else if (imod3 == 1) {
        waveAlpha *= 0.7; // Thinner, more ethereal
      }

      // Wave colors
      vec3 waveOuter = vec3(0.4, 0.35, 0.85);  // Purple/indigo
      vec3 waveMid = vec3(0.65, 0.4, 0.8);     // Violet
      vec3 waveInner = vec3(0.9, 0.5, 0.65);   // Pink

      // Some waves more blue/cyan
      if (i == 2 || i == 5 || i == 7) {
        waveOuter = vec3(0.35, 0.55, 0.9);  // Blue
        waveMid = vec3(0.5, 0.7, 0.85);     // Cyan-ish
      }

      float colorT = smoothstep(outerR, innerR, dist);
      vec3 waveColor = mix(waveOuter, waveMid, colorT);
      waveColor = mix(waveColor, waveInner, colorT * colorT);

      // Accumulate
      waveAccum = mix(waveAccum, waveColor, waveAlpha * 0.65);
      waveAlphaAccum = max(waveAlphaAccum, waveAlpha);
    }

    // === COMBINE ===
    color = bgColor;

    // Waves
    color = mix(color, waveAccum, waveAlphaAccum * 0.9);

    // Soft glow around everything
    float outerGlow = exp(-dist * 3.0) * 0.2;
    color += waveAccum * outerGlow;

    // Core glow
    float coreGlow = smoothstep(0.12, -0.05, core);
    color = mix(color, coreCol * 0.5, coreGlow * 0.7);

    // Core solid
    float coreEdge = smoothstep(0.015, -0.015, core);
    color = mix(color, coreCol, coreEdge);

    // Hot white center
    float hotSpot = smoothstep(0.08, 0.0, dist);
    color = mix(color, vec3(1.0, 0.98, 0.9), hotSpot * 0.7);

    // === SPARKLE PARTICLES ===
    for (int i = 0; i < 20; i++) {
      float fi = float(i);
      float pAngle = hash(vec2(fi, 0.0)) * 2.0 * PI + t * 0.1 * (hash(vec2(fi, 1.0)) - 0.5);
      float pDist = 0.25 + hash(vec2(fi, 2.0)) * 0.4;
      vec2 pPos = vec2(cos(pAngle), sin(pAngle)) * pDist;

      float pSize = 0.003 + hash(vec2(fi, 3.0)) * 0.004;
      float p = smoothstep(pSize, 0.0, length(uv - pPos));

      // Twinkle
      float twinkle = sin(t * 3.0 + fi * 2.0) * 0.5 + 0.5;
      p *= twinkle;

      // Particle color
      vec3 pCol = mix(vec3(0.8, 0.7, 1.0), vec3(0.5, 0.8, 1.0), hash(vec2(fi, 4.0)));
      color += pCol * p * 0.8;
    }

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
