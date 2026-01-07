/**
 * Flowing Streams Effect - Ocean shore fluid mixing
 *
 * Turquoise water meets sandy shore with fluid swirling
 */

import type { EffectDefinition } from './index';

export const FLOWING_STREAMS_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// FLUID FLOW
// ============================================

float2 fluidFlow(float2 uv, float time) {
  float2 flow = float2(
    fbm(uv * 2.0 + time * 0.2, 3),
    fbm(uv * 2.0 + float2(50.0, 0.0) - time * 0.15, 3)
  );
  return flow * 0.3;
}

// ============================================
// MARBLE SWIRL
// ============================================

float marbleSwirl(float2 uv, float time) {
  float2 p = uv * 3.0;

  float angle = fbm(p + time * 0.1, 3) * 6.28;
  p += float2(cos(angle), sin(angle)) * 0.3;

  float swirl = sin(p.x * 2.0 + fbm(p * 2.0, 4) * 4.0 + time * 0.3);
  swirl += sin(p.y * 1.5 + fbm(p * 1.5 + 100.0, 4) * 3.0 - time * 0.2);

  return swirl * 0.5 + 0.5;
}
`,

  main: `
  float complexity = mix(0.6, 1.4, u_complexity);

  // Apply fluid flow
  float2 flowedUV = uv + fluidFlow(uv, time);

  // Shore gradient
  float shoreGrad = uv.x * 0.4 + uv.y * 0.6;
  shoreGrad += fbm(flowedUV * 2.0 + time * 0.1, 4) * 0.3;

  float swirl = marbleSwirl(flowedUV, time);

  // Zone mixing
  float waterZone = smoothstep(0.3, 0.5, shoreGrad);
  float sandZone = smoothstep(0.5, 0.7, shoreGrad);
  float lavenderZone = smoothstep(0.15, 0.35, shoreGrad) * (1.0 - waterZone);

  float3 baseColor = float3(DEEP_BLUE);
  baseColor = mix(baseColor, float3(TURQUOISE), waterZone * swirl);
  baseColor = mix(baseColor, float3(LAVENDER), lavenderZone * (1.0 - swirl) * 0.7);

  float sandMix = sandZone * fbm(flowedUV * 5.0, 3);
  baseColor = mix(baseColor, float3(SAND), sandMix);

  // Flowing veins
  float veins = fbm(flowedUV * 8.0 + time * 0.15, 4);
  veins = smoothstep(0.4, 0.6, veins);
  baseColor = mix(baseColor, float3(TURQUOISE), veins * waterZone * 0.35);
  baseColor = mix(baseColor, float3(LAVENDER) * 0.9, veins * lavenderZone * 0.3);

  // Foam edges
  float foam = fbm(flowedUV * 15.0 + time * 0.2, 3);
  foam = smoothstep(0.65, 0.85, foam);
  float foamMask = abs(shoreGrad - 0.5) < 0.15 ? 1.0 : 0.0;
  foamMask *= smoothstep(0.0, 0.1, abs(shoreGrad - 0.5));
  baseColor = mix(baseColor, float3(FOAM), foam * foamMask * 0.6 * complexity);

  // Texture
  float tex = fbm(uv * 30.0, 2) * 0.05;
  baseColor += tex * 0.5;

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
