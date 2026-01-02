/**
 * Magnetic Field Effect - Tidal pool-inspired magnetic field line patterns
 */

import type { EffectDefinition } from './index';

export const MAGNETIC_FIELD_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// FIELD LINES
// ============================================

float fieldLine(float2 uv, float2 pole1, float2 pole2, float time) {
  float2 d1 = uv - pole1;
  float2 d2 = uv - pole2;

  float a1 = atan(d1.y, d1.x);
  float a2 = atan(d2.y, d2.x);

  float field = sin((a1 - a2) * 8.0 + time * 0.5);
  field = smoothstep(-0.3, 0.3, field);

  float intensity = 1.0 / (length(d1) + 0.1) + 1.0 / (length(d2) + 0.1);
  intensity = smoothstep(2.0, 8.0, intensity);

  return field * intensity;
}
`,

  main: `
  // Moving magnetic poles
  float2 pole1 = float2(0.3 + sin(time * 0.3) * 0.1, 0.5 + cos(time * 0.25) * 0.15);
  float2 pole2 = float2(0.7 + cos(time * 0.35) * 0.1, 0.5 + sin(time * 0.3) * 0.15);

  float field = fieldLine(uv, pole1, pole2, time);

  // Secondary field
  float2 pole3 = float2(0.5, 0.3 + sin(time * 0.2) * 0.1);
  float field2 = fieldLine(uv, pole1, pole3, time * 0.8) * 0.5;

  float totalField = field + field2;

  // Base tidal pool colors
  float3 darkColor = float3(0.03, 0.08, 0.12);
  float3 midColor = float3(0.1, 0.25, 0.35);
  float3 lineColor = float3(0.2, 0.5, 0.6);
  float3 brightColor = float3(0.4, 0.7, 0.75);

  // Noise for organic feel
  float n = fbm(uv * 4.0 + time * 0.1, 3);
  n = n * 0.5 + 0.5;

  float3 baseColor = mix(darkColor, midColor, n);
  baseColor = mix(baseColor, lineColor, totalField * 0.6);
  baseColor = mix(baseColor, brightColor, smoothstep(0.7, 0.9, totalField) * 0.5);

  // Pole glow
  float poleGlow = exp(-length(uv - pole1) * 5.0) + exp(-length(uv - pole2) * 5.0);
  baseColor += float3(0.15, 0.3, 0.35) * poleGlow * 0.3;

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
