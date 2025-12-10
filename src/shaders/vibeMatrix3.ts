/**
 * VibeMatrix3 Shader - NEON AURORA SPIRALS
 *
 * Polar coordinate spirals with vibrant neon colors
 * (hot pink, electric blue, cyan, purple)
 */

export const VIBE_MATRIX_3_SHADER = `
// Uniforms
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Neon color palette - aurora/cyberpunk
const float3 COLOR_PINK = float3(1.0, 0.2, 0.6);
const float3 COLOR_BLUE = float3(0.1, 0.4, 1.0);
const float3 COLOR_CYAN = float3(0.0, 0.9, 0.9);
const float3 COLOR_PURPLE = float3(0.6, 0.1, 0.9);

// ============================================
// SIMPLEX NOISE (2D)
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
// POLAR SPIRAL DISTORTION
// Creates aurora-like bands that spiral outward
// ============================================

float2 polarSpiral(float2 uv, float2 center, float time) {
  float2 delta = uv - center;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x);

  // Spiral distortion - angle depends on distance
  float spiral = angle + dist * 3.0 - time * 0.8;

  // Add wave distortion
  float wave1 = sin(spiral * 4.0 + time) * 0.15;
  float wave2 = sin(dist * 8.0 - time * 1.2) * 0.1;

  // Apply distortion to polar coordinates
  float newDist = dist + wave1 + wave2;
  float newAngle = angle + sin(dist * 5.0 + time * 0.5) * 0.3;

  // Convert back to cartesian
  return center + float2(cos(newAngle), sin(newAngle)) * newDist;
}

// ============================================
// AURORA BANDS
// Creates flowing band patterns
// ============================================

float auroraBands(float2 uv, float time) {
  float bands = 0.0;

  // Multiple overlapping sine waves for aurora effect
  bands += sin(uv.y * 6.0 + uv.x * 2.0 + time * 0.8) * 0.5 + 0.5;
  bands += sin(uv.y * 4.0 - uv.x * 3.0 + time * 0.6) * 0.3;
  bands += sin(uv.x * 5.0 + uv.y * 1.5 + time * 1.1) * 0.2;

  return bands;
}

// ============================================
// fBM for texture
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

  float time = u_time * 0.0002;  // Smooth speed
  float octaves = 1.0 + u_complexity * 4.0;

  // Center for spiral
  float2 center = float2(0.5 * aspect, 0.5);

  // Apply polar spiral distortion
  float2 spiralUV = polarSpiral(uv, center, time);

  // Add some noise-based displacement
  float noiseDisp = snoise(spiralUV * 2.0 + time * 0.3);
  spiralUV += float2(noiseDisp * 0.1, noiseDisp * 0.08);

  // Aurora bands pattern
  float bands = auroraBands(spiralUV, time);

  // Noise layers for color mixing
  float n1 = fbm(spiralUV * 2.0, octaves);
  float n2 = fbm(spiralUV * 3.0 + time * 0.5, octaves * 0.6);

  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  // Distance from center for radial gradient
  float distFromCenter = length(uv - center);

  // Mix neon colors based on bands and noise
  half3 color = mix(half3(COLOR_PINK), half3(COLOR_BLUE), half(n1));
  color = mix(color, half3(COLOR_CYAN), half(bands * 0.5));
  color = mix(color, half3(COLOR_PURPLE), half(n2 * 0.4));

  // Add glow effect at band peaks
  float glow = pow(bands, 2.0) * 0.3;
  color += half3(glow * 0.5, glow * 0.8, glow);

  // Balanced color output
  color = pow(color, half3(0.95));

  // Subtle radial darkening at edges
  float radialFade = 1.0 - smoothstep(0.3, 0.8, distFromCenter);
  color *= half(0.7 + 0.3 * radialFade);

  // Vignette
  float2 vignetteUV = xy / u_resolution;
  float vignette = 1.0 - length((vignetteUV - 0.5) * 1.4);
  vignette = smoothstep(0.0, 0.5, vignette);
  color *= half(0.75 + 0.25 * vignette);

  return half4(color, 1.0);
}
`;
