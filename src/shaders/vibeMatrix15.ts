/**
 * VibeMatrix15 - SEAFOAM
 *
 * White foam patterns on deep teal water
 * (deep blue-teal, cyan, white foam, sea spray)
 */

export const VIBE_MATRIX_15_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Seafoam palette
const float3 DEEP_OCEAN = float3(0.02, 0.18, 0.28);
const float3 TEAL = float3(0.08, 0.42, 0.48);
const float3 CYAN = float3(0.18, 0.62, 0.68);
const float3 FOAM = float3(0.92, 0.95, 0.96);
const float3 SPRAY = float3(0.75, 0.85, 0.88);

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

// Turbulent foam pattern
float foamPattern(float2 uv, float time, float scale) {
  float2 p = uv * scale;

  // Moving foam
  p += float2(time * 0.1, time * 0.05);

  float n1 = fbm(p, 4);
  float n2 = fbm(p * 2.0 + 50.0, 3);
  float n3 = fbm(p * 0.5 + 100.0, 4);

  // Create foam clusters
  float foam = n1 * n2;
  foam = smoothstep(0.2, 0.5, foam);
  foam *= smoothstep(0.3, 0.6, n3);

  return foam;
}

// Wave pattern
float wavePattern(float2 uv, float time) {
  float wave = sin(uv.x * 8.0 + time + fbm(uv * 3.0, 3) * 2.0);
  wave += sin(uv.y * 6.0 - time * 0.7 + fbm(uv * 2.0 + 50.0, 3) * 2.0);
  wave *= 0.5;
  return wave * 0.5 + 0.5;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Warped UV for organic flow
  float2 warpedUV = uv;
  warpedUV += float2(
    fbm(uv * 2.0 + time * 0.1, 3) * 0.1,
    fbm(uv * 2.0 + 50.0 - time * 0.08, 3) * 0.1
  );

  // Base water depth
  float depth = fbm(warpedUV * 3.0 + time * 0.05, 4);

  // Build water color
  float3 color = DEEP_OCEAN;
  color = mix(color, TEAL, smoothstep(0.3, 0.6, depth));
  color = mix(color, CYAN, smoothstep(0.5, 0.8, depth) * 0.5);

  // Wave highlights
  float wave = wavePattern(warpedUV, time);
  color = mix(color, CYAN * 1.1, wave * 0.2);

  // Main foam patterns
  float foam1 = foamPattern(warpedUV, time, 8.0 * complexity);
  float foam2 = foamPattern(warpedUV + 30.0, time * 0.8, 12.0);
  float foam3 = foamPattern(warpedUV + 60.0, time * 1.2, 6.0);

  // Combine foam layers
  float totalFoam = max(foam1, foam2 * 0.7);
  totalFoam = max(totalFoam, foam3 * 0.5);

  // Apply foam
  color = mix(color, SPRAY, totalFoam * 0.6);
  color = mix(color, FOAM, smoothstep(0.5, 0.8, totalFoam) * 0.8);

  // Fine spray particles
  float spray = fbm(uv * 30.0 + time * 0.3, 2);
  spray = smoothstep(0.65, 0.85, spray);
  color = mix(color, FOAM, spray * 0.3 * complexity);

  // Foam bubble texture
  float bubbles = fbm(warpedUV * 40.0 + time * 0.2, 2);
  bubbles = smoothstep(0.6, 0.8, bubbles);
  color += FOAM * bubbles * totalFoam * 0.2;

  // Dark water showing through foam gaps
  float gaps = fbm(warpedUV * 15.0, 3);
  gaps = smoothstep(0.4, 0.6, gaps);
  color = mix(color, DEEP_OCEAN * 0.8, gaps * totalFoam * 0.3);

  // Subtle caustics in clear water
  float caustic = sin(warpedUV.x * 20.0 + time) * sin(warpedUV.y * 18.0 - time * 0.7);
  caustic = caustic * 0.5 + 0.5;
  color += CYAN * caustic * (1.0 - totalFoam) * 0.1;

  // Vignette
  float2 center = float2(0.5 * aspect, 0.5);
  float vignette = 1.0 - length(uv - center) * 0.35;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
