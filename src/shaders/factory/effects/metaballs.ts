/**
 * Metaballs Effect - Organic blob metaballs with smooth blending
 */

import type { EffectDefinition } from './index';

export const METABALLS_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// METABALL FUNCTION
// ============================================

float metaball(float2 uv, float2 center, float radius) {
  float dist = length(uv - center);
  return radius / (dist * dist + 0.01);
}

float metaballs(float2 uv, float time) {
  float total = 0.0;

  // Multiple drifting metaballs
  float2 c1 = float2(0.3 + sin(time * 0.3) * 0.2, 0.4 + cos(time * 0.4) * 0.2);
  float2 c2 = float2(0.7 + cos(time * 0.35) * 0.2, 0.5 + sin(time * 0.45) * 0.2);
  float2 c3 = float2(0.5 + sin(time * 0.5) * 0.15, 0.7 + cos(time * 0.3) * 0.15);
  float2 c4 = float2(0.4 + cos(time * 0.4) * 0.18, 0.3 + sin(time * 0.5) * 0.18);
  float2 c5 = float2(0.6 + sin(time * 0.25) * 0.22, 0.6 + cos(time * 0.35) * 0.22);

  total += metaball(uv, c1, 0.015);
  total += metaball(uv, c2, 0.012);
  total += metaball(uv, c3, 0.018);
  total += metaball(uv, c4, 0.01);
  total += metaball(uv, c5, 0.014);

  return total;
}
`,

  main: `
  float meta = metaballs(uv, time);

  // Threshold for blob edges
  float edge = smoothstep(0.8, 1.2, meta);
  float inner = smoothstep(1.2, 2.0, meta);

  // Base colors
  float3 bgColor = float3(0.05, 0.08, 0.15);
  float3 blobColor = float3(0.2, 0.5, 0.7);
  float3 coreColor = float3(0.4, 0.8, 0.9);

  float3 baseColor = bgColor;
  baseColor = mix(baseColor, blobColor, edge);
  baseColor = mix(baseColor, coreColor, inner);

  // Noise modulation
  float n = fbm(uv * 5.0 + time * 0.2, 3);
  n = n * 0.5 + 0.5;
  baseColor = mix(baseColor, baseColor * 1.2, n * edge * 0.3);

  // Glow around blobs
  float glow = smoothstep(0.5, 0.8, meta) * (1.0 - edge);
  baseColor += float3(0.1, 0.2, 0.3) * glow;

  // Inner shimmer
  float shimmer = sin(meta * 10.0 + time * 3.0) * 0.5 + 0.5;
  baseColor += float3(0.1, 0.15, 0.2) * shimmer * inner * 0.3;

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
