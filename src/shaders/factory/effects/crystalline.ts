/**
 * Crystalline Effect - Seafoam crystalline facet patterns
 */

import type { EffectDefinition } from './index';

export const CRYSTALLINE_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// FOAM PATTERN
// ============================================

float foamPattern(float2 uv, float time, float scale) {
  float2 p = uv * scale;
  p += float2(time * 0.1, time * 0.05);

  float n1 = fbm(p, 4);
  float n2 = fbm(p * 2.0 + 50.0, 3);
  float n3 = fbm(p * 0.5 + 100.0, 4);

  float foam = n1 * n2;
  foam = smoothstep(0.2, 0.5, foam);
  foam *= smoothstep(0.3, 0.6, n3);

  return foam;
}

// ============================================
// WAVE PATTERN
// ============================================

float wavePattern(float2 uv, float time) {
  float wave = sin(uv.x * 8.0 + time + fbm(uv * 3.0, 3) * 2.0);
  wave += sin(uv.y * 6.0 - time * 0.7 + fbm(uv * 2.0 + 50.0, 3) * 2.0);
  wave *= 0.5;
  return wave * 0.5 + 0.5;
}
`,

  main: `
  float complexity = mix(0.6, 1.4, u_complexity);

  // Warped UV
  float2 warpedUV = uv;
  warpedUV += float2(
    fbm(uv * 2.0 + time * 0.1, 3) * 0.1,
    fbm(uv * 2.0 + 50.0 - time * 0.08, 3) * 0.1
  );

  // Base water depth
  float depth = fbm(warpedUV * 3.0 + time * 0.05, 4);

  // Water colors
  float3 deepOcean = float3(0.02, 0.18, 0.28);
  float3 teal = float3(0.08, 0.42, 0.48);
  float3 cyan = float3(0.18, 0.62, 0.68);
  float3 foam = float3(0.92, 0.95, 0.96);
  float3 spray = float3(0.75, 0.85, 0.88);

  float3 baseColor = deepOcean;
  baseColor = mix(baseColor, teal, smoothstep(0.3, 0.6, depth));
  baseColor = mix(baseColor, cyan, smoothstep(0.5, 0.8, depth) * 0.5);

  // Wave highlights
  float wave = wavePattern(warpedUV, time);
  baseColor = mix(baseColor, cyan * 1.1, wave * 0.2);

  // Foam patterns
  float foam1 = foamPattern(warpedUV, time, 8.0 * complexity);
  float foam2 = foamPattern(warpedUV + 30.0, time * 0.8, 12.0);
  float foam3 = foamPattern(warpedUV + 60.0, time * 1.2, 6.0);

  float totalFoam = max(foam1, foam2 * 0.7);
  totalFoam = max(totalFoam, foam3 * 0.5);

  baseColor = mix(baseColor, spray, totalFoam * 0.6);
  baseColor = mix(baseColor, foam, smoothstep(0.5, 0.8, totalFoam) * 0.8);

  // Fine spray
  float sprayNoise = fbm(uv * 30.0 + time * 0.3, 2);
  sprayNoise = smoothstep(0.65, 0.85, sprayNoise);
  baseColor = mix(baseColor, foam, sprayNoise * 0.3 * complexity);

  // Caustics
  float caustic = sin(warpedUV.x * 20.0 + time) * sin(warpedUV.y * 18.0 - time * 0.7);
  caustic = caustic * 0.5 + 0.5;
  baseColor += cyan * caustic * (1.0 - totalFoam) * 0.1;

  half3 color = half3(baseColor);
`,
};
