/**
 * VibeMatrix17 - LAGOON
 *
 * Crystal clear turquoise with sandy bottom visible
 * (crystal turquoise, aqua, sandy beige, white sand)
 */

export const VIBE_MATRIX_17_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Lagoon palette
const float3 CRYSTAL_TURQ = float3(0.28, 0.82, 0.78);
const float3 AQUA_LIGHT = float3(0.45, 0.92, 0.88);
const float3 TEAL_DEEP = float3(0.12, 0.52, 0.55);
const float3 SAND_WET = float3(0.72, 0.65, 0.52);
const float3 SAND_DRY = float3(0.88, 0.82, 0.72);

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

// Water caustics on sandy bottom
float caustics(float2 uv, float time) {
  float2 p = uv * 15.0;

  float c1 = sin(p.x * 2.0 + time * 1.5 + noise(p) * 3.0);
  float c2 = sin(p.y * 2.0 - time * 1.2 + noise(p + 50.0) * 3.0);
  float c3 = sin((p.x + p.y) * 1.5 + time * 0.8);

  float caustic = c1 * c2 + c3 * 0.3;
  return caustic * 0.5 + 0.5;
}

// Sand ripple pattern
float sandRipples(float2 uv, float time) {
  float2 p = uv * 20.0;
  p += float2(time * 0.05, time * 0.03);

  float ripple = sin(p.x + fbm(uv * 5.0, 3) * 3.0);
  ripple += sin(p.y * 0.8 + fbm(uv * 4.0 + 50.0, 3) * 2.0) * 0.5;

  return ripple * 0.5 + 0.5;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Gentle water distortion
  float2 waterUV = uv;
  waterUV += float2(
    sin(time * 0.5 + uv.y * 5.0) * 0.01,
    cos(time * 0.4 + uv.x * 4.0) * 0.01
  );
  waterUV += float2(
    fbm(uv * 3.0 + time * 0.1, 3) * 0.03,
    fbm(uv * 3.0 + 50.0 - time * 0.08, 3) * 0.03
  );

  // Water depth variation
  float depth = fbm(waterUV * 2.0 + time * 0.03, 4);
  depth = depth * 0.5 + 0.25; // 0.25 to 0.75 range

  // Sandy bottom pattern
  float sandPattern = fbm(waterUV * 8.0, 4);
  float sandRipple = sandRipples(waterUV, time);

  // Build sandy bottom
  float3 sandColor = mix(SAND_WET, SAND_DRY, sandPattern);
  sandColor = mix(sandColor, SAND_WET * 0.9, sandRipple * 0.3);

  // Caustic light on sand
  float caust = caustics(waterUV, time);
  sandColor += float3(0.15, 0.18, 0.12) * caust * 0.4;

  // Water color based on depth
  float3 waterColor = mix(AQUA_LIGHT, CRYSTAL_TURQ, depth);
  waterColor = mix(waterColor, TEAL_DEEP, smoothstep(0.5, 0.8, depth) * 0.4);

  // Blend water over sand (deeper = more water color, less sand visible)
  float waterOpacity = smoothstep(0.2, 0.6, depth);
  float3 color = mix(sandColor, waterColor, waterOpacity * 0.7);

  // Add water surface highlights
  float surface = fbm(waterUV * 6.0 + time * 0.2, 3);
  surface = smoothstep(0.5, 0.7, surface);
  color = mix(color, AQUA_LIGHT * 1.1, surface * 0.2);

  // Bright shallow areas
  float shallow = smoothstep(0.4, 0.2, depth);
  color = mix(color, AQUA_LIGHT * 1.15, shallow * 0.3);

  // Deeper teal patches
  float deepPatch = fbm(uv * 4.0 + time * 0.02, 4);
  deepPatch = smoothstep(0.55, 0.75, deepPatch);
  color = mix(color, TEAL_DEEP, deepPatch * 0.3 * complexity);

  // Scattered sand particles in water
  float particles = fbm(uv * 40.0 + time * 0.1, 2);
  particles = smoothstep(0.7, 0.9, particles);
  color += float3(0.1, 0.12, 0.08) * particles * 0.1;

  // Light sparkles on surface
  float sparkle = fbm(uv * 50.0 + time * 0.5, 2);
  sparkle = smoothstep(0.85, 0.95, sparkle);
  color += float3(0.3, 0.35, 0.3) * sparkle * 0.3;

  // Gentle vignette
  float2 center = float2(0.5 * aspect, 0.5);
  float vignette = 1.0 - length(uv - center) * 0.3;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
