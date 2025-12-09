/**
 * VibeMatrix13 Shader - BREATHING NEBULA
 *
 * Soft pulsing cloud formations - gaseous, ethereal.
 * Like looking into a living, breathing cosmic orb.
 * (nebula: violet, magenta, cyan, white)
 */

export const VIBE_MATRIX_13_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Nebula palette
const float3 COLOR_VIOLET = float3(0.4, 0.2, 0.6);
const float3 COLOR_MAGENTA = float3(0.8, 0.3, 0.6);
const float3 COLOR_CYAN = float3(0.3, 0.7, 0.9);
const float3 COLOR_WHITE = float3(1.0, 0.98, 0.95);

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

// fBM with breathing modulation
float breathingFbm(float2 p, float time, float octaves) {
  float value = 0.0;
  float amp = 0.5;
  float freq = 1.0;

  // Breathing rate - different for each octave
  for (float i = 0.0; i < 5.0; i += 1.0) {
    if (i >= octaves) break;

    // Each layer breathes at different rate
    float breathe = sin(time * (0.5 + i * 0.15)) * 0.3;
    float layerAmp = amp * (1.0 + breathe);

    value += layerAmp * snoise(p * freq);
    amp *= 0.5;
    freq *= 2.0;
  }

  return value;
}

// Cloud layer
float cloud(float2 uv, float time, float scale, float speed) {
  float2 p = uv * scale;

  // Drift
  p += float2(time * speed * 0.5, time * speed * 0.3);

  float n = breathingFbm(p, time, 4.0);
  n = n * 0.5 + 0.5;

  // Soft threshold for cloud edges
  n = smoothstep(0.3, 0.7, n);

  return n;
}

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time * 0.00025;
  float2 center = float2(0.5 * aspect, 0.5);
  float dist = length(uv - center);

  // Multiple cloud layers at different scales and speeds
  float cloud1 = cloud(uv, time, 2.0, 0.3);
  float cloud2 = cloud(uv + 10.0, time * 1.2, 3.0, 0.4);
  float cloud3 = cloud(uv + 20.0, time * 0.8, 4.0, 0.25);
  float cloud4 = cloud(uv + 30.0, time * 1.5, 5.0, 0.5);

  // Deep space background
  half3 color = half3(0.02, 0.02, 0.05);

  // Layer clouds with different colors
  // Deepest - violet
  color = mix(color, half3(COLOR_VIOLET), half(cloud1 * 0.6));

  // Magenta mid-layer
  color = mix(color, half3(COLOR_MAGENTA), half(cloud2 * 0.5));

  // Cyan highlights
  color = mix(color, half3(COLOR_CYAN), half(cloud3 * 0.4));

  // Bright wisps
  color = mix(color, half3(COLOR_WHITE), half(cloud4 * 0.3));

  // Radial breathing glow
  float pulse = sin(time * 2.0) * 0.5 + 0.5;
  float radialGlow = exp(-dist * 3.0) * (0.7 + pulse * 0.3);

  // Core color shifts
  half3 coreColor = mix(half3(COLOR_MAGENTA), half3(COLOR_CYAN), half(pulse));
  color += coreColor * half(radialGlow * 0.4);

  // Hot white center
  float coreIntensity = exp(-dist * 6.0);
  color += half3(COLOR_WHITE) * half(coreIntensity * 0.5 * (0.8 + pulse * 0.2));

  // Star field (tiny bright points)
  float stars = snoise(uv * 50.0);
  stars = pow(max(0.0, stars), 10.0);
  color += half3(COLOR_WHITE) * half(stars * 0.3 * (1.0 - radialGlow));

  // Swirling motion
  float angle = atan(uv.y - center.y, uv.x - center.x);
  float swirl = sin(angle * 3.0 + dist * 5.0 - time * 3.0) * 0.5 + 0.5;
  swirl *= smoothstep(0.0, 0.3, dist) * smoothstep(0.6, 0.2, dist);

  half3 swirlColor = mix(half3(COLOR_VIOLET), half3(COLOR_CYAN), half(swirl));
  color = mix(color, swirlColor, half(swirl * 0.2));

  // Gamma and saturation
  color = pow(color, half3(0.9));

  // Vignette
  float2 vigUV = xy / u_resolution;
  float vig = 1.0 - length((vigUV - 0.5) * 1.5);
  vig = smoothstep(0.0, 0.4, vig);
  color *= half(0.7 + 0.3 * vig);

  return half4(color, 1.0);
}
`;
