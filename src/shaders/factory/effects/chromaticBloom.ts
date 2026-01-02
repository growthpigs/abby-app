/**
 * Chromatic Bloom Effect - Central glow with RGB channel splitting
 *
 * Liquid glass orb refraction with prismatic edges
 */

import type { EffectDefinition } from './index';

export const CHROMATIC_BLOOM_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// RADIAL BLOOM FUNCTION
// ============================================

float bloom(float2 uv, float2 center, float time) {
  float dist = length(uv - center);

  float pulse = sin(time * 2.0) * 0.1 + 0.9;
  float core = exp(-dist * 4.0 * pulse);
  float glow = exp(-dist * 1.5) * 0.6;

  float n = fbm(uv * 3.0 + time * 0.2, 3.0) * 0.5 + 0.5;

  return core + glow * n;
}
`,

  main: `
  float2 center = float2(0.5 * aspect, 0.5);
  float dist = length(uv - center);
  float2 dir = normalize(uv - center + 0.0001);

  // Chromatic aberration
  float aberration = dist * 0.03 * (1.0 + sin(time) * 0.3);

  float2 uvR = uv + dir * aberration;
  float2 uvG = uv;
  float2 uvB = uv - dir * aberration;

  float bloomR = bloom(uvR, center, time);
  float bloomG = bloom(uvG, center, time * 1.1);
  float bloomB = bloom(uvB, center, time * 0.9);

  // Secondary bloom centers (orbiting)
  float2 orbit1 = center + float2(sin(time * 0.5) * 0.2, cos(time * 0.6) * 0.15);
  float2 orbit2 = center + float2(cos(time * 0.4) * 0.18, sin(time * 0.5) * 0.22);

  bloomR += bloom(uvR, orbit1, time) * 0.4 + bloom(uvR, orbit2, time) * 0.3;
  bloomG += bloom(uvG, orbit1, time * 1.1) * 0.4 + bloom(uvG, orbit2, time * 1.1) * 0.3;
  bloomB += bloom(uvB, orbit1, time * 0.9) * 0.4 + bloom(uvB, orbit2, time * 0.9) * 0.3;

  half3 color;
  color.r = half(bloomR * 0.7);
  color.g = half(bloomG * 0.65);
  color.b = half(bloomB * 0.75);

  // Prismatic rainbow at edges
  float edgeRainbow = smoothstep(0.1, 0.4, dist) * smoothstep(0.7, 0.3, dist);
  float rainbowAngle = atan(dir.y, dir.x) + time * 0.5;

  half3 rainbow;
  rainbow.r = half(sin(rainbowAngle) * 0.5 + 0.5);
  rainbow.g = half(sin(rainbowAngle + 2.094) * 0.5 + 0.5);
  rainbow.b = half(sin(rainbowAngle + 4.189) * 0.5 + 0.5);

  color += rainbow * half(edgeRainbow * 0.3);

  // White hot core
  float coreIntensity = exp(-dist * 8.0);
  color += half3(1.0, 0.98, 0.95) * half(coreIntensity * 0.25);

  // Dark background falloff
  float bg = 1.0 - smoothstep(0.0, 0.8, dist);
  color *= half(0.3 + bg * 0.7);

  // Subtle noise
  float noise = fbm(uv * 10.0, 2.0) * 0.05;
  color += half(noise * 0.3);

  color = pow(color, half3(0.95));
`,
};
