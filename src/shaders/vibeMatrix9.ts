/**
 * VibeMatrix9 Shader - BLOB METABALLS
 *
 * Soft merging organic blobs - like liquid droplets
 * that attract and repel. Full screen orb energy.
 * (soft pastels: blush, lavender, peach, mint)
 */

export const VIBE_MATRIX_9_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Soft pastel palette
const float3 COLOR_BLUSH = float3(0.95, 0.75, 0.8);
const float3 COLOR_LAVENDER = float3(0.8, 0.75, 0.95);
const float3 COLOR_PEACH = float3(1.0, 0.85, 0.75);
const float3 COLOR_MINT = float3(0.75, 0.95, 0.85);

// Smooth minimum for blob merging
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// Single metaball contribution
float metaball(float2 p, float2 center, float radius) {
  float d = length(p - center);
  return radius / (d * d + 0.01);
}

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time * 0.0003;
  float2 center = float2(0.5 * aspect, 0.5);

  // Animated blob centers - orbiting and pulsing
  float2 blob1 = center + float2(sin(time * 0.7) * 0.25, cos(time * 0.8) * 0.2);
  float2 blob2 = center + float2(cos(time * 0.6) * 0.3, sin(time * 0.5) * 0.25);
  float2 blob3 = center + float2(sin(time * 0.9 + 2.0) * 0.2, cos(time * 0.7 + 1.0) * 0.3);
  float2 blob4 = center + float2(cos(time * 0.5 + 3.0) * 0.28, sin(time * 0.6 + 2.0) * 0.22);
  float2 blob5 = center + float2(sin(time * 0.4) * 0.15, cos(time * 0.9) * 0.18);

  // Pulsing radii
  float r1 = 0.08 + sin(time * 1.2) * 0.02;
  float r2 = 0.07 + cos(time * 1.0) * 0.015;
  float r3 = 0.09 + sin(time * 0.8 + 1.0) * 0.025;
  float r4 = 0.06 + cos(time * 1.1 + 2.0) * 0.02;
  float r5 = 0.1 + sin(time * 0.7) * 0.03;

  // Accumulate metaball field
  float field = 0.0;
  field += metaball(uv, blob1, r1);
  field += metaball(uv, blob2, r2);
  field += metaball(uv, blob3, r3);
  field += metaball(uv, blob4, r4);
  field += metaball(uv, blob5, r5);

  // Central blob (always present, larger)
  float centralPulse = 0.12 + sin(time * 0.5) * 0.03;
  field += metaball(uv, center, centralPulse) * 1.2;

  // Threshold for blob surface
  float threshold = 1.5;
  float blob = smoothstep(threshold - 0.3, threshold + 0.5, field);

  // Inner glow
  float innerGlow = smoothstep(threshold, threshold + 2.0, field);

  // Edge detection for rim
  float edge = smoothstep(threshold - 0.1, threshold, field) - smoothstep(threshold, threshold + 0.3, field);

  // Color based on field strength and position
  float colorMix = sin(field * 2.0 + time) * 0.5 + 0.5;
  float colorMix2 = cos(field * 1.5 - time * 0.5) * 0.5 + 0.5;

  // Base - soft gradient background
  float2 gradUV = uv - center;
  float gradAngle = atan(gradUV.y, gradUV.x);
  float bgGrad = sin(gradAngle * 2.0 + time * 0.3) * 0.5 + 0.5;

  half3 bgColor = mix(half3(COLOR_LAVENDER), half3(COLOR_MINT), half(bgGrad));
  bgColor = mix(bgColor, half3(COLOR_PEACH), half(0.3));
  bgColor *= 0.4; // Darken background

  // Blob color
  half3 blobColor = mix(half3(COLOR_BLUSH), half3(COLOR_LAVENDER), half(colorMix));
  blobColor = mix(blobColor, half3(COLOR_PEACH), half(colorMix2 * 0.5));

  // Add inner brightness
  blobColor += half3(0.15) * half(innerGlow);

  // Combine
  half3 color = mix(bgColor, blobColor, half(blob));

  // Rim highlight
  color += half3(1.0, 0.95, 0.98) * half(edge * 0.5);

  // Subtle glow around blobs
  float glow = smoothstep(threshold - 1.0, threshold - 0.1, field) * (1.0 - blob);
  color += half3(COLOR_BLUSH) * half(glow * 0.3);

  // Vignette
  float2 vigUV = xy / u_resolution;
  float vig = 1.0 - length((vigUV - 0.5) * 1.3);
  vig = smoothstep(0.0, 0.5, vig);
  color *= half(0.8 + 0.2 * vig);

  return half4(color, 1.0);
}
`;
