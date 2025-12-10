/**
 * VibeMatrix4 - AERIAL REEF
 *
 * Turquoise ocean view from above with coral reef textures
 * (turquoise, cyan, teal, dark reef spots)
 */

export const VIBE_MATRIX_4_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Ocean palette
const float3 TURQUOISE = float3(0.25, 0.88, 0.82);
const float3 CYAN = float3(0.18, 0.75, 0.78);
const float3 TEAL_DEEP = float3(0.08, 0.55, 0.58);
const float3 REEF_DARK = float3(0.04, 0.25, 0.28);

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

// Organic reef shapes
float reefPattern(float2 uv, float time) {
  float2 p = uv * 8.0;

  float n1 = fbm(p + time * 0.1, 4);
  float n2 = fbm(p * 1.5 + float2(100.0, 0.0) - time * 0.08, 3);
  float n3 = fbm(p * 0.5 + time * 0.05, 5);

  // Create coral-like clusters
  float coral = smoothstep(0.4, 0.6, n1 * n2);
  coral *= smoothstep(0.3, 0.7, n3);

  return coral;
}

// Water caustics
float caustics(float2 uv, float time) {
  float2 p = uv * 12.0;

  float c1 = sin(p.x * 3.0 + time + noise(p) * 2.0);
  float c2 = sin(p.y * 3.0 - time * 0.7 + noise(p + 50.0) * 2.0);
  float c3 = sin((p.x + p.y) * 2.0 + time * 0.5);

  return (c1 * c2 * c3) * 0.5 + 0.5;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Slow drift
  float2 driftUV = uv + float2(sin(time * 0.1) * 0.1, cos(time * 0.08) * 0.1);

  // Base water color with depth variation
  float depth = fbm(driftUV * 3.0 + time * 0.05, 4);
  float3 waterColor = mix(TURQUOISE, CYAN, depth);
  waterColor = mix(waterColor, TEAL_DEEP, smoothstep(0.4, 0.7, depth));

  // Reef patterns (dark spots)
  float reef = reefPattern(driftUV, time);
  waterColor = mix(waterColor, REEF_DARK, reef * 0.7 * complexity);

  // Scattered dark reef clusters
  float clusters = fbm(uv * 15.0 + time * 0.02, 3);
  float darkSpots = smoothstep(0.55, 0.7, clusters);
  waterColor = mix(waterColor, REEF_DARK * 0.8, darkSpots * 0.5);

  // Water caustics (light ripples) - scaled down
  float caust = caustics(driftUV, time);
  waterColor += float3(0.1, 0.15, 0.12) * caust * 0.15;

  // Bright shallow areas (no multiplier > 1.0)
  float shallow = fbm(uv * 4.0 - time * 0.03, 3);
  shallow = smoothstep(0.5, 0.8, shallow);
  waterColor = mix(waterColor, TURQUOISE, shallow * 0.25);

  // Subtle foam/sediment
  float foam = fbm(uv * 20.0 + time * 0.1, 2);
  foam = smoothstep(0.6, 0.9, foam);
  waterColor += float3(0.15, 0.2, 0.18) * foam * 0.15;

  // Gentle vignette
  float2 center = float2(0.5 * aspect, 0.5);
  float vignette = 1.0 - length(uv - center) * 0.4;
  waterColor *= vignette;

  // Gamma correction for balanced output
  waterColor = pow(waterColor, float3(0.95));

  return half4(half3(waterColor), 1.0);
}
`;
