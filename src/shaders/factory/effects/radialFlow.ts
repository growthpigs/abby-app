/**
 * Radial Flow Effect - Deep ocean radial flow field patterns
 */

import type { EffectDefinition } from './index';

export const RADIAL_FLOW_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// RADIAL FLOW FIELD
// ============================================

float2 radialFlow(float2 uv, float2 center, float time) {
  float2 delta = uv - center;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x);

  // Spiral outward flow
  float flowAngle = angle + dist * 2.0 + time * 0.3;
  float radialStrength = smoothstep(0.0, 0.5, dist) * smoothstep(1.0, 0.3, dist);

  float2 flow = float2(cos(flowAngle), sin(flowAngle)) * radialStrength * 0.1;
  return flow;
}

float flowLines(float2 uv, float2 center, float time) {
  float2 delta = uv - center;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x);

  float lines = sin(angle * 8.0 + dist * 15.0 - time * 2.0);
  lines = smoothstep(-0.2, 0.2, lines);

  return lines * smoothstep(0.8, 0.1, dist);
}
`,

  main: `
  float2 center = float2(0.5 * aspect, 0.5);

  // Apply radial flow
  float2 flow = radialFlow(uv, center, time);
  float2 flowedUV = uv + flow;

  float dist = length(uv - center);

  // Base deep ocean
  float depth = fbm(flowedUV * 3.0 + time * 0.1, 4);
  float3 baseColor = mix(float3(0.02, 0.05, 0.12), float3(0.08, 0.18, 0.28), depth);

  // Flow lines
  float lines = flowLines(flowedUV, center, time);
  baseColor = mix(baseColor, float3(0.15, 0.35, 0.45), lines * 0.5);

  // Center glow
  float centerGlow = exp(-dist * 3.0);
  baseColor += float3(0.1, 0.25, 0.35) * centerGlow;

  // Noise texture
  float n = fbm(flowedUV * 5.0 - time * 0.15, 3);
  n = n * 0.5 + 0.5;
  baseColor = mix(baseColor, float3(0.12, 0.28, 0.38), n * 0.3);

  // Particles
  float particles = fbm(uv * 20.0 + time * 0.3, 2);
  particles = smoothstep(0.7, 0.9, particles);
  baseColor += float3(0.2, 0.4, 0.5) * particles * 0.2;

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
