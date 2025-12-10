/**
 * VibeMatrix7 - OCEAN SHORE
 *
 * Where turquoise water meets sandy shore with fluid swirling
 * (turquoise, lavender, sandy beige, white foam)
 */

export const VIBE_MATRIX_7_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Shore palette
const float3 DEEP_BLUE = float3(0.15, 0.35, 0.55);
const float3 TURQUOISE = float3(0.25, 0.75, 0.72);
const float3 LAVENDER = float3(0.65, 0.58, 0.75);
const float3 SAND = float3(0.82, 0.72, 0.62);
const float3 FOAM = float3(0.95, 0.97, 0.98);

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

// Fluid mixing function
float2 fluidFlow(float2 uv, float time) {
  float2 flow = float2(
    fbm(uv * 2.0 + time * 0.2, 3),
    fbm(uv * 2.0 + float2(50.0, 0.0) - time * 0.15, 3)
  );
  return flow * 0.3;
}

// Marble/fluid swirl
float marbleSwirl(float2 uv, float time) {
  float2 p = uv * 3.0;

  // Add swirling motion
  float angle = fbm(p + time * 0.1, 3) * 6.28;
  p += float2(cos(angle), sin(angle)) * 0.3;

  float swirl = sin(p.x * 2.0 + fbm(p * 2.0, 4) * 4.0 + time * 0.3);
  swirl += sin(p.y * 1.5 + fbm(p * 1.5 + 100.0, 4) * 3.0 - time * 0.2);

  return swirl * 0.5 + 0.5;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Apply fluid flow distortion
  float2 flowedUV = uv + fluidFlow(uv, time);

  // Base gradient - diagonal shore
  float shoreGrad = uv.x * 0.4 + uv.y * 0.6;
  shoreGrad += fbm(flowedUV * 2.0 + time * 0.1, 4) * 0.3;

  // Marble swirling
  float swirl = marbleSwirl(flowedUV, time);

  // Zone mixing
  float waterZone = smoothstep(0.3, 0.5, shoreGrad);
  float sandZone = smoothstep(0.5, 0.7, shoreGrad);
  float lavenderZone = smoothstep(0.15, 0.35, shoreGrad) * (1.0 - waterZone);

  // Build color
  float3 color = DEEP_BLUE;

  // Add turquoise water
  color = mix(color, TURQUOISE, waterZone * swirl);

  // Add lavender tones (like in right reference image)
  color = mix(color, LAVENDER, lavenderZone * (1.0 - swirl) * 0.7);

  // Add sandy areas
  float sandMix = sandZone * fbm(flowedUV * 5.0, 3);
  color = mix(color, SAND, sandMix);

  // Flowing veins of different colors (no multiplier > 1.0)
  float veins = fbm(flowedUV * 8.0 + time * 0.15, 4);
  veins = smoothstep(0.4, 0.6, veins);
  color = mix(color, TURQUOISE, veins * waterZone * 0.35);
  color = mix(color, LAVENDER * 0.9, veins * lavenderZone * 0.3);

  // Foam edges
  float foam = fbm(flowedUV * 15.0 + time * 0.2, 3);
  foam = smoothstep(0.65, 0.85, foam);
  float foamMask = abs(shoreGrad - 0.5) < 0.15 ? 1.0 : 0.0;
  foamMask *= smoothstep(0.0, 0.1, abs(shoreGrad - 0.5));
  color = mix(color, FOAM, foam * foamMask * 0.6 * complexity);

  // Subtle texture (scaled down)
  float tex = fbm(uv * 30.0, 2) * 0.05;
  color += tex * 0.5;

  // Soft vignette
  float2 center = float2(0.5 * aspect, 0.5);
  float vignette = 1.0 - length(uv - center) * 0.3;
  color *= vignette;

  // Gamma correction for balanced output
  color = pow(color, float3(0.95));

  return half4(half3(color), 1.0);
}
`;
