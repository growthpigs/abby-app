/**
 * Shader Noise Functions
 *
 * Common noise implementations shared across all shaders.
 * These are injected at compile time to avoid duplication.
 */

/**
 * Simplex noise implementation (Stefan Gustavson)
 * Optimized for SkSL
 */
export const SIMPLEX_NOISE = `
// ============================================
// SIMPLEX NOISE (2D)
// Based on Stefan Gustavson's implementation
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

  float2 i = floor(v + dot(v, C.yy));
  float2 x0 = v - i + dot(i, C.xx);

  float2 i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
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
`;

/**
 * Hash-based noise (faster, less smooth)
 * Used by some effects like seafoam
 */
export const HASH_NOISE = `
// ============================================
// HASH-BASED NOISE (Fast)
// ============================================

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i), hash(i + float2(1.0, 0.0)), f.x),
    mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), f.x),
    f.y
  );
}
`;

/**
 * Fractal Brownian Motion using simplex noise
 * Standard version with configurable octaves
 */
export const FBM_SIMPLEX = `
// ============================================
// FRACTAL BROWNIAN MOTION (fBM)
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
`;

/**
 * Fractal Brownian Motion using hash noise
 * Variant for effects that use hash noise
 */
export const FBM_HASH = `
// ============================================
// FRACTAL BROWNIAN MOTION (fBM) - Hash version
// ============================================

float fbm(float2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
`;

/**
 * Turbulence function (absolute value variant of fBM)
 * Creates sharper, more detailed patterns
 */
export const TURBULENCE = `
// ============================================
// TURBULENCE (Sharp fBM variant)
// ============================================

float turbulence(float2 p, float octaves) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maxValue = 0.0;

  for (float i = 0.0; i < 6.0; i += 1.0) {
    if (i >= octaves) break;
    value += amplitude * abs(snoise(p * frequency));
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value / maxValue;
}
`;

/**
 * Get noise code based on type
 */
export function getNoiseCode(type: 'simplex' | 'hash' | 'both'): string {
  switch (type) {
    case 'simplex':
      return SIMPLEX_NOISE + FBM_SIMPLEX;
    case 'hash':
      return HASH_NOISE + FBM_HASH;
    case 'both':
      return SIMPLEX_NOISE + HASH_NOISE + FBM_SIMPLEX;
    default:
      return SIMPLEX_NOISE + FBM_SIMPLEX;
  }
}
