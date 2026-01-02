/**
 * Kaleidoscope Effect - Radial symmetry with blooming patterns
 *
 * Fuchsia, violet, coral, peach color scheme
 */

import type { EffectDefinition } from './index';

export const KALEIDOSCOPE_EFFECT: EffectDefinition = {
  helpers: `
// ============================================
// KALEIDOSCOPE TRANSFORM
// ============================================

float2 kaleidoscope(float2 uv, float2 center, int segments, float rotation) {
  float2 delta = uv - center;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x) + rotation;

  float segmentAngle = 3.14159 * 2.0 / float(segments);
  angle = mod(angle, segmentAngle);

  if (mod(floor(atan(delta.y, delta.x) / segmentAngle), 2.0) > 0.5) {
    angle = segmentAngle - angle;
  }

  return float2(cos(angle), sin(angle)) * dist + center;
}

// ============================================
// BLOOM PETAL PATTERN
// ============================================

float petalPattern(float2 uv, float2 center, float time, int petals) {
  float2 delta = uv - center;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x);

  float petal = sin(angle * float(petals) + time * 0.5) * 0.5 + 0.5;
  float radial = 1.0 - smoothstep(0.0, 0.4 + petal * 0.2, dist);
  float ring = smoothstep(0.1, 0.15, dist) * (1.0 - smoothstep(0.2, 0.25, dist));

  return radial * petal + ring * 0.3;
}
`,

  main: `
  float octaves = 2.0 + u_complexity * 3.0;
  float2 center = float2(0.5 * aspect, 0.5);
  int segments = 6 + int(u_complexity * 4.0);
  float rotation = time * 0.3;

  // Apply kaleidoscope
  float2 kaleUV = kaleidoscope(uv, center, segments, rotation);

  // Noise distortion
  float noiseOffset = snoise(kaleUV * 3.0 + time * 0.5) * 0.05;
  kaleUV += float2(noiseOffset);

  // Multiple petal patterns
  float petals1 = petalPattern(kaleUV, center, time, 5);
  float petals2 = petalPattern(kaleUV * 1.5, center * 1.5, time * 1.3, 7);
  float petals3 = petalPattern(kaleUV * 0.7, center * 0.7, time * 0.7, 3);

  float pattern = petals1 * 0.5 + petals2 * 0.3 + petals3 * 0.2;

  float n1 = fbm(kaleUV * 2.0 + time * 0.2, octaves);
  float n2 = fbm(kaleUV * 3.0 - time * 0.15, octaves * 0.7);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  float distFromCenter = length(uv - center);

  // Color mixing
  half3 color = mix(half3(COLOR_VIOLET), half3(COLOR_FUCHSIA), half(n1));
  color = mix(color, half3(COLOR_CORAL), half(pattern * 0.6));
  color = mix(color, half3(COLOR_PEACH), half(n2 * 0.4));

  // Radial gradient
  float radialGradient = 1.0 - smoothstep(0.0, 0.6, distFromCenter);
  color = mix(color, half3(COLOR_FUCHSIA), half(radialGradient * 0.3));

  // Bloom glow
  float bloom = pow(pattern, 2.0) * 0.4;
  color += half3(0.4, 0.2, 0.3) * half(bloom);

  // Spiral overlay
  float2 delta = uv - center;
  float angle = atan(delta.y, delta.x);
  float spiral = sin(angle * 3.0 + distFromCenter * 8.0 - time * 2.0) * 0.5 + 0.5;
  color = mix(color, color * 1.2, half(spiral * 0.2));

  // Pulsing
  float pulse = sin(time * 3.0) * 0.5 + 0.5;
  color *= half(0.9 + pulse * 0.1);

  color = pow(color, half3(0.95));
`,
};
