/**
 * Domain Warp Effect - Base organic flowing patterns
 *
 * Uses fBM and domain warping for oil-on-water feel
 */

import type { EffectDefinition } from './index';

export const DOMAIN_WARP_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// DOMAIN WARPING
// Creates the "oil on water" effect
// ============================================

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
  // Scale for nice pattern size
  uv *= 3.0;

  // Complexity controls animation speed
  float speed = mix(0.05, 0.25, u_complexity);
  float octaves = 1.0 + u_complexity * 4.0;
  float warpIntensity = 0.15 + u_complexity * 1.2;

  // Apply domain warping
  float2 warpedUV = domainWarp(uv, time * speed, warpIntensity);

  // Sample noise at warped position
  float n = fbm(warpedUV, octaves);
  n = n * 0.5 + 0.5;

  // Add variation with second noise layer
  float n2 = fbm(warpedUV * 2.0 + time * speed * 1.67, octaves * 0.5);
  n2 = n2 * 0.5 + 0.5;

  // Blend noise values
  float blend = mix(n, n2, 0.3);

  // Apply contrast
  float contrast = 0.8 + u_complexity * 0.4;
  blend = pow(blend, contrast);

  // Mix colors
  half3 color = mix(half3(u_colorA), half3(u_colorB), half(blend));

  // Add third color accent
  float accentNoise = fbm(warpedUV * 1.5 - time * speed, 2.0);
  accentNoise = smoothstep(0.1, 0.6, accentNoise * 0.5 + 0.5);
  color = mix(color, half3(u_colorC), half(accentNoise * 0.35));

  // Add subtle highlights
  float highlight = pow(max(0.0, n), 3.0) * 0.2;
  color += half3(highlight);
`,
};
