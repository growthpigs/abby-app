/**
 * VibeMatrix11 - CORAL REEF TEXTURE
 *
 * Varied turquoise tones with organic coral shapes
 * (aqua, turquoise, teal, dark reef patches)
 */

export const VIBE_MATRIX_11_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Coral reef palette
const float3 AQUA_LIGHT = float3(0.45, 0.92, 0.88);
const float3 TURQUOISE = float3(0.22, 0.78, 0.75);
const float3 TEAL_MID = float3(0.12, 0.58, 0.58);
const float3 REEF_DARK = float3(0.02, 0.22, 0.25);
const float3 CORAL_HINT = float3(0.08, 0.35, 0.32);

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

// Voronoi for coral cell structure
float voronoi(float2 p) {
  float2 n = floor(p);
  float2 f = fract(p);

  float minDist = 1.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      float2 g = float2(float(i), float(j));
      float2 o = hash2(n + g);
      float2 r = g + o - f;
      float d = dot(r, r);
      minDist = min(minDist, d);
    }
  }

  return sqrt(minDist);
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Slow organic drift
  float2 driftUV = uv + float2(
    sin(time * 0.08) * 0.1 + fbm(uv * 2.0, 2) * 0.05,
    cos(time * 0.06) * 0.1 + fbm(uv * 2.0 + 50.0, 2) * 0.05
  );

  // Multi-scale noise layers
  float n1 = fbm(driftUV * 4.0 + time * 0.05, 5);
  float n2 = fbm(driftUV * 8.0 - time * 0.03, 4);
  float n3 = fbm(driftUV * 2.0 + time * 0.02, 4);

  // Voronoi coral structure
  float vor = voronoi(driftUV * 6.0 * complexity);
  float vorLarge = voronoi(driftUV * 3.0);

  // Base gradient
  float3 color = mix(TURQUOISE, AQUA_LIGHT, n3);

  // Add teal mid-tones
  color = mix(color, TEAL_MID, smoothstep(0.4, 0.6, n1) * 0.5);

  // Coral reef dark patches
  float darkPatch = n1 * n2;
  darkPatch = smoothstep(0.35, 0.5, darkPatch);
  color = mix(color, REEF_DARK, darkPatch * 0.8);

  // Scattered smaller dark spots
  float spots = fbm(uv * 20.0 + time * 0.02, 3);
  spots = smoothstep(0.6, 0.75, spots);
  color = mix(color, REEF_DARK * 0.7, spots * 0.4 * complexity);

  // Coral cell edges
  float edges = smoothstep(0.0, 0.15, vor);
  color *= 0.85 + edges * 0.15;

  // Bright shallow patches
  float shallow = smoothstep(0.6, 0.8, n3);
  color = mix(color, AQUA_LIGHT * 1.15, shallow * 0.4);

  // Large coral formations
  float formations = smoothstep(0.2, 0.4, vorLarge);
  color = mix(color, CORAL_HINT, (1.0 - formations) * 0.3 * darkPatch);

  // Light caustics
  float caustic = sin(driftUV.x * 20.0 + time + n1 * 3.0) *
                  sin(driftUV.y * 18.0 - time * 0.7 + n2 * 3.0);
  caustic = caustic * 0.5 + 0.5;
  color += float3(0.08, 0.12, 0.1) * caustic * 0.2 * (1.0 - darkPatch);

  // Subtle sediment texture
  float tex = fbm(uv * 40.0, 2);
  color += float3(tex * 0.03);

  // Gentle vignette
  float2 center = float2(0.5 * aspect, 0.5);
  float vignette = 1.0 - length(uv - center) * 0.35;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
