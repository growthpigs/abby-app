/**
 * VibeMatrix11 Shader - LAYERED ORBS
 *
 * Multiple transparent orb layers at different depths,
 * creating parallax depth illusion. William Mapan layering.
 * (ocean depths: deep blue, teal, aquamarine, seafoam)
 */

export const VIBE_MATRIX_11_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Ocean depth palette
const float3 COLOR_DEEP = float3(0.05, 0.1, 0.2);
const float3 COLOR_TEAL = float3(0.1, 0.4, 0.5);
const float3 COLOR_AQUA = float3(0.2, 0.6, 0.7);
const float3 COLOR_FOAM = float3(0.7, 0.9, 0.95);

// Simplex noise
float3 mod289_3(float3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float2 mod289_2(float2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float3 permute(float3 x) { return mod289_3(((x * 34.0) + 1.0) * x); }

float snoise(float2 v) {
  const float4 C = float4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  float2 i = floor(v + dot(v, C.yy));
  float2 x0 = v - i + dot(i, C.xx);
  float2 i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
  float4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289_2(i);
  float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0)) + i.x + float3(0.0, i1.x, 1.0));
  float3 m = max(0.5 - float3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  float3 x = 2.0 * fract(p * C.www) - 1.0;
  float3 h = abs(x) - 0.5;
  float3 ox = floor(x + 0.5);
  float3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  float3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Single orb layer with soft edge
float orbLayer(float2 uv, float2 center, float radius, float softness) {
  float dist = length(uv - center);
  float orb = 1.0 - smoothstep(radius - softness, radius + softness, dist);
  return orb;
}

// Orb with distorted edge
float distortedOrb(float2 uv, float2 center, float radius, float time, float noiseScale) {
  float2 delta = uv - center;
  float angle = atan(delta.y, delta.x);
  float dist = length(delta);

  // Noise-based edge distortion
  float noise = snoise(float2(angle * 3.0, time * 0.5) * noiseScale) * 0.15;
  float distortedRadius = radius + noise * radius;

  float orb = 1.0 - smoothstep(distortedRadius * 0.8, distortedRadius * 1.2, dist);
  return orb;
}

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time * 0.00025;
  float2 center = float2(0.5 * aspect, 0.5);

  // Layer 1 - Deepest, largest, slowest
  float2 center1 = center + float2(sin(time * 0.2) * 0.05, cos(time * 0.15) * 0.03);
  float orb1 = distortedOrb(uv, center1, 0.55, time * 0.5, 1.0);

  // Layer 2 - Medium depth
  float2 center2 = center + float2(cos(time * 0.3) * 0.08, sin(time * 0.25) * 0.06);
  float orb2 = distortedOrb(uv, center2, 0.4, time * 0.7, 1.5);

  // Layer 3 - Shallower
  float2 center3 = center + float2(sin(time * 0.4) * 0.1, cos(time * 0.35) * 0.08);
  float orb3 = distortedOrb(uv, center3, 0.3, time * 0.9, 2.0);

  // Layer 4 - Near surface
  float2 center4 = center + float2(cos(time * 0.5) * 0.12, sin(time * 0.45) * 0.1);
  float orb4 = distortedOrb(uv, center4, 0.22, time * 1.1, 2.5);

  // Layer 5 - Topmost, smallest, fastest
  float2 center5 = center + float2(sin(time * 0.6) * 0.15, cos(time * 0.55) * 0.12);
  float orb5 = distortedOrb(uv, center5, 0.15, time * 1.3, 3.0);

  // Start with deep background
  half3 color = half3(COLOR_DEEP);

  // Composite layers back to front with transparency
  // Layer 1 - deepest blue
  half3 layer1Color = half3(COLOR_DEEP) * 1.5;
  color = mix(color, layer1Color, half(orb1 * 0.3));

  // Layer 2 - teal
  half3 layer2Color = half3(COLOR_TEAL);
  color = mix(color, layer2Color, half(orb2 * 0.4));

  // Layer 3 - aqua
  half3 layer3Color = half3(COLOR_AQUA);
  color = mix(color, layer3Color, half(orb3 * 0.5));

  // Layer 4 - light aqua
  half3 layer4Color = mix(half3(COLOR_AQUA), half3(COLOR_FOAM), half(0.5));
  color = mix(color, layer4Color, half(orb4 * 0.6));

  // Layer 5 - seafoam (brightest)
  half3 layer5Color = half3(COLOR_FOAM);
  color = mix(color, layer5Color, half(orb5 * 0.7));

  // Add rim lighting on each layer
  float rim1 = orb1 * (1.0 - smoothstep(0.0, 0.1, orbLayer(uv, center1, 0.5, 0.05)));
  float rim3 = orb3 * (1.0 - smoothstep(0.0, 0.1, orbLayer(uv, center3, 0.25, 0.03)));
  float rim5 = orb5 * (1.0 - smoothstep(0.0, 0.1, orbLayer(uv, center5, 0.12, 0.02)));

  color += half3(COLOR_FOAM) * half(rim1 * 0.1 + rim3 * 0.2 + rim5 * 0.3);

  // Overall glow from center
  float dist = length(uv - center);
  float centralGlow = exp(-dist * 2.0) * 0.3;
  color += half3(COLOR_FOAM) * half(centralGlow);

  // Subtle caustic pattern
  float caustic = snoise(uv * 8.0 + time * 2.0) * 0.5 + 0.5;
  caustic = pow(caustic, 3.0);
  color += half3(COLOR_FOAM) * half(caustic * 0.1 * (orb2 + orb3));

  // Vignette
  float2 vigUV = xy / u_resolution;
  float vig = 1.0 - length((vigUV - 0.5) * 1.4);
  vig = smoothstep(0.0, 0.5, vig);
  color *= half(0.75 + 0.25 * vig);

  return half4(color, 1.0);
}
`;
