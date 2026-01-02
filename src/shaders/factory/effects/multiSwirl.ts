/**
 * Multi-Swirl Effect - Multiple drifting vortex centers
 *
 * Warm fire/sunset swirls with 4 counter-rotating centers
 */

import type { EffectDefinition } from './index';

export const MULTI_SWIRL_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// MULTI-SWIRL
// Multiple drifting vortex centers
// ============================================

float2 multiSwirl(float2 uv, float time) {
  float2 result = uv;

  // 4 drifting swirl centers
  float2 center1 = float2(0.3 + sin(time * 0.15) * 0.4, 0.4 + cos(time * 0.2) * 0.3);
  float2 center2 = float2(0.7 + cos(time * 0.18) * 0.3, 0.6 + sin(time * 0.12) * 0.4);
  float2 center3 = float2(0.5 + sin(time * 0.22) * 0.35, 0.3 + cos(time * 0.16) * 0.35);
  float2 center4 = float2(0.4 + cos(time * 0.14) * 0.3, 0.7 + sin(time * 0.19) * 0.3);

  for (int i = 0; i < 4; i++) {
    float2 center;
    float strength;
    float dir;

    if (i == 0) { center = center1; strength = 1.5; dir = 1.0; }
    else if (i == 1) { center = center2; strength = 1.2; dir = -1.0; }
    else if (i == 2) { center = center3; strength = 1.8; dir = 1.0; }
    else { center = center4; strength = 1.0; dir = -1.0; }

    float2 delta = result - center;
    float dist = length(delta);
    float angle = dir * strength / (dist + 0.3) + time * 0.3 * dir;
    float c = cos(angle);
    float s = sin(angle);

    float influence = smoothstep(0.8, 0.0, dist);
    float2 swirled = float2(c * delta.x - s * delta.y, s * delta.x + c * delta.y) + center;
    result = mix(result, swirled, influence * 0.6);
  }

  return result;
}
`,

  main: `
  float octaves = 1.0 + u_complexity * 4.0;

  // Apply multi-swirl distortion
  float2 swirledUV = multiSwirl(uv, time);

  // Add turbulence
  float2 turbulence = float2(
    snoise(swirledUV * 3.0 + time * 0.5),
    snoise(swirledUV * 3.0 + time * 0.5 + 100.0)
  );
  swirledUV += turbulence * 0.08;

  // Sample noise for color mixing
  float n1 = fbm(swirledUV * 2.5, octaves);
  float n2 = fbm(swirledUV * 1.5 + time, octaves * 0.7);
  float n3 = fbm(swirledUV * 4.0 - time * 0.5, octaves * 0.5);

  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;
  n3 = n3 * 0.5 + 0.5;

  // Mix warm colors
  half3 color = mix(half3(COLOR_RED), half3(COLOR_ORANGE), half(n1));
  color = mix(color, half3(COLOR_YELLOW), half(n2 * 0.6));
  color = mix(color, half3(COLOR_MAGENTA), half(n3 * 0.4));

  color = pow(color, half3(0.95));
`,
};
