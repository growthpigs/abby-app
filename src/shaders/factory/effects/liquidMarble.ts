/**
 * Liquid Marble Effect - Flowing marble with organic veins
 *
 * Deep navy with gold, cream, and rose accents
 */

import type { EffectDefinition } from './index';

export const LIQUID_MARBLE_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// MARBLE VEIN FUNCTION
// ============================================
// Note: Uses shared turbulence() from noise.ts (injected by factory)

float marbleVein(float2 uv, float time, float octaves) {
  float angle = time * 0.1;
  float c = cos(angle);
  float s = sin(angle);
  float2 rotUV = float2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

  float basePattern = sin(rotUV.x * 3.0 + rotUV.y * 2.0 + time * 0.5);
  float turb = turbulence(uv * 2.0 + time * 0.1, octaves);
  float vein = sin(basePattern * 3.14159 + turb * 4.0);
  vein = abs(vein);
  vein = pow(vein, 0.5);

  return vein;
}

float2 flowDistort(float2 uv, float time) {
  float2 result = uv;
  result.x += sin(uv.y * 2.0 + time * 0.3) * 0.1;
  result.y += cos(uv.x * 2.0 + time * 0.25) * 0.08;
  float n = snoise(uv * 1.5 + time * 0.2);
  result += float2(n * 0.05, n * 0.04);
  return result;
}
`,

  main: `
  float octaves = 2.0 + u_complexity * 3.0;

  // Apply flowing distortion
  float2 flowUV = flowDistort(uv, time);

  // Get marble vein patterns
  float vein1 = marbleVein(flowUV * 1.5, time, octaves);
  float vein2 = marbleVein(flowUV * 2.5 + 10.0, time * 0.8, octaves * 0.7);
  float vein3 = marbleVein(flowUV * 0.8 - 5.0, time * 1.2, octaves * 0.5);

  float veins = vein1 * 0.5 + vein2 * 0.3 + vein3 * 0.2;

  float n1 = fbm(flowUV * 3.0 + time * 0.3, octaves);
  float n2 = fbm(flowUV * 2.0 - time * 0.2, octaves * 0.6);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  // Base color - deep navy
  half3 color = half3(COLOR_NAVY);

  // Add cream in vein areas
  color = mix(color, half3(COLOR_CREAM), half(veins * 0.6));

  // Gold highlights
  float goldMask = smoothstep(0.4, 0.6, n1) * smoothstep(0.3, 0.7, veins);
  color = mix(color, half3(COLOR_GOLD), half(goldMask * 0.5));

  // Rose tint
  float roseMask = smoothstep(0.5, 0.8, n2) * (1.0 - veins * 0.5);
  color = mix(color, half3(COLOR_ROSE), half(roseMask * 0.3));

  // Depth
  float depth = 1.0 - veins * 0.3;
  color *= half(depth);

  // Shimmer
  float shimmer = sin(flowUV.x * 20.0 + time * 3.0) * sin(flowUV.y * 20.0 - time * 2.5);
  shimmer = shimmer * 0.5 + 0.5;
  shimmer = pow(shimmer, 4.0);
  color += half3(COLOR_GOLD) * half(shimmer * goldMask * 0.15);

  color = pow(color, half3(0.98));
`,
};
