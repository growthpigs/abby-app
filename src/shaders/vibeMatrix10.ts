/**
 * VibeMatrix10 Shader - CHROMATIC BLOOM
 *
 * Central glow with RGB channel splitting/chromatic aberration.
 * That liquid glass orb refraction feel, full screen.
 * (prismatic: red shift, cyan shift, white core)
 */

export const VIBE_MATRIX_10_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

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

float fbm(float2 p, float octaves) {
  float value = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (float i = 0.0; i < 4.0; i += 1.0) {
    if (i >= octaves) break;
    value += amp * snoise(p * freq);
    amp *= 0.5;
    freq *= 2.0;
  }
  return value;
}

// Radial bloom function
float bloom(float2 uv, float2 center, float time) {
  float dist = length(uv - center);

  // Pulsing core
  float pulse = sin(time * 2.0) * 0.1 + 0.9;
  float core = exp(-dist * 4.0 * pulse);

  // Outer glow
  float glow = exp(-dist * 1.5) * 0.6;

  // Noise modulation
  float n = fbm(uv * 3.0 + time * 0.2, 3.0) * 0.5 + 0.5;

  return core + glow * n;
}

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time * 0.0003;
  float2 center = float2(0.5 * aspect, 0.5);

  // Distance from center for chromatic offset
  float dist = length(uv - center);
  float2 dir = normalize(uv - center + 0.0001);

  // Chromatic aberration amount - increases with distance
  float aberration = dist * 0.03 * (1.0 + sin(time) * 0.3);

  // Sample bloom at offset positions for RGB
  float2 uvR = uv + dir * aberration;
  float2 uvG = uv;
  float2 uvB = uv - dir * aberration;

  float bloomR = bloom(uvR, center, time);
  float bloomG = bloom(uvG, center, time * 1.1);
  float bloomB = bloom(uvB, center, time * 0.9);

  // Secondary bloom centers (orbiting)
  float2 orbit1 = center + float2(sin(time * 0.5) * 0.2, cos(time * 0.6) * 0.15);
  float2 orbit2 = center + float2(cos(time * 0.4) * 0.18, sin(time * 0.5) * 0.22);

  bloomR += bloom(uvR, orbit1, time) * 0.4;
  bloomG += bloom(uvG, orbit1, time * 1.1) * 0.4;
  bloomB += bloom(uvB, orbit1, time * 0.9) * 0.4;

  bloomR += bloom(uvR, orbit2, time) * 0.3;
  bloomG += bloom(uvG, orbit2, time * 1.1) * 0.3;
  bloomB += bloom(uvB, orbit2, time * 0.9) * 0.3;

  // Construct color with chromatic separation (balanced, no base offsets)
  half3 color;
  color.r = half(bloomR * 0.7);
  color.g = half(bloomG * 0.65);
  color.b = half(bloomB * 0.75);

  // Add prismatic rainbow at edges
  float edgeRainbow = smoothstep(0.1, 0.4, dist) * smoothstep(0.7, 0.3, dist);
  float rainbowAngle = atan(dir.y, dir.x) + time * 0.5;

  half3 rainbow;
  rainbow.r = half(sin(rainbowAngle) * 0.5 + 0.5);
  rainbow.g = half(sin(rainbowAngle + 2.094) * 0.5 + 0.5);
  rainbow.b = half(sin(rainbowAngle + 4.189) * 0.5 + 0.5);

  color += rainbow * half(edgeRainbow * 0.3);

  // White hot core (reduced intensity)
  float coreIntensity = exp(-dist * 8.0);
  color += half3(1.0, 0.98, 0.95) * half(coreIntensity * 0.25);

  // Dark background falloff
  float bg = 1.0 - smoothstep(0.0, 0.8, dist);
  color *= half(0.3 + bg * 0.7);

  // Subtle noise texture (scaled down)
  float noise = fbm(uv * 10.0, 2.0) * 0.05;
  color += half(noise * 0.3);

  // Vignette
  float2 vigUV = xy / u_resolution;
  float vig = 1.0 - length((vigUV - 0.5) * 1.5);
  vig = smoothstep(0.0, 0.4, vig);
  color *= half(0.7 + 0.3 * vig);

  // Gamma correction for balanced output
  color = pow(color, half3(0.95));

  return half4(color, 1.0);
}
`;
