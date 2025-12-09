/**
 * VibeMatrix7 Shader - FLOWING STREAMS
 *
 * Perlin worms / flowing lines that snake through space
 * (electric lime, aqua, white, deep purple)
 */

export const VIBE_MATRIX_7_SHADER = `
// Uniforms
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Neon stream palette
const float3 COLOR_LIME = float3(0.7, 1.0, 0.2);
const float3 COLOR_AQUA = float3(0.2, 0.9, 1.0);
const float3 COLOR_WHITE = float3(1.0, 1.0, 1.0);
const float3 COLOR_PURPLE = float3(0.3, 0.1, 0.4);

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
// CURL NOISE - Creates flow field
// ============================================

float2 curlNoise(float2 p, float time) {
  float eps = 0.01;

  // Sample noise at neighboring points
  float n1 = snoise(float2(p.x, p.y + eps) + time);
  float n2 = snoise(float2(p.x, p.y - eps) + time);
  float n3 = snoise(float2(p.x + eps, p.y) + time);
  float n4 = snoise(float2(p.x - eps, p.y) + time);

  // Compute curl (perpendicular to gradient)
  float dx = (n1 - n2) / (2.0 * eps);
  float dy = (n3 - n4) / (2.0 * eps);

  return float2(dx, -dy);
}

// ============================================
// STREAM LINE FUNCTION
// Creates flowing line patterns
// ============================================

float streamLine(float2 uv, float2 flowDir, float time, float frequency, float width) {
  // Warp position along flow direction
  float2 warpedUV = uv + flowDir * time * 0.3;

  // Create sine-based streams
  float stream = sin(warpedUV.x * frequency + warpedUV.y * frequency * 0.5 + time);
  stream += sin(warpedUV.y * frequency * 0.7 - warpedUV.x * frequency * 0.3 - time * 0.8);

  // Sharp line effect
  stream = abs(stream);
  stream = 1.0 - smoothstep(0.0, width, stream);

  return stream;
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

  float time = u_time * 0.0003;
  float octaves = 2.0 + u_complexity * 3.0;

  // Get flow field direction
  float2 flow = curlNoise(uv * 1.5, time * 0.5);

  // Apply flow-based distortion
  float2 flowedUV = uv + flow * 0.15;

  // Multiple stream layers at different scales
  float stream1 = streamLine(flowedUV, flow, time, 8.0, 0.15);
  float stream2 = streamLine(flowedUV * 1.3, flow * 0.8, time * 1.2, 12.0, 0.12);
  float stream3 = streamLine(flowedUV * 0.7, flow * 1.2, time * 0.8, 6.0, 0.18);
  float stream4 = streamLine(flowedUV * 2.0, flow * 0.6, time * 1.5, 15.0, 0.08);

  // Combine streams with different weights
  float streams = stream1 * 0.35 + stream2 * 0.25 + stream3 * 0.25 + stream4 * 0.15;

  // Noise for color variation
  float n1 = fbm(flowedUV * 2.0 + time * 0.2, octaves);
  float n2 = fbm(flowedUV * 3.0 - time * 0.15, octaves * 0.7);
  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;

  // Base color - deep purple background
  half3 color = half3(COLOR_PURPLE);

  // Add lime streams
  float limeIntensity = streams * n1;
  color = mix(color, half3(COLOR_LIME), half(limeIntensity * 0.7));

  // Add aqua streams
  float aquaIntensity = streams * n2;
  color = mix(color, half3(COLOR_AQUA), half(aquaIntensity * 0.5));

  // White highlights on brightest streams
  float whiteIntensity = pow(streams, 3.0);
  color = mix(color, half3(COLOR_WHITE), half(whiteIntensity * 0.4));

  // Glow effect around streams
  float glow = streams * 0.5;
  color += half3(COLOR_LIME) * half(glow * 0.2);
  color += half3(COLOR_AQUA) * half(glow * 0.15);

  // Add subtle background movement
  float bgNoise = fbm(uv * 1.5 + time * 0.1, 2.0);
  bgNoise = bgNoise * 0.5 + 0.5;
  color = mix(color, color * 1.3, half(bgNoise * 0.2 * (1.0 - streams)));

  // Pulsing brightness on streams
  float pulse = sin(time * 4.0) * 0.5 + 0.5;
  color += half3(COLOR_WHITE) * half(streams * pulse * 0.1);

  // Boost saturation and vibrancy
  color = pow(color, half3(0.9));
  color *= 1.15;

  // Vignette
  float2 vignetteUV = xy / u_resolution;
  float vignette = 1.0 - length((vignetteUV - 0.5) * 1.4);
  vignette = smoothstep(0.0, 0.5, vignette);
  color *= half(0.7 + 0.3 * vignette);

  return half4(color, 1.0);
}
`;
