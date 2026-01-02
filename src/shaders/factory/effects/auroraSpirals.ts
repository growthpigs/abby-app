/**
 * Aurora Spirals Effect - Polar coordinate spirals with neon colors
 *
 * Hot pink, electric blue, cyan, purple aurora bands
 */

import type { EffectDefinition } from './index';

export const AURORA_SPIRALS_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// POLAR SPIRAL DISTORTION
// ============================================

float2 polarSpiral(float2 uv, float2 center, float time) {
  float2 delta = uv - center;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x);

  float spiral = angle + dist * 3.0 - time * 0.8;
  float wave1 = sin(spiral * 4.0 + time) * 0.15;
  float wave2 = sin(dist * 8.0 - time * 1.2) * 0.1;

  float newDist = dist + wave1 + wave2;
  float newAngle = angle + sin(dist * 5.0 + time * 0.5) * 0.3;

  return center + float2(cos(newAngle), sin(newAngle)) * newDist;
}

// ============================================
// AURORA BANDS
// ============================================

float auroraBands(float2 uv, float time) {
  float bands = 0.0;
  bands += sin(uv.y * 6.0 + uv.x * 2.0 + time * 0.8) * 0.5 + 0.5;
  bands += sin(uv.y * 4.0 - uv.x * 3.0 + time * 0.6) * 0.3;
  bands += sin(uv.x * 5.0 + uv.y * 1.5 + time * 1.1) * 0.2;
  return bands;
}
`,

  main: `
  float octaves = 1.0 + u_complexity * 4.0;
  float2 center = float2(0.5 * aspect, 0.5);

  // Apply polar spiral distortion
  float2 spiralUV = polarSpiral(uv, center, time);

  // Add noise displacement
  float noiseDisp = snoise(spiralUV * 2.0 + time * 0.3);
  spiralUV += float2(noiseDisp * 0.1, noiseDisp * 0.08);

  // Aurora bands pattern
  float bands = auroraBands(spiralUV, time);

  float n1 = fbm(spiralUV * 2.0, octaves);
  float n2 = fbm(spiralUV * 3.0 + time * 0.5, octaves * 0.6);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  float distFromCenter = length(uv - center);

  // Mix neon colors
  half3 color = mix(half3(COLOR_PINK), half3(COLOR_BLUE), half(n1));
  color = mix(color, half3(COLOR_CYAN), half(bands * 0.5));
  color = mix(color, half3(COLOR_PURPLE), half(n2 * 0.4));

  // Glow at band peaks
  float glow = pow(bands, 2.0) * 0.3;
  color += half3(glow * 0.5, glow * 0.8, glow);

  color = pow(color, half3(0.95));

  // Radial darkening at edges
  float radialFade = 1.0 - smoothstep(0.3, 0.8, distFromCenter);
  color *= half(0.7 + 0.3 * radialFade);
`,
};
