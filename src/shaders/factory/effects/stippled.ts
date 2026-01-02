/**
 * Stippled Effect - Stippled gradient textures with pointillist effect
 */

import type { EffectDefinition } from './index';

export const STIPPLED_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// STIPPLE PATTERN
// ============================================

float stipple(float2 uv, float density, float time) {
  float2 grid = floor(uv * density);
  float2 local = fract(uv * density);

  float randVal = hash(grid + floor(time * 0.5));
  float threshold = fbm(uv * 2.0 + time * 0.1, 2) * 0.5 + 0.5;

  float dot = smoothstep(0.4, 0.2, length(local - 0.5));
  return dot * step(threshold, randVal + 0.3);
}
`,

  main: `
  // Base gradient
  float gradient = uv.y + fbm(uv * 2.0 + time * 0.1, 3) * 0.3;

  // Multiple stipple layers
  float stip1 = stipple(uv, 50.0, time);
  float stip2 = stipple(uv + 0.1, 35.0, time * 0.8);
  float stip3 = stipple(uv - 0.1, 70.0, time * 1.2);

  float totalStipple = stip1 * 0.5 + stip2 * 0.3 + stip3 * 0.2;

  // Gradient colors
  float3 color1 = float3(0.1, 0.15, 0.25);
  float3 color2 = float3(0.25, 0.4, 0.5);
  float3 color3 = float3(0.5, 0.65, 0.6);

  float3 baseColor = mix(color1, color2, smoothstep(0.0, 0.5, gradient));
  baseColor = mix(baseColor, color3, smoothstep(0.5, 1.0, gradient));

  // Apply stipple
  float3 stippleColor = mix(baseColor * 0.7, baseColor * 1.3, totalStipple);
  baseColor = mix(baseColor, stippleColor, 0.6);

  // Noise variation
  float n = fbm(uv * 8.0 - time * 0.15, 2);
  n = n * 0.5 + 0.5;
  baseColor = mix(baseColor, baseColor * (0.8 + n * 0.4), 0.3);

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
