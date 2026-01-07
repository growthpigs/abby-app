/**
 * Aurora Curtains Effect - Ocean currents aurora curtain effect
 */

import type { EffectDefinition } from './index';

export const AURORA_CURTAINS_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// CURTAIN WAVE
// ============================================

float curtainWave(float2 uv, float time, float freq, float speed) {
  float wave = sin(uv.x * freq + time * speed + fbm(uv * 2.0, 2) * 2.0);
  wave += sin(uv.x * freq * 0.5 - time * speed * 0.7) * 0.5;
  return wave * 0.5 + 0.5;
}

float auroraCurtain(float2 uv, float time) {
  // Multiple curtain layers
  float c1 = curtainWave(uv, time, 3.0, 0.5);
  float c2 = curtainWave(uv + 0.3, time * 0.8, 4.0, 0.3);
  float c3 = curtainWave(uv - 0.2, time * 1.2, 2.0, 0.7);

  // Vertical gradient for curtain shape
  float vGrad = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.5, uv.y);

  float curtain = (c1 * 0.5 + c2 * 0.3 + c3 * 0.2) * vGrad;
  return curtain;
}
`,

  main: `
  float curtain = auroraCurtain(uv, time);

  // Noise for color variation
  float n1 = fbm(uv * 3.0 + time * 0.1, 3);
  float n2 = fbm(uv * 5.0 - time * 0.15, 2);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  // Ocean/aurora colors
  float3 deepColor = float3(0.02, 0.05, 0.1);
  float3 oceanColor = float3(0.05, 0.15, 0.25);
  float3 auroraGreen = float3(0.2, 0.6, 0.4);
  float3 auroraCyan = float3(0.15, 0.5, 0.6);
  float3 auroraPurple = float3(0.3, 0.2, 0.5);

  // Base ocean gradient
  float3 baseColor = mix(deepColor, oceanColor, uv.y);

  // Aurora colors based on noise and curtain
  baseColor = mix(baseColor, auroraGreen, curtain * n1 * 0.6);
  baseColor = mix(baseColor, auroraCyan, curtain * n2 * 0.4);
  baseColor = mix(baseColor, auroraPurple, curtain * (1.0 - n1) * 0.3);

  // Vertical shimmer
  float shimmer = sin(uv.y * 30.0 + time * 2.0) * 0.5 + 0.5;
  shimmer *= curtain;
  baseColor += float3(0.1, 0.2, 0.15) * shimmer * 0.2;

  // Stars in dark areas
  float stars = noise(uv * 100.0);
  stars = smoothstep(0.97, 1.0, stars);
  baseColor += float3(1.0, 0.95, 0.9) * stars * (1.0 - curtain * 0.8);

  // Horizontal flow lines
  float flow = sin(uv.y * 20.0 + time + n1 * 3.0);
  flow = smoothstep(0.8, 1.0, flow * 0.5 + 0.5);
  baseColor += auroraCyan * flow * curtain * 0.15;

  half3 color = half3(baseColor);
  color = pow(color, half3(0.95));
`,
};
