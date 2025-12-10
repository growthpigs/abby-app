/**
 * VibeMatrix18 - OCEAN CURRENTS
 *
 * Flowing streams of different blue-green tones
 * (deep blue, teal, turquoise, cyan streams)
 */

export const VIBE_MATRIX_18_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Ocean current palette
const float3 DEEP_BLUE = float3(0.02, 0.12, 0.25);
const float3 OCEAN_BLUE = float3(0.05, 0.28, 0.42);
const float3 TEAL = float3(0.08, 0.48, 0.52);
const float3 TURQUOISE = float3(0.18, 0.68, 0.68);
const float3 CYAN = float3(0.32, 0.82, 0.82);

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

// Flow field
float2 flowField(float2 p, float time) {
  float angle = fbm(p * 2.0 + time * 0.1, 4) * 6.28;
  return float2(cos(angle), sin(angle));
}

// Advect along flow
float2 advect(float2 uv, float time, float strength) {
  float2 pos = uv;

  for (int i = 0; i < 5; i++) {
    float2 flow = flowField(pos, time);
    pos += flow * strength * 0.02;
  }

  return pos;
}

// Current stream pattern
float currentStream(float2 uv, float time, float offset) {
  float2 p = uv * 3.0 + offset;

  // Flowing direction
  p.x += time * 0.2;
  p += float2(fbm(uv * 2.0 + offset, 3) * 0.5, fbm(uv * 2.0 + offset + 50.0, 3) * 0.3);

  float stream = sin(p.y * 4.0 + fbm(p * 2.0, 4) * 3.0);
  stream = smoothstep(-0.3, 0.3, stream);

  return stream;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Advect UV for organic flow
  float2 advectedUV = advect(uv, time, complexity);

  // Multiple current layers
  float current1 = currentStream(advectedUV, time, 0.0);
  float current2 = currentStream(advectedUV, time * 0.8, 30.0);
  float current3 = currentStream(advectedUV, time * 1.2, 60.0);
  float current4 = currentStream(advectedUV, time * 0.6, 90.0);

  // Base deep ocean
  float3 color = DEEP_BLUE;

  // Layer currents with different colors
  color = mix(color, OCEAN_BLUE, current1 * 0.7);
  color = mix(color, TEAL, current2 * 0.6);
  color = mix(color, TURQUOISE, current3 * 0.5);
  color = mix(color, CYAN, current4 * 0.4 * complexity);

  // Flowing veins
  float veins = fbm(advectedUV * 6.0 + time * 0.15, 4);
  veins = abs(veins - 0.5) * 2.0;
  veins = smoothstep(0.6, 0.8, veins);
  color = mix(color, CYAN * 0.9, veins * 0.25);

  // Deep dark organic patches
  float dark = fbm(advectedUV * 4.0 + float2(100.0, 50.0), 4);
  dark = smoothstep(0.55, 0.7, dark);
  color = mix(color, DEEP_BLUE * 0.5, dark * 0.5);

  // Scattered dark spots (like reef from above)
  float spots = fbm(uv * 15.0 + time * 0.02, 3);
  spots = smoothstep(0.65, 0.8, spots);
  color = mix(color, DEEP_BLUE * 0.3, spots * 0.4);

  // Bright current highlights
  float highlights = fbm(advectedUV * 8.0 + time * 0.3, 3);
  highlights = smoothstep(0.6, 0.8, highlights);
  color += CYAN * highlights * 0.15;

  // Surface light ripples
  float ripple = sin(advectedUV.x * 25.0 + time * 2.0) *
                 sin(advectedUV.y * 20.0 - time * 1.5);
  ripple = ripple * 0.5 + 0.5;
  color += float3(0.05, 0.1, 0.12) * ripple * 0.15;

  // Subtle foam traces
  float foam = fbm(uv * 20.0 + time * 0.2, 2);
  foam = smoothstep(0.75, 0.9, foam);
  color += float3(0.2, 0.25, 0.25) * foam * 0.15;

  // Vignette
  float2 center = float2(0.5 * aspect, 0.5);
  float vignette = 1.0 - length(uv - center) * 0.35;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
