/**
 * Cellular Membrane Effect - Lagoon-inspired cellular membrane patterns
 */

import type { EffectDefinition } from './index';

export const CELLULAR_MEMBRANE_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// VORONOI CELLS
// ============================================

float2 voronoiCell(float2 p) {
  float2 n = floor(p);
  float2 f = fract(p);

  float2 closestPoint = float2(0.0);
  float minDist = 10.0;

  for (float j = -1.0; j <= 1.0; j += 1.0) {
    for (float i = -1.0; i <= 1.0; i += 1.0) {
      float2 neighbor = float2(i, j);
      float2 point = hash(n + neighbor) * float2(0.5) + 0.25 + neighbor;
      float dist = length(f - point);
      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
      }
    }
  }

  return float2(minDist, hash(closestPoint));
}

float membrane(float2 uv, float time) {
  float2 p = uv * 6.0 + time * 0.1;
  float2 cell = voronoiCell(p);

  float edge = smoothstep(0.0, 0.1, cell.x);
  float fill = smoothstep(0.1, 0.3, cell.x);

  return 1.0 - edge + fill * 0.3;
}
`,

  main: `
  // Animated UV
  float2 animUV = uv;
  animUV += float2(
    fbm(uv * 2.0 + time * 0.15, 2) * 0.05,
    fbm(uv * 2.0 + 50.0 - time * 0.1, 2) * 0.05
  );

  float cell = membrane(animUV, time);

  // Noise layers
  float n1 = fbm(uv * 4.0 + time * 0.1, 3);
  float n2 = fbm(uv * 8.0 - time * 0.15, 2);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  // Lagoon colors
  float3 deepColor = float3(0.03, 0.12, 0.18);
  float3 midColor = float3(0.1, 0.3, 0.38);
  float3 brightColor = float3(0.2, 0.5, 0.55);
  float3 membraneColor = float3(0.15, 0.4, 0.45);
  float3 highlightColor = float3(0.4, 0.65, 0.6);

  float3 baseColor = deepColor;
  baseColor = mix(baseColor, midColor, n1);
  baseColor = mix(baseColor, membraneColor, cell * 0.5);
  baseColor = mix(baseColor, brightColor, smoothstep(0.6, 0.9, cell) * n2);

  // Membrane edge highlight
  float edgeHighlight = smoothstep(0.4, 0.5, cell) * (1.0 - smoothstep(0.5, 0.6, cell));
  baseColor = mix(baseColor, highlightColor, edgeHighlight * 0.4);

  // Organic pulsing
  float pulse = sin(time * 0.5 + cell * 3.0) * 0.5 + 0.5;
  baseColor *= 0.9 + pulse * 0.2;

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
