/**
 * VibeMatrix18 - AURORA CURTAINS
 *
 * Vertical flowing curtains of light
 * (aurora: electric green, violet, teal, pink)
 */

export const VIBE_MATRIX_18_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Simplex noise
float3 mod289(float3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float2 mod289(float2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float3 permute(float3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(float2 v) {
  const float4 C = float4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  float2 i = floor(v + dot(v, C.yy));
  float2 x0 = v - i + dot(i, C.xx);
  float2 i1;
  i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
  float4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0)) + i.x + float3(0.0, i1.x, 1.0));
  float3 m = max(0.5 - float3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  float3 x = 2.0 * fract(p * C.www) - 1.0;
  float3 h = abs(x) - 0.5;
  float3 ox = floor(x + 0.5);
  float3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  float3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// fBM
float fbm(float2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 5; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

// Aurora curtain band
float auroraBand(float2 uv, float offset, float time, float complexity) {
  // Vertical wave with horizontal drift
  float wave = sin(uv.x * 8.0 * complexity + time * 0.5 + offset * 6.28);
  wave += sin(uv.x * 12.0 * complexity - time * 0.3 + offset * 4.0) * 0.5;
  wave += sin(uv.x * 4.0 * complexity + time * 0.7 + offset * 2.0) * 0.3;
  wave *= 0.15;

  // Base position with noise displacement
  float baseY = 0.5 + offset * 0.25 + wave;
  baseY += fbm(float2(uv.x * 3.0, time * 0.2 + offset), 3) * 0.1;

  // Curtain shape - vertical fade
  float dist = abs(uv.y - baseY);
  float curtain = smoothstep(0.25, 0.0, dist);

  // Flickering intensity
  float flicker = 0.7 + 0.3 * sin(time * 3.0 + uv.x * 20.0 + offset * 10.0);
  flicker *= 0.8 + 0.2 * sin(time * 7.0 + offset * 5.0);

  // Vertical streaks
  float streaks = sin(uv.x * 50.0 * complexity + time * 2.0 + offset * 20.0);
  streaks = pow(abs(streaks), 3.0) * 0.5;

  return curtain * flicker * (1.0 + streaks);
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Night sky background
  float3 skyTop = float3(0.02, 0.02, 0.08);
  float3 skyBottom = float3(0.05, 0.03, 0.10);
  float3 bg = mix(skyBottom, skyTop, uv.y);

  // Add stars
  float2 starUV = uv * 50.0;
  float stars = step(0.98, fract(sin(dot(floor(starUV), float2(12.9898, 78.233))) * 43758.5453));
  stars *= 0.5 + 0.5 * sin(time * 2.0 + dot(floor(starUV), float2(1.0, 1.0)) * 10.0);
  bg += float3(stars * 0.3);

  // Aurora colors
  float3 electricGreen = float3(0.2, 1.0, 0.4);
  float3 violet = float3(0.6, 0.2, 0.8);
  float3 teal = float3(0.2, 0.8, 0.8);
  float3 pink = float3(1.0, 0.4, 0.7);

  // Multiple aurora bands
  float band1 = auroraBand(uv, 0.0, time, complexity);
  float band2 = auroraBand(uv, 0.3, time * 0.9, complexity);
  float band3 = auroraBand(uv, -0.2, time * 1.1, complexity);
  float band4 = auroraBand(uv, 0.5, time * 0.8, complexity);

  // Color each band
  float colorWave = sin(uv.x * 5.0 + time * 0.3);
  float colorWave2 = cos(uv.x * 3.0 - time * 0.2);

  float3 color1 = mix(electricGreen, teal, colorWave * 0.5 + 0.5);
  float3 color2 = mix(violet, pink, colorWave2 * 0.5 + 0.5);
  float3 color3 = mix(teal, electricGreen, (colorWave + colorWave2) * 0.25 + 0.5);
  float3 color4 = mix(pink, violet, colorWave * 0.5 + 0.5);

  // Compose
  float3 color = bg;

  // Add glow underneath aurora
  float glowBase = max(max(band1, band2), max(band3, band4));
  float3 glowColor = mix(electricGreen, violet, 0.5) * 0.15;
  color += glowColor * smoothstep(0.0, 0.5, glowBase);

  // Layer bands with additive blending
  color += color1 * band1 * 0.6;
  color += color2 * band2 * 0.5;
  color += color3 * band3 * 0.4;
  color += color4 * band4 * 0.3;

  // Bright core highlights
  float core1 = pow(band1, 3.0);
  float core2 = pow(band2, 3.0);
  color += float3(1.0, 1.0, 0.9) * core1 * 0.4;
  color += float3(1.0, 0.9, 1.0) * core2 * 0.3;

  // Atmospheric haze at horizon
  float haze = smoothstep(0.0, 0.3, uv.y);
  float3 hazeColor = mix(float3(0.1, 0.15, 0.2), float3(0.0), haze);
  color = mix(hazeColor, color, haze * 0.8 + 0.2);

  // Subtle vignette
  float vignette = 1.0 - length(uv - float2(0.5, 0.5)) * 0.3;
  color *= vignette;

  // HDR tone mapping
  color = color / (color + 1.0);

  return half4(half3(color), 1.0);
}
`;
