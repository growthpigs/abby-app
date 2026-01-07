/**
 * Layered Orbs Effect - Coral reef-inspired layered orb patterns
 */

import type { EffectDefinition } from './index';

export const LAYERED_ORBS_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// ORB LAYER FUNCTION
// ============================================

float orbLayer(float2 uv, float2 center, float radius, float softness) {
  float dist = length(uv - center);
  return smoothstep(radius + softness, radius - softness, dist);
}

float layeredOrbs(float2 uv, float time) {
  float total = 0.0;

  // Multiple orb layers at different depths
  for (float i = 0.0; i < 5.0; i += 1.0) {
    float phase = i * 1.2;
    float2 center = float2(
      0.5 + sin(time * 0.2 + phase) * 0.3,
      0.5 + cos(time * 0.25 + phase) * 0.3
    );
    float radius = 0.15 + sin(time * 0.3 + phase) * 0.05;
    float layer = orbLayer(uv, center, radius, 0.1);
    total += layer * (1.0 - i * 0.15);
  }

  return total;
}
`,

  main: `
  float orbs = layeredOrbs(uv, time);

  // Noise variation
  float n1 = fbm(uv * 4.0 + time * 0.15, 3);
  float n2 = fbm(uv * 6.0 - time * 0.1, 2);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  // Coral reef colors
  float3 deepColor = float3(0.05, 0.15, 0.25);
  float3 midColor = float3(0.15, 0.4, 0.45);
  float3 brightColor = float3(0.3, 0.6, 0.55);
  float3 accentColor = float3(0.9, 0.5, 0.4);

  float3 baseColor = deepColor;
  baseColor = mix(baseColor, midColor, orbs * 0.7);
  baseColor = mix(baseColor, brightColor, smoothstep(0.5, 1.0, orbs));

  // Accent based on noise
  baseColor = mix(baseColor, accentColor, n1 * orbs * 0.3);

  // Depth variation
  float depth = n2 * (1.0 - orbs * 0.5);
  baseColor = mix(baseColor, deepColor * 0.7, depth * 0.3);

  // Caustic highlights
  float caustic = sin(uv.x * 15.0 + time) * sin(uv.y * 12.0 - time * 0.8);
  caustic = caustic * 0.5 + 0.5;
  baseColor += float3(0.1, 0.15, 0.12) * caustic * orbs * 0.15;

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
