/**
 * VibeMatrix14 - TIDAL POOLS
 *
 * Interconnected pools of varying depth with rock edges
 * (deep teal, turquoise, cyan, dark rock)
 */

export const VIBE_MATRIX_14_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Tidal pool palette
const float3 DEEP_TEAL = float3(0.02, 0.28, 0.35);
const float3 TURQUOISE = float3(0.18, 0.68, 0.68);
const float3 CYAN_SHALLOW = float3(0.35, 0.85, 0.82);
const float3 ROCK_DARK = float3(0.08, 0.12, 0.14);
const float3 ALGAE = float3(0.05, 0.22, 0.18);

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

float2 hash2(float2 p) {
  p = float2(dot(p, float2(127.1, 311.7)), dot(p, float2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
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

// Voronoi for pool shapes
float2 voronoi(float2 p, float time) {
  float2 n = floor(p);
  float2 f = fract(p);

  float minDist = 1.0;
  float secondDist = 1.0;
  float cellId = 0.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      float2 g = float2(float(i), float(j));
      float2 o = hash2(n + g);

      // Animate slightly
      o = 0.5 + 0.4 * sin(time * 0.3 + 6.28 * o);

      float2 r = g + o - f;
      float d = dot(r, r);

      if (d < minDist) {
        secondDist = minDist;
        minDist = d;
        cellId = hash(n + g);
      } else if (d < secondDist) {
        secondDist = d;
      }
    }
  }

  return float2(sqrt(minDist), cellId);
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Create pool cells
  float2 vor = voronoi(uv * 5.0 * complexity, time);
  float poolDist = vor.x;
  float poolId = vor.y;

  // Larger pools
  float2 vorLarge = voronoi(uv * 3.0, time * 0.7);

  // Pool depth based on cell ID
  float depth = poolId;
  depth += fbm(uv * 4.0 + time * 0.05, 3) * 0.3;

  // Build pool colors
  float3 color = DEEP_TEAL;

  // Vary depth per pool
  color = mix(DEEP_TEAL, TURQUOISE, smoothstep(0.3, 0.6, depth));
  color = mix(color, CYAN_SHALLOW, smoothstep(0.6, 0.9, depth) * 0.7);

  // Rock edges (between pools)
  float edge = smoothstep(0.08, 0.15, poolDist);
  float rockEdge = 1.0 - edge;
  color = mix(color, ROCK_DARK, rockEdge * 0.9);

  // Add algae to some edges
  float algaeMask = fbm(uv * 10.0, 3);
  algaeMask = smoothstep(0.4, 0.6, algaeMask);
  color = mix(color, ALGAE, algaeMask * rockEdge * 0.6);

  // Water surface ripples inside pools
  float ripple = sin(poolDist * 40.0 - time * 2.0 + poolId * 10.0);
  ripple = ripple * 0.5 + 0.5;
  ripple *= edge; // Only inside pools
  color += float3(0.08, 0.12, 0.1) * ripple * 0.2;

  // Caustic light patterns
  float caustic = fbm(uv * 15.0 + time * 0.3, 3);
  caustic = smoothstep(0.4, 0.7, caustic);
  color += CYAN_SHALLOW * caustic * edge * 0.15;

  // Dark organic matter in deep pools
  float organic = fbm(uv * 8.0 + float2(50.0, 0.0), 4);
  organic = smoothstep(0.5, 0.7, organic);
  float deepMask = smoothstep(0.5, 0.3, depth);
  color = mix(color, DEEP_TEAL * 0.5, organic * deepMask * edge * 0.5);

  // Scattered debris/sediment
  float debris = fbm(uv * 25.0 + time * 0.05, 2);
  debris = smoothstep(0.7, 0.9, debris);
  color += float3(0.1, 0.12, 0.1) * debris * 0.1 * edge;

  // Subtle overall texture
  float tex = fbm(uv * 50.0, 2) * 0.03;
  color += tex;

  // Vignette
  float2 center = float2(0.5 * aspect, 0.5);
  float vignette = 1.0 - length(uv - center) * 0.35;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
