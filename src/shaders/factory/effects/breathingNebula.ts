/**
 * Breathing Nebula Effect - Fluid shoreline-inspired breathing nebula
 */

import type { EffectDefinition } from './index';

export const BREATHING_NEBULA_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// BREATHING PULSE
// ============================================

float breathe(float time, float rate) {
  return (sin(time * rate) * 0.5 + 0.5);
}

// ============================================
// NEBULA CLOUD
// ============================================

float nebulaCloud(float2 uv, float time) {
  float2 p = uv * 2.0;

  // Breathing scale
  float breath = breathe(time, 0.5);
  float scale = 1.0 + breath * 0.2;

  p *= scale;
  p += float2(sin(time * 0.2), cos(time * 0.15)) * 0.3;

  float n1 = fbm(p, 4);
  float n2 = fbm(p * 1.5 + 50.0, 3);
  float n3 = fbm(p * 0.7 - time * 0.1, 5);

  return (n1 + n2 * 0.5 + n3 * 0.3) / 1.8;
}
`,

  main: `
  float cloud = nebulaCloud(uv, time);
  cloud = cloud * 0.5 + 0.5;

  // Breathing intensity
  float breath = breathe(time, 0.5);

  // Nebula colors
  float3 darkColor = float3(0.02, 0.03, 0.08);
  float3 midColor = float3(0.15, 0.1, 0.25);
  float3 brightColor = float3(0.4, 0.2, 0.5);
  float3 accentColor = float3(0.6, 0.3, 0.4);

  float3 baseColor = darkColor;
  baseColor = mix(baseColor, midColor, smoothstep(0.3, 0.5, cloud));
  baseColor = mix(baseColor, brightColor, smoothstep(0.5, 0.7, cloud));
  baseColor = mix(baseColor, accentColor, smoothstep(0.7, 0.9, cloud) * 0.5);

  // Breathing brightness
  baseColor *= 0.8 + breath * 0.4;

  // Stars
  float stars = noise(uv * 100.0);
  stars = smoothstep(0.97, 1.0, stars);
  baseColor += float3(1.0, 0.95, 0.9) * stars * (1.0 - cloud * 0.5);

  // Edge glow
  float2 center = float2(0.5 * aspect, 0.5);
  float dist = length(uv - center);
  float edgeGlow = smoothstep(0.6, 0.2, dist) * breath;
  baseColor += float3(0.2, 0.1, 0.3) * edgeGlow * 0.3;

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
