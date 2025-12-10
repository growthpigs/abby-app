/**
 * VibeMatrix8 - DEEP OCEAN
 *
 * Deep blue-teal water with organic flowing patterns
 * (deep blue, teal, cyan, dark accents)
 */

export const VIBE_MATRIX_8_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Deep ocean palette
const float3 DEEP_BLUE = float3(0.02, 0.15, 0.35);
const float3 OCEAN_TEAL = float3(0.05, 0.45, 0.55);
const float3 CYAN_BRIGHT = float3(0.15, 0.65, 0.72);
const float3 DARK_DEPTHS = float3(0.01, 0.08, 0.15);

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

// Turbulent flow
float turbulence(float2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * abs(noise(p * frequency) * 2.0 - 1.0);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Domain warping for organic flow
float2 warp(float2 p, float time) {
  float2 q = float2(
    fbm(p + float2(0.0, 0.0) + time * 0.1, 4),
    fbm(p + float2(5.2, 1.3) - time * 0.08, 4)
  );

  float2 r = float2(
    fbm(p + 4.0 * q + float2(1.7, 9.2) + time * 0.05, 4),
    fbm(p + 4.0 * q + float2(8.3, 2.8) - time * 0.06, 4)
  );

  return p + r * 0.5;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Apply domain warping
  float2 warpedUV = warp(uv * 2.0, time);

  // Base pattern with turbulence
  float turb = turbulence(warpedUV * 3.0, int(4.0 * complexity));
  float pattern = fbm(warpedUV * 2.0 + time * 0.1, 5);

  // Depth layers
  float depth1 = fbm(uv * 3.0 + time * 0.05, 4);
  float depth2 = fbm(uv * 5.0 - time * 0.08, 3);

  // Build color from depths
  float3 color = DEEP_BLUE;

  // Add teal mid-tones
  color = mix(color, OCEAN_TEAL, smoothstep(0.3, 0.6, pattern));

  // Add bright cyan highlights
  color = mix(color, CYAN_BRIGHT, smoothstep(0.5, 0.8, turb * pattern) * 0.6);

  // Dark organic shapes
  float darkShapes = fbm(warpedUV * 4.0 + float2(100.0, 50.0), 4);
  darkShapes = smoothstep(0.55, 0.7, darkShapes);
  color = mix(color, DARK_DEPTHS, darkShapes * 0.7);

  // Scattered dark clusters (like the reference)
  float clusters = fbm(uv * 12.0 + time * 0.03, 3);
  clusters = smoothstep(0.6, 0.8, clusters);
  color = mix(color, DARK_DEPTHS * 0.5, clusters * 0.5 * complexity);

  // Light caustic ripples (scaled down)
  float caustic = sin(warpedUV.x * 15.0 + time) * sin(warpedUV.y * 12.0 - time * 0.7);
  caustic = caustic * 0.5 + 0.5;
  color += CYAN_BRIGHT * caustic * 0.05 * (1.0 - darkShapes);

  // Organic flowing veins
  float veins = fbm(warpedUV * 8.0, 4);
  veins = abs(veins - 0.5) * 2.0;
  veins = smoothstep(0.7, 0.9, veins);
  color = mix(color, CYAN_BRIGHT * 0.8, veins * 0.2);

  // Subtle white foam specks (scaled down)
  float foam = fbm(uv * 25.0 + time * 0.1, 2);
  foam = smoothstep(0.75, 0.9, foam);
  color += float3(0.3, 0.35, 0.4) * foam * 0.08;

  // Vignette
  float2 center = float2(0.5 * aspect, 0.5);
  float vignette = 1.0 - length(uv - center) * 0.4;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
