/**
 * VibeMatrix13 - FLUID SHORELINE
 *
 * Purple/lavender meeting turquoise meeting sand - fluid art style
 * (lavender, violet, turquoise, sand, white)
 */

export const VIBE_MATRIX_13_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Fluid art palette
const float3 VIOLET = float3(0.45, 0.38, 0.62);
const float3 LAVENDER = float3(0.68, 0.62, 0.78);
const float3 TURQUOISE = float3(0.28, 0.75, 0.72);
const float3 AQUA = float3(0.42, 0.85, 0.82);
const float3 SAND = float3(0.85, 0.75, 0.65);
const float3 WHITE_FOAM = float3(0.96, 0.97, 0.98);

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

// Marble swirl function
float2 marbleWarp(float2 p, float time) {
  float angle = fbm(p * 2.0 + time * 0.1, 4) * 6.28;
  float radius = fbm(p * 1.5 - time * 0.08, 3) * 0.4;
  return p + float2(cos(angle), sin(angle)) * radius;
}

// Fluid mixing
float fluidMix(float2 uv, float time, float scale) {
  float2 p = uv * scale;

  float swirl1 = fbm(p + time * 0.15, 4);
  float swirl2 = fbm(p * 1.3 + float2(100.0, 0.0) - time * 0.1, 4);

  return sin(swirl1 * 4.0 + swirl2 * 3.0 + time * 0.2) * 0.5 + 0.5;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Apply marble warping
  float2 warpedUV = marbleWarp(uv, time);

  // Multiple fluid layers
  float fluid1 = fluidMix(warpedUV, time, 3.0);
  float fluid2 = fluidMix(warpedUV + 50.0, time * 0.8, 4.0);
  float fluid3 = fluidMix(warpedUV + 100.0, time * 1.2, 2.5);

  // Zone gradients (diagonal flow)
  float diag = uv.x * 0.5 + uv.y * 0.5;
  diag += fbm(warpedUV * 2.0, 3) * 0.25;

  // Build color zones
  float3 color = VIOLET;

  // Lavender zone (top area in reference)
  float lavenderZone = smoothstep(0.2, 0.5, diag) * fluid1;
  color = mix(color, LAVENDER, lavenderZone);

  // Turquoise water zone
  float turqZone = smoothstep(0.35, 0.6, diag) * (1.0 - fluid2 * 0.5);
  color = mix(color, TURQUOISE, turqZone * 0.8);

  // Bright aqua highlights
  float aquaZone = fluid2 * smoothstep(0.4, 0.7, diag);
  color = mix(color, AQUA, aquaZone * 0.5);

  // Sandy areas
  float sandZone = smoothstep(0.55, 0.8, diag) * fluid3;
  color = mix(color, SAND, sandZone * 0.7);

  // Flowing veins between zones
  float veins = fbm(warpedUV * 6.0 + time * 0.12, 4);
  veins = smoothstep(0.45, 0.55, veins);

  float3 veinColor = mix(TURQUOISE, LAVENDER, fluid1);
  color = mix(color, veinColor, veins * 0.3 * complexity);

  // White foam/froth edges
  float foam = fbm(warpedUV * 12.0 + time * 0.2, 3);
  foam = smoothstep(0.65, 0.85, foam);
  float foamMask = abs(diag - 0.5);
  foamMask = smoothstep(0.0, 0.3, foamMask) * (1.0 - smoothstep(0.3, 0.5, foamMask));
  color = mix(color, WHITE_FOAM, foam * foamMask * 0.5);

  // Subtle texture overlay
  float tex = fbm(uv * 35.0, 2) * 0.04;
  color += tex;

  // Soft glow in water areas
  float glow = smoothstep(0.3, 0.6, turqZone);
  color += AQUA * glow * 0.1;

  // Vignette
  float2 center = float2(0.5 * aspect, 0.5);
  float vignette = 1.0 - length(uv - center) * 0.3;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
