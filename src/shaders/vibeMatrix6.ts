/**
 * VibeMatrix6 Shader - KALEIDOSCOPE BLOOM
 *
 * Radial symmetry with rotating, blooming patterns
 * (fuchsia, violet, coral, peach)
 */

export const VIBE_MATRIX_6_SHADER = `
// Uniforms
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Vibrant bloom palette
const float3 COLOR_FUCHSIA = float3(1.0, 0.2, 0.6);
const float3 COLOR_VIOLET = float3(0.6, 0.2, 0.9);
const float3 COLOR_CORAL = float3(1.0, 0.5, 0.4);
const float3 COLOR_PEACH = float3(1.0, 0.8, 0.6);

// ============================================
// SIMPLEX NOISE
// ============================================

float3 mod289_3(float3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float2 mod289_2(float2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float3 permute(float3 x) {
  return mod289_3(((x * 34.0) + 1.0) * x);
}

float snoise(float2 v) {
  const float4 C = float4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );

  float2 i = floor(v + dot(v, C.yy));
  float2 x0 = v - i + dot(i, C.xx);

  float2 i1;
  i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
  float4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289_2(i);
  float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0))
                    + i.x + float3(0.0, i1.x, 1.0));

  float3 m = max(0.5 - float3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  float3 x = 2.0 * fract(p * C.www) - 1.0;
  float3 h = abs(x) - 0.5;
  float3 ox = floor(x + 0.5);
  float3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  float3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ============================================
// KALEIDOSCOPE TRANSFORM
// Folds UV space into radial segments
// ============================================

float2 kaleidoscope(float2 uv, float2 center, int segments, float rotation) {
  float2 delta = uv - center;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x) + rotation;

  // Number of segments
  float segmentAngle = 3.14159 * 2.0 / float(segments);

  // Fold the angle into one segment
  angle = mod(angle, segmentAngle);

  // Mirror every other segment
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

  // Create petal shape
  float petal = sin(angle * float(petals) + time * 0.5) * 0.5 + 0.5;

  // Radial falloff with petal modulation
  float radial = 1.0 - smoothstep(0.0, 0.4 + petal * 0.2, dist);

  // Add inner ring
  float ring = smoothstep(0.1, 0.15, dist) * (1.0 - smoothstep(0.2, 0.25, dist));

  return radial * petal + ring * 0.3;
}

// ============================================
// fBM
// ============================================

float fbm(float2 p, float octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float maxValue = 0.0;

  for (float i = 0.0; i < 5.0; i += 1.0) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value / maxValue;
}

// ============================================
// MAIN SHADER
// ============================================

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time * 0.0002;
  float octaves = 2.0 + u_complexity * 3.0;

  // Center of kaleidoscope
  float2 center = float2(0.5 * aspect, 0.5);

  // Number of segments based on complexity
  int segments = 6 + int(u_complexity * 4.0);

  // Slow rotation
  float rotation = time * 0.3;

  // Apply kaleidoscope transform
  float2 kaleUV = kaleidoscope(uv, center, segments, rotation);

  // Add subtle noise distortion
  float noiseOffset = snoise(kaleUV * 3.0 + time * 0.5) * 0.05;
  kaleUV += float2(noiseOffset);

  // Multiple petal patterns at different scales
  float petals1 = petalPattern(kaleUV, center, time, 5);
  float petals2 = petalPattern(kaleUV * 1.5, center * 1.5, time * 1.3, 7);
  float petals3 = petalPattern(kaleUV * 0.7, center * 0.7, time * 0.7, 3);

  // Combine patterns
  float pattern = petals1 * 0.5 + petals2 * 0.3 + petals3 * 0.2;

  // Noise for color variation
  float n1 = fbm(kaleUV * 2.0 + time * 0.2, octaves);
  float n2 = fbm(kaleUV * 3.0 - time * 0.15, octaves * 0.7);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  // Distance from center for radial effects
  float distFromCenter = length(uv - center);

  // Base color mixing
  half3 color = mix(half3(COLOR_VIOLET), half3(COLOR_FUCHSIA), half(n1));
  color = mix(color, half3(COLOR_CORAL), half(pattern * 0.6));
  color = mix(color, half3(COLOR_PEACH), half(n2 * 0.4));

  // Add radial gradient
  float radialGradient = 1.0 - smoothstep(0.0, 0.6, distFromCenter);
  color = mix(color, half3(COLOR_FUCHSIA), half(radialGradient * 0.3));

  // Bloom glow in pattern areas
  float bloom = pow(pattern, 2.0) * 0.4;
  color += half3(0.4, 0.2, 0.3) * half(bloom);

  // Spiral overlay
  float2 delta = uv - center;
  float angle = atan(delta.y, delta.x);
  float spiral = sin(angle * 3.0 + distFromCenter * 8.0 - time * 2.0) * 0.5 + 0.5;
  color = mix(color, color * 1.2, half(spiral * 0.2));

  // Pulsing brightness
  float pulse = sin(time * 3.0) * 0.5 + 0.5;
  color *= half(0.9 + pulse * 0.1);

  // Boost saturation
  color = pow(color, half3(0.85));
  color *= 1.15;

  // Vignette
  float2 vignetteUV = xy / u_resolution;
  float vignette = 1.0 - length((vignetteUV - 0.5) * 1.3);
  vignette = smoothstep(0.0, 0.5, vignette);
  color *= half(0.75 + 0.25 * vignette);

  return half4(color, 1.0);
}
`;
