/**
 * VibeMatrix12 Shader - STIPPLED GRADIENT
 *
 * Dense dot/stipple patterns with organic distribution.
 * William Mapan pointillism meets generative gradients.
 * (sunset: coral, mauve, dusty rose, golden)
 */

export const VIBE_MATRIX_12_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Sunset palette
const float3 COLOR_CORAL = float3(1.0, 0.55, 0.5);
const float3 COLOR_MAUVE = float3(0.7, 0.5, 0.65);
const float3 COLOR_ROSE = float3(0.85, 0.6, 0.65);
const float3 COLOR_GOLD = float3(1.0, 0.8, 0.5);

// Hash for stipple pattern
float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

float2 hash2(float2 p) {
  p = float2(dot(p, float2(127.1, 311.7)), dot(p, float2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

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

// Stipple pattern - returns density of dots
float stipple(float2 uv, float density, float dotSize, float time) {
  // Grid with jitter
  float2 gridUV = uv * density;
  float2 cellId = floor(gridUV);
  float2 cellUV = fract(gridUV);

  // Jitter dot position within cell
  float2 jitter = hash2(cellId + time * 0.1) * 0.8;
  float2 dotCenter = float2(0.5) + (jitter - 0.5) * 0.6;

  // Distance to dot
  float dist = length(cellUV - dotCenter);

  // Dot with soft edge
  float dot = 1.0 - smoothstep(dotSize * 0.5, dotSize, dist);

  return dot;
}

// Multi-layer stipple
float multiStipple(float2 uv, float time, float baseDensity) {
  float result = 0.0;

  // Multiple stipple layers at different scales
  result += stipple(uv, baseDensity, 0.3, time) * 0.5;
  result += stipple(uv + 0.33, baseDensity * 1.5, 0.25, time * 1.1) * 0.3;
  result += stipple(uv + 0.66, baseDensity * 2.0, 0.2, time * 0.9) * 0.2;

  return result;
}

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time * 0.0002;
  float2 center = float2(0.5 * aspect, 0.5);

  // Distance and angle from center
  float dist = length(uv - center);
  float angle = atan(uv.y - center.y, uv.x - center.x);

  // Base gradient - radial with rotation
  float gradAngle = angle + time * 0.3;
  float grad1 = sin(gradAngle * 2.0) * 0.5 + 0.5;
  float grad2 = cos(gradAngle * 3.0 + 1.0) * 0.5 + 0.5;

  // Noise for organic variation
  float n1 = snoise(uv * 2.0 + time * 0.3) * 0.5 + 0.5;
  float n2 = snoise(uv * 3.0 - time * 0.2) * 0.5 + 0.5;

  // Base color from gradients
  half3 baseColor = mix(half3(COLOR_CORAL), half3(COLOR_MAUVE), half(grad1));
  baseColor = mix(baseColor, half3(COLOR_ROSE), half(grad2 * 0.6));
  baseColor = mix(baseColor, half3(COLOR_GOLD), half(n1 * 0.4));

  // Radial falloff - brighter in center
  float radialBright = 1.0 - smoothstep(0.0, 0.6, dist);
  baseColor = mix(baseColor, half3(COLOR_GOLD), half(radialBright * 0.3));

  // Stipple density varies with distance and noise
  float density = 30.0 + u_complexity * 20.0;
  density *= (1.0 + n2 * 0.5);
  density *= (0.8 + (1.0 - dist) * 0.4); // Denser toward center

  // Get stipple pattern
  float dots = multiStipple(uv, time, density);

  // Stipple color - slightly brighter than base
  half3 stippleColor = baseColor * 1.3 + half3(0.1);

  // Background - darker version of base
  half3 bgColor = baseColor * 0.4;

  // Composite
  half3 color = mix(bgColor, stippleColor, half(dots));

  // Add some larger accent dots
  float accentDots = stipple(uv, density * 0.3, 0.4, time * 0.5);
  half3 accentColor = mix(half3(COLOR_GOLD), half3(COLOR_CORAL), half(n1));
  color = mix(color, accentColor, half(accentDots * 0.4));

  // Central glow
  float glow = exp(-dist * 3.0) * 0.3;
  color += half3(COLOR_GOLD) * half(glow);

  // Vignette
  float2 vigUV = xy / u_resolution;
  float vig = 1.0 - length((vigUV - 0.5) * 1.3);
  vig = smoothstep(0.0, 0.5, vig);
  color *= half(0.8 + 0.2 * vig);

  return half4(color, 1.0);
}
`;
