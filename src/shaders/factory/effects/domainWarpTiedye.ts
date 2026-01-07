/**
 * Domain Warp Tie-Dye Effect - Enhanced with tie-dye flow
 *
 * Adds nested sin/cos feedback for organic multi-directional movement
 */

import type { EffectDefinition } from './index';

export const DOMAIN_WARP_TIEDYE_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// TIE-DYE FLOW
// Nested sin/cos feedback for organic movement
// ============================================

float2 tieDyeFlow(float2 pos, float time, float strength) {
  float2 result = pos;
  for (float k = 1.0; k < 6.0; k += 1.0) {
    result.x += strength * sin(time * 1.6 + k * 1.8 * result.y);
    result.y += strength * cos(time * 1.8 + k * 1.6 * result.x);
  }
  return result;
}

float2 domainWarp(float2 p, float time, float intensity) {
  float2 q = float2(
    fbm(p + float2(0.0, 0.0) + time * 0.1, 2.0),
    fbm(p + float2(5.2, 1.3) + time * 0.12, 2.0)
  );
  float2 r = float2(
    fbm(p + 4.0 * q + float2(1.7, 9.2) + time * 0.15, 2.0),
    fbm(p + 4.0 * q + float2(8.3, 2.8) + time * 0.13, 2.0)
  );
  return p + intensity * r;
}
`,

  main: `
  uv *= 3.0;

  float speed = mix(0.05, 0.25, u_complexity);
  float octaves = 1.0 + u_complexity * 4.0;
  float warpIntensity = 0.15 + u_complexity * 1.2;

  // Scale variation across canvas
  float scaleNoise = snoise(uv * 0.5 + time * speed * 0.33);
  float localScale = 0.7 + scaleNoise * 0.6;

  // Apply tie-dye flow with variable scale
  float flowStrength = (0.22 + u_complexity * 0.29) * localScale;
  float2 flowedUV = tieDyeFlow(uv * localScale, time * speed, flowStrength);

  // Apply domain warping on top
  float2 warpedUV = domainWarp(flowedUV, time * speed, warpIntensity);

  float n = fbm(warpedUV, octaves);
  n = n * 0.5 + 0.5;

  float n2 = fbm(warpedUV * 2.0 + time * speed * 1.67, octaves * 0.5);
  n2 = n2 * 0.5 + 0.5;

  float blend = mix(n, n2, 0.3);
  float contrast = 0.8 + u_complexity * 0.4;
  blend = pow(blend, contrast);

  half3 color = mix(half3(u_colorA), half3(u_colorB), half(blend));

  float pinkNoise = fbm(warpedUV * 1.5 - time * speed, 2.0);
  pinkNoise = smoothstep(0.1, 0.6, pinkNoise * 0.5 + 0.5);
  color = mix(color, half3(u_colorC), half(pinkNoise * 0.35));

  float highlight = pow(max(0.0, n), 3.0) * 0.2;
  color += half3(highlight);

  // Drifting gradient
  float gradientAngle = sin(time * 0.03) * 0.5;
  float2 gradientDir = float2(cos(gradientAngle + 1.57), sin(gradientAngle + 1.57));
  float gradientPos = dot(uv - 0.5, gradientDir) + 0.5;
  float darkenMask = smoothstep(0.0, 0.6, gradientPos);
  color *= mix(half3(0.6, 0.65, 0.7), half3(1.0), half(darkenMask));
`,
};
