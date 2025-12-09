/**
 * VibeMatrix16 - INK BLOOM
 *
 * Organic ink spreading in water effect
 * (ink wash: indigo, burgundy, gold, ivory)
 */

export const VIBE_MATRIX_16_SHADER = `
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

// fBM with turbulence
float fbm(float2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

// Ink drop with organic spread
float inkDrop(float2 uv, float2 center, float size, float time, float seed) {
  float2 delta = uv - center;
  float dist = length(delta);

  // Organic edge distortion
  float angle = atan2(delta.y, delta.x);
  float edgeNoise = fbm(float2(angle * 3.0 + seed, time * 0.5), 4) * 0.3;

  // Spreading over time with noise
  float spread = size * (1.0 + fbm(uv * 2.0 + seed, 3) * 0.5);

  // Ink density
  float ink = smoothstep(spread + edgeNoise, spread * 0.3, dist);

  // Feathered edges
  float feather = smoothstep(spread + 0.1 + edgeNoise, spread, dist);

  return ink * 0.8 + feather * 0.2;
}

// Flowing water distortion
float2 waterFlow(float2 uv, float time) {
  float2 flow = float2(
    snoise(uv * 1.5 + time * 0.2),
    snoise(uv * 1.5 + 100.0 + time * 0.15)
  ) * 0.15;
  return uv + flow;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.6, 1.4, u_complexity);

  // Apply water flow distortion
  float2 flowedUV = waterFlow(uv, time);

  // Background - warm ivory paper
  float paperNoise = fbm(uv * 10.0, 3) * 0.05;
  float3 paper = float3(0.96, 0.94, 0.88) + paperNoise;

  // Ink colors
  float3 indigo = float3(0.15, 0.12, 0.35);
  float3 burgundy = float3(0.45, 0.10, 0.18);
  float3 gold = float3(0.72, 0.55, 0.20);
  float3 black = float3(0.05, 0.05, 0.08);

  // Multiple ink drops with different colors
  // Drop 1 - indigo, large central
  float2 center1 = float2(0.5 * aspect, 0.5);
  center1 += float2(sin(time * 0.2) * 0.1, cos(time * 0.15) * 0.1);
  float drop1 = inkDrop(flowedUV, center1, 0.35 * complexity, time, 0.0);

  // Drop 2 - burgundy, offset
  float2 center2 = float2(0.3 * aspect, 0.6);
  center2 += float2(cos(time * 0.25) * 0.08, sin(time * 0.2) * 0.08);
  float drop2 = inkDrop(flowedUV, center2, 0.25 * complexity, time, 10.0);

  // Drop 3 - gold accents
  float2 center3 = float2(0.65 * aspect, 0.4);
  center3 += float2(sin(time * 0.18) * 0.06, cos(time * 0.22) * 0.06);
  float drop3 = inkDrop(flowedUV, center3, 0.2 * complexity, time, 20.0);

  // Drop 4 - black, smaller accent
  float2 center4 = float2(0.45 * aspect, 0.7);
  center4 += float2(cos(time * 0.3) * 0.05, sin(time * 0.25) * 0.05);
  float drop4 = inkDrop(flowedUV, center4, 0.15 * complexity, time, 30.0);

  // Color mixing with layering
  float3 color = paper;

  // Layer drops with varying opacity (watercolor effect)
  color = mix(color, indigo, drop1 * 0.7);
  color = mix(color, burgundy, drop2 * 0.6);
  color = mix(color, gold, drop3 * 0.5);
  color = mix(color, black, drop4 * 0.8);

  // Bleeding edges where colors meet
  float bleed = max(drop1, drop2) * max(drop2, drop3) * 0.5;
  float3 bleedColor = mix(indigo, burgundy, 0.5);
  color = mix(color, bleedColor, bleed * 0.3);

  // Water stain rings
  float stain1 = abs(sin(length(flowedUV - center1) * 20.0 - time * 2.0)) * drop1;
  float stain2 = abs(sin(length(flowedUV - center2) * 15.0 - time * 1.5)) * drop2;
  color += float3(0.1, 0.08, 0.05) * (stain1 + stain2) * 0.2;

  // Granulation effect (pigment settling)
  float grain = fbm(uv * 30.0 + time * 0.1, 2);
  float inkTotal = drop1 + drop2 + drop3 + drop4;
  color += float3(grain * 0.05) * inkTotal;

  // Paper texture overlay
  float paperTex = fbm(uv * 50.0, 2) * 0.03;
  color += paperTex * (1.0 - inkTotal * 0.5);

  // Subtle vignette
  float vignette = 1.0 - length(uv - float2(0.5 * aspect, 0.5)) * 0.3;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
