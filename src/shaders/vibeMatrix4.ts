/**
 * VibeMatrix4 Shader - CELLULAR DREAMS
 *
 * Organic Voronoi cells with soft edges and morphing boundaries
 * (mint, teal, seafoam, lavender)
 */

export const VIBE_MATRIX_4_SHADER = `
// Uniforms
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Soft oceanic color palette
const float3 COLOR_MINT = float3(0.4, 0.9, 0.7);
const float3 COLOR_TEAL = float3(0.1, 0.6, 0.7);
const float3 COLOR_SEAFOAM = float3(0.6, 0.95, 0.85);
const float3 COLOR_LAVENDER = float3(0.7, 0.5, 0.9);

// ============================================
// HASH FUNCTIONS
// ============================================

float2 hash2(float2 p) {
  p = float2(dot(p, float2(127.1, 311.7)), dot(p, float2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float hash1(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

// ============================================
// SMOOTH VORONOI
// Returns (distance to edge, cell ID)
// ============================================

float2 voronoi(float2 x, float time) {
  float2 n = floor(x);
  float2 f = fract(x);

  float2 mg, mr;
  float md = 8.0;

  // Find closest cell center
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      float2 g = float2(float(i), float(j));
      float2 o = hash2(n + g);

      // Animate cell centers
      o = 0.5 + 0.5 * sin(time * 0.5 + 6.2831 * o);

      float2 r = g + o - f;
      float d = dot(r, r);

      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }

  // Find distance to edge
  md = 8.0;
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      float2 g = mg + float2(float(i), float(j));
      float2 o = hash2(n + g);
      o = 0.5 + 0.5 * sin(time * 0.5 + 6.2831 * o);

      float2 r = g + o - f;

      if (dot(mr - r, mr - r) > 0.00001) {
        md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
      }
    }
  }

  float cellId = hash1(n + mg);
  return float2(md, cellId);
}

// ============================================
// SMOOTH NOISE
// ============================================

float snoise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);

  float2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash1(i + float2(0.0, 0.0)), hash1(i + float2(1.0, 0.0)), u.x),
    mix(hash1(i + float2(0.0, 1.0)), hash1(i + float2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(float2 p, float octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float maxValue = 0.0;

  for (float i = 0.0; i < 5.0; i += 1.0) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value / maxValue;
}

// ============================================
// MAIN SHADER
// ============================================

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time * 0.0003;
  float octaves = 1.0 + u_complexity * 3.0;

  // Scale for voronoi
  float2 cellUV = uv * (3.0 + u_complexity * 2.0);

  // Add slow drift
  cellUV += float2(sin(time * 0.3) * 0.5, cos(time * 0.4) * 0.5);

  // Get voronoi values
  float2 vor = voronoi(cellUV, time);
  float edge = vor.x;
  float cellId = vor.y;

  // Second layer of smaller cells
  float2 cellUV2 = uv * (6.0 + u_complexity * 3.0);
  cellUV2 += float2(cos(time * 0.2) * 0.3, sin(time * 0.25) * 0.3);
  float2 vor2 = voronoi(cellUV2, time * 1.3);

  // Noise for color variation
  float n1 = fbm(uv * 2.0 + time * 0.2, octaves);
  float n2 = fbm(uv * 3.0 - time * 0.15, octaves * 0.7);

  // Base color from cell ID
  half3 color;
  if (cellId < 0.25) {
    color = half3(COLOR_MINT);
  } else if (cellId < 0.5) {
    color = half3(COLOR_TEAL);
  } else if (cellId < 0.75) {
    color = half3(COLOR_SEAFOAM);
  } else {
    color = half3(COLOR_LAVENDER);
  }

  // Blend colors smoothly
  color = mix(color, half3(COLOR_TEAL), half(n1 * 0.4));
  color = mix(color, half3(COLOR_SEAFOAM), half(n2 * 0.3));

  // Soft edge glow
  float edgeGlow = smoothstep(0.0, 0.15, edge);
  float edgeHighlight = 1.0 - smoothstep(0.0, 0.05, edge);

  // Apply edge effects
  color *= half(0.7 + edgeGlow * 0.3);
  color += half3(0.2, 0.4, 0.5) * half(edgeHighlight * 0.4);

  // Add subtle second layer
  float edge2 = smoothstep(0.0, 0.08, vor2.x);
  color *= half(0.85 + edge2 * 0.15);

  // Inner glow per cell
  float innerGlow = 1.0 - edge * 2.0;
  innerGlow = max(0.0, innerGlow);
  color += half3(COLOR_SEAFOAM) * half(innerGlow * 0.2);

  // Breathing effect
  float breathe = sin(time * 2.0 + cellId * 6.28) * 0.5 + 0.5;
  color *= half(0.9 + breathe * 0.1);

  // Gamma and saturation boost
  color = pow(color, half3(0.9));
  color *= 1.1;

  // Vignette
  float2 vignetteUV = xy / u_resolution;
  float vignette = 1.0 - length((vignetteUV - 0.5) * 1.3);
  vignette = smoothstep(0.0, 0.6, vignette);
  color *= half(0.75 + 0.25 * vignette);

  return half4(color, 1.0);
}
`;
