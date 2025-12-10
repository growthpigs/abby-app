/**
 * VibeMatrix5 Shader - LIQUID MARBLE
 *
 * Flowing marble texture with organic veins and depth
 * (deep navy, gold, cream, rose)
 */

export const VIBE_MATRIX_5_SHADER = `
// Uniforms
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Luxurious marble palette
const float3 COLOR_NAVY = float3(0.08, 0.1, 0.2);
const float3 COLOR_GOLD = float3(0.85, 0.7, 0.3);
const float3 COLOR_CREAM = float3(0.95, 0.9, 0.85);
const float3 COLOR_ROSE = float3(0.8, 0.4, 0.5);

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
// MARBLE TURBULENCE
// Creates flowing vein patterns
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
// MARBLE VEIN FUNCTION
// ============================================

float marbleVein(float2 uv, float time, float octaves) {
  // Base direction with slow rotation
  float angle = time * 0.1;
  float c = cos(angle);
  float s = sin(angle);
  float2 rotUV = float2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

  // Primary vein direction
  float basePattern = sin(rotUV.x * 3.0 + rotUV.y * 2.0 + time * 0.5);

  // Add turbulence to veins
  float turb = turbulence(uv * 2.0 + time * 0.1, octaves);

  // Warp the base pattern
  float vein = sin(basePattern * 3.14159 + turb * 4.0);
  vein = abs(vein);
  vein = pow(vein, 0.5);

  return vein;
}

// ============================================
// FLOWING DISTORTION
// ============================================

float2 flowDistort(float2 uv, float time) {
  float2 result = uv;

  // Slow, organic flow
  result.x += sin(uv.y * 2.0 + time * 0.3) * 0.1;
  result.y += cos(uv.x * 2.0 + time * 0.25) * 0.08;

  // Add noise-based displacement
  float n = snoise(uv * 1.5 + time * 0.2);
  result += float2(n * 0.05, n * 0.04);

  return result;
}

// ============================================
// MAIN SHADER
// ============================================

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time * 0.00025;
  float octaves = 2.0 + u_complexity * 3.0;

  // Apply flowing distortion
  float2 flowUV = flowDistort(uv, time);

  // Get marble vein pattern
  float vein1 = marbleVein(flowUV * 1.5, time, octaves);
  float vein2 = marbleVein(flowUV * 2.5 + 10.0, time * 0.8, octaves * 0.7);
  float vein3 = marbleVein(flowUV * 0.8 - 5.0, time * 1.2, octaves * 0.5);

  // Combine veins at different scales
  float veins = vein1 * 0.5 + vein2 * 0.3 + vein3 * 0.2;

  // Noise for additional color variation
  float n1 = fbm(flowUV * 3.0 + time * 0.3, octaves);
  float n2 = fbm(flowUV * 2.0 - time * 0.2, octaves * 0.6);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  // Base color - deep navy
  half3 color = half3(COLOR_NAVY);

  // Add cream in vein areas
  color = mix(color, half3(COLOR_CREAM), half(veins * 0.6));

  // Gold highlights in certain areas
  float goldMask = smoothstep(0.4, 0.6, n1) * smoothstep(0.3, 0.7, veins);
  color = mix(color, half3(COLOR_GOLD), half(goldMask * 0.5));

  // Rose tint in other areas
  float roseMask = smoothstep(0.5, 0.8, n2) * (1.0 - veins * 0.5);
  color = mix(color, half3(COLOR_ROSE), half(roseMask * 0.3));

  // Add depth - darker in "valleys"
  float depth = 1.0 - veins * 0.3;
  color *= half(depth);

  // Subtle shimmer effect
  float shimmer = sin(flowUV.x * 20.0 + time * 3.0) * sin(flowUV.y * 20.0 - time * 2.5);
  shimmer = shimmer * 0.5 + 0.5;
  shimmer = pow(shimmer, 4.0);
  color += half3(COLOR_GOLD) * half(shimmer * goldMask * 0.15);

  // Balanced color output
  color = pow(color, half3(0.98));

  // Vignette
  float2 vignetteUV = xy / u_resolution;
  float vignette = 1.0 - length((vignetteUV - 0.5) * 1.4);
  vignette = smoothstep(0.0, 0.5, vignette);
  color *= half(0.7 + 0.3 * vignette);

  return half4(color, 1.0);
}
`;
