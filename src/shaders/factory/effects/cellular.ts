/**
 * Cellular Effect - Organic cellular patterns (aerial reef)
 *
 * Turquoise ocean view from above with coral reef textures
 */

import type { EffectDefinition } from './index';

export const CELLULAR_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// REEF PATTERN
// ============================================

float reefPattern(float2 uv, float time) {
  float2 p = uv * 8.0;

  float n1 = fbm(p + time * 0.1, 4);
  float n2 = fbm(p * 1.5 + float2(100.0, 0.0) - time * 0.08, 3);
  float n3 = fbm(p * 0.5 + time * 0.05, 5);

  float coral = smoothstep(0.4, 0.6, n1 * n2);
  coral *= smoothstep(0.3, 0.7, n3);

  return coral;
}

// ============================================
// WATER CAUSTICS
// ============================================

float caustics(float2 uv, float time) {
  float2 p = uv * 12.0;

  float c1 = sin(p.x * 3.0 + time + noise(p) * 2.0);
  float c2 = sin(p.y * 3.0 - time * 0.7 + noise(p + 50.0) * 2.0);
  float c3 = sin((p.x + p.y) * 2.0 + time * 0.5);

  return (c1 * c2 * c3) * 0.5 + 0.5;
}
`,

  main: `
  float complexity = mix(0.6, 1.4, u_complexity);

  // Slow drift
  float2 driftUV = uv + float2(sin(time * 0.1) * 0.1, cos(time * 0.08) * 0.1);

  // Base water with depth variation
  float depth = fbm(driftUV * 3.0 + time * 0.05, 4);
  float3 waterColor = mix(float3(TURQUOISE), float3(CYAN), depth);
  waterColor = mix(waterColor, float3(TEAL_DEEP), smoothstep(0.4, 0.7, depth));

  // Reef patterns
  float reef = reefPattern(driftUV, time);
  waterColor = mix(waterColor, float3(REEF_DARK), reef * 0.7 * complexity);

  // Dark reef clusters
  float clusters = fbm(uv * 15.0 + time * 0.02, 3);
  float darkSpots = smoothstep(0.55, 0.7, clusters);
  waterColor = mix(waterColor, float3(REEF_DARK) * 0.8, darkSpots * 0.5);

  // Water caustics
  float caust = caustics(driftUV, time);
  waterColor += float3(0.1, 0.15, 0.12) * caust * 0.15;

  // Bright shallow areas
  float shallow = fbm(uv * 4.0 - time * 0.03, 3);
  shallow = smoothstep(0.5, 0.8, shallow);
  waterColor = mix(waterColor, float3(TURQUOISE), shallow * 0.25);

  // Subtle foam
  float foam = fbm(uv * 20.0 + time * 0.1, 2);
  foam = smoothstep(0.6, 0.9, foam);
  waterColor += float3(0.15, 0.2, 0.18) * foam * 0.15;

  half3 color = half3(waterColor);
  color = pow(color, half3(0.95));
`,
};
