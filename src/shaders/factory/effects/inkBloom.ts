/**
 * Ink Bloom Effect - Ink spreading in water
 */

import type { EffectDefinition } from './index';

export const INK_BLOOM_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// INK SPREAD
// ============================================

float inkSpread(float2 uv, float2 origin, float time, float speed) {
  float2 delta = uv - origin;
  float dist = length(delta);

  // Expanding ring
  float expansion = time * speed;
  float ring = smoothstep(expansion - 0.1, expansion, dist) *
               smoothstep(expansion + 0.3, expansion, dist);

  // Noise distortion for organic edges
  float n = fbm(delta * 5.0 + time * 0.5, 3);
  ring *= smoothstep(-0.3, 0.3, n);

  return ring;
}

float inkCloud(float2 uv, float time) {
  float total = 0.0;

  // Multiple ink origins
  float2 o1 = float2(0.3, 0.4);
  float2 o2 = float2(0.7, 0.6);
  float2 o3 = float2(0.5, 0.3);

  total += inkSpread(uv, o1, time, 0.1);
  total += inkSpread(uv, o2, time * 0.8 + 0.5, 0.08);
  total += inkSpread(uv, o3, time * 1.2 + 1.0, 0.12);

  // Static ink pools
  float n = fbm(uv * 3.0 + time * 0.05, 4);
  n = smoothstep(0.4, 0.6, n * 0.5 + 0.5);
  total += n * 0.5;

  return min(total, 1.0);
}
`,

  main: `
  float ink = inkCloud(uv, time);

  // Noise variation
  float n1 = fbm(uv * 4.0 + time * 0.1, 3);
  float n2 = fbm(uv * 6.0 - time * 0.15, 2);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  // Paper/water colors
  float3 paperColor = float3(0.95, 0.93, 0.9);
  float3 inkColor = float3(0.1, 0.08, 0.15);
  float3 inkEdge = float3(0.3, 0.25, 0.35);
  float3 tintColor = float3(0.2, 0.15, 0.3);

  float3 baseColor = paperColor;

  // Ink edge (lighter)
  float edge = smoothstep(0.1, 0.4, ink) * (1.0 - smoothstep(0.4, 0.7, ink));
  baseColor = mix(baseColor, inkEdge, edge);

  // Ink body (darker)
  baseColor = mix(baseColor, inkColor, smoothstep(0.4, 0.7, ink));

  // Tint variation
  baseColor = mix(baseColor, tintColor, n1 * ink * 0.3);

  // Paper texture
  float paperTex = noise(uv * 50.0) * 0.1;
  baseColor = mix(baseColor, baseColor * (1.0 - paperTex), 1.0 - ink);

  // Wet edge darkening
  float wetEdge = smoothstep(0.3, 0.5, ink) * smoothstep(0.6, 0.4, ink);
  baseColor *= 1.0 - wetEdge * 0.2;

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
