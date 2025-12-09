/**
 * VibeMatrix8 Shader - RADIAL FLOW FIELD
 *
 * William Mapan style - strokes/particles following noise-based
 * flow field emanating from center. Organic, biological feel.
 * (warm earth tones: terracotta, sand, rust, cream)
 */

export const VIBE_MATRIX_8_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Earth palette - warm, organic
const float3 COLOR_TERRACOTTA = float3(0.8, 0.45, 0.35);
const float3 COLOR_SAND = float3(0.95, 0.88, 0.75);
const float3 COLOR_RUST = float3(0.6, 0.25, 0.2);
const float3 COLOR_CREAM = float3(0.98, 0.95, 0.9);

// Simplex noise
float3 mod289_3(float3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float2 mod289_2(float2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float3 permute(float3 x) { return mod289_3(((x * 34.0) + 1.0) * x); }

float snoise(float2 v) {
  const float4 C = float4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  float2 i = floor(v + dot(v, C.yy));
  float2 x0 = v - i + dot(i, C.xx);
  float2 i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
  float4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289_2(i);
  float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0)) + i.x + float3(0.0, i1.x, 1.0));
  float3 m = max(0.5 - float3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
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

// Flow field angle from noise
float flowAngle(float2 p, float time) {
  float n1 = snoise(p * 0.8 + time * 0.1);
  float n2 = snoise(p * 1.5 - time * 0.15);
  return (n1 + n2 * 0.5) * 3.14159;
}

// Trace a streamline from point
float streamline(float2 uv, float2 center, float time, float seed) {
  float2 p = uv;
  float intensity = 0.0;

  // Distance from center affects flow strength
  float distFromCenter = length(uv - center);

  // Trace backward along flow field
  for (float i = 0.0; i < 20.0; i += 1.0) {
    float angle = flowAngle(p * 3.0 + seed, time);

    // Add radial component - flow outward from center
    float2 toCenter = normalize(center - p);
    float radialAngle = atan(toCenter.y, toCenter.x);
    angle = mix(angle, radialAngle + 3.14159, 0.3); // Bias outward

    float2 dir = float2(cos(angle), sin(angle));
    p -= dir * 0.02;

    // Accumulate intensity based on proximity to original point
    float d = length(p - uv);
    intensity += exp(-d * 30.0) * (1.0 - i / 20.0);
  }

  return intensity;
}

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time * 0.0002;
  float2 center = float2(0.5 * aspect, 0.5);

  // Multiple streamline layers
  float stream1 = streamline(uv, center, time, 0.0);
  float stream2 = streamline(uv, center, time * 1.1, 100.0);
  float stream3 = streamline(uv, center, time * 0.9, 200.0);

  float streams = stream1 * 0.4 + stream2 * 0.35 + stream3 * 0.25;
  streams = pow(streams, 0.7);

  // Distance for radial gradient
  float dist = length(uv - center);
  float radialGrad = 1.0 - smoothstep(0.0, 0.6, dist);

  // Noise for color variation
  float n = snoise(uv * 2.0 + time * 0.3) * 0.5 + 0.5;

  // Base color - cream background
  half3 color = half3(COLOR_CREAM);

  // Add terracotta in flow areas
  color = mix(color, half3(COLOR_TERRACOTTA), half(streams * 0.6));

  // Rust accents
  float rustMask = streams * n * radialGrad;
  color = mix(color, half3(COLOR_RUST), half(rustMask * 0.4));

  // Sand mid-tones
  color = mix(color, half3(COLOR_SAND), half((1.0 - streams) * 0.3));

  // Central glow
  color += half3(COLOR_SAND) * half(radialGrad * 0.2);

  // Soft vignette
  float2 vigUV = xy / u_resolution;
  float vig = 1.0 - length((vigUV - 0.5) * 1.2);
  vig = smoothstep(0.0, 0.6, vig);
  color *= half(0.85 + 0.15 * vig);

  return half4(color, 1.0);
}
`;
