/**
 * VibeMatrix Shader - Domain Warping with fBM
 *
 * This shader creates the "Living Background" for Abby.
 * It uses Simplex Noise with Domain Warping to create
 * fluid, organic patterns that respond to complexity and color.
 *
 * Uniforms:
 * - u_time: Animation clock (0-10000, loops)
 * - u_resolution: Canvas size [width, height]
 * - u_complexity: 0.0-1.0, controls octaves/turbulence
 * - u_colorA: Primary color RGB (normalized 0-1)
 * - u_colorB: Secondary color RGB (normalized 0-1)
 */

export const VIBE_MATRIX_SHADER = `
// Uniforms
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;
uniform float3 u_colorA;
uniform float3 u_colorB;
uniform float3 u_colorC;  // Pink accent color

// ============================================
// SIMPLEX NOISE (2D)
// Based on Stefan Gustavson's implementation
// Optimized for SkSL
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
    0.211324865405187,  // (3.0-sqrt(3.0))/6.0
    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
    -0.577350269189626, // -1.0 + 2.0 * C.x
    0.024390243902439   // 1.0 / 41.0
  );

  // First corner
  float2 i = floor(v + dot(v, C.yy));
  float2 x0 = v - i + dot(i, C.xx);

  // Other corners
  float2 i1;
  i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
  float4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  // Permutations
  i = mod289_2(i);
  float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0))
                    + i.x + float3(0.0, i1.x, 1.0));

  float3 m = max(0.5 - float3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  // Gradients
  float3 x = 2.0 * fract(p * C.www) - 1.0;
  float3 h = abs(x) - 0.5;
  float3 ox = floor(x + 0.5);
  float3 a0 = x - ox;

  // Normalize gradients
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  // Compute final noise value
  float3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ============================================
// FRACTAL BROWNIAN MOTION (fBM)
// Number of octaves controlled by complexity
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
// DOMAIN WARPING
// Creates the "oil on water" effect
// ============================================

float2 domainWarp(float2 p, float time, float intensity) {
  float2 q = float2(
    fbm(p + float2(0.0, 0.0) + time * 0.1, 2.0),
    fbm(p + float2(5.2, 1.3) + time * 0.12, 2.0)
  );

  float2 r = float2(
    fbm(p + 4.0 * q + float2(1.7, 9.2) + time * 0.15, 2.0),
    fbm(p + 4.0 * q + float2(8.3, 2.8) + time * 0.13, 2.0)
  );

  return p + intensity * r;
}

// ============================================
// TIE-DYE / OIL-IN-WATER FLOW
// Nested sin/cos feedback creates organic multi-directional movement
// ============================================

float2 tieDyeFlow(float2 pos, float time, float strength) {
  float2 result = pos;

  // Each iteration feeds x into y and y into x
  // LESS VISCOUS = faster internal dynamics
  for (float k = 1.0; k < 6.0; k += 1.0) {
    result.x += strength * sin(time * 1.6 + k * 1.8 * result.y);  // 2x faster
    result.y += strength * cos(time * 1.8 + k * 1.6 * result.x);  // 2x faster
  }

  return result;
}

// ============================================
// MAIN SHADER
// ============================================

half4 main(float2 xy) {
  // Normalize coordinates to 0-1 range
  float2 uv = xy / u_resolution;

  // Adjust aspect ratio
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  // Scale for nice pattern size
  uv *= 3.0;

  // Time factor - slightly slower for organic feel
  float time = u_time * 0.00018; // Slowed down from 0.0003

  // Calculate octaves based on complexity (1-5)
  float octaves = 1.0 + u_complexity * 4.0;

  // Warp intensity based on complexity
  float warpIntensity = 0.15 + u_complexity * 1.2;

  // Speed multiplier based on complexity
  float speedMult = 0.7 + u_complexity * 2.0; // Slowed down
  float adjustedTime = time * speedMult;

  // ============================================
  // VARIABLE SCALE SWIRLS - bigger and smaller regions
  // ============================================

  // Create scale variation across the canvas using noise
  float scaleNoise = snoise(uv * 0.5 + adjustedTime * 0.1);
  float localScale = 0.7 + scaleNoise * 0.6; // Scale varies from 0.1 to 1.3

  // ============================================
  // TIE-DYE FLOW - Multi-directional organic movement
  // ============================================

  // Apply tie-dye flow with variable scale
  float flowStrength = (0.22 + u_complexity * 0.29) * localScale;
  float2 flowedUV = tieDyeFlow(uv * localScale, adjustedTime, flowStrength);

  // Apply domain warping ON TOP of flow for compound organic motion
  float2 warpedUV = domainWarp(flowedUV, adjustedTime, warpIntensity);

  // Sample noise at warped position
  float n = fbm(warpedUV, octaves);

  // Remap noise to 0-1 range
  n = n * 0.5 + 0.5;

  // Add some variation with second noise layer
  float n2 = fbm(warpedUV * 2.0 + adjustedTime * 0.5, octaves * 0.5);
  n2 = n2 * 0.5 + 0.5;

  // Blend the two noise values
  float blend = mix(n, n2, 0.3);

  // Apply contrast based on complexity
  float contrast = 0.8 + u_complexity * 0.4;
  blend = pow(blend, contrast);

  // Mix colors based on noise - A to B blend
  half3 color = mix(half3(u_colorA), half3(u_colorB), half(blend));

  // Add pink accent in certain regions (based on third noise pattern)
  float pinkNoise = fbm(warpedUV * 1.5 - adjustedTime * 0.3, 2.0);
  pinkNoise = smoothstep(0.1, 0.6, pinkNoise * 0.5 + 0.5);
  color = mix(color, half3(u_colorC), half(pinkNoise * 0.35));  // Subtle pink blend

  // Add subtle highlights
  float highlight = pow(max(0.0, n), 3.0) * 0.2;
  color += half3(highlight);

  // Vignette effect (subtle)
  float2 vignetteUV = xy / u_resolution;
  float vignette = 1.0 - length((vignetteUV - 0.5) * 1.2);
  vignette = smoothstep(0.0, 0.7, vignette);
  color *= half(0.85 + 0.15 * vignette);

  return half4(color, 1.0);
}
`;
