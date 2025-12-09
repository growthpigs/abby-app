/**
 * VibeMatrix17 - CELLULAR MEMBRANE
 *
 * Organic cell-like structures with soft boundaries
 * (biological: salmon, sage, cream, coral)
 */

export const VIBE_MATRIX_17_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Hash function
float2 hash2(float2 p) {
  p = float2(dot(p, float2(127.1, 311.7)), dot(p, float2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// Smooth minimum for organic blending
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// Soft voronoi - cells with membrane edges
float4 softVoronoi(float2 x, float time) {
  float2 n = floor(x);
  float2 f = fract(x);

  float minDist1 = 8.0;
  float minDist2 = 8.0;
  float2 minPoint = float2(0.0);
  float cellId = 0.0;

  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      float2 neighbor = float2(float(i), float(j));
      float2 randPoint = hash2(n + neighbor);

      // Organic cell movement
      float2 point = 0.5 + 0.45 * sin(time * 0.4 * (randPoint - 0.5) + 6.2831 * randPoint);

      float2 diff = neighbor + point - f;
      float dist = length(diff);

      if (dist < minDist1) {
        minDist2 = minDist1;
        minDist1 = dist;
        minPoint = point;
        cellId = randPoint.x;
      } else if (dist < minDist2) {
        minDist2 = dist;
      }
    }
  }

  // Membrane thickness
  float membrane = minDist2 - minDist1;

  return float4(minDist1, membrane, cellId, minPoint.x);
}

// Organelle-like internal structures
float organelle(float2 uv, float2 center, float size, float time, float seed) {
  float2 delta = uv - center;
  float dist = length(delta);

  // Pulsing
  float pulse = 1.0 + sin(time * 2.0 + seed * 10.0) * 0.1;

  return smoothstep(size * pulse, size * pulse * 0.5, dist);
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(3.0, 7.0, u_complexity);

  // Background - warm cream
  float3 bgColor = float3(0.98, 0.96, 0.92);

  // Cell colors
  float3 salmon = float3(0.98, 0.70, 0.65);
  float3 sage = float3(0.68, 0.78, 0.65);
  float3 cream = float3(0.96, 0.92, 0.84);
  float3 coral = float3(0.95, 0.55, 0.50);
  float3 membrane = float3(0.35, 0.30, 0.28);

  // Create cell pattern
  float2 scaledUV = uv * complexity;
  float4 cells = softVoronoi(scaledUV, time);

  // Second layer - smaller cells
  float2 scaledUV2 = uv * complexity * 1.8 + 50.0;
  float4 cells2 = softVoronoi(scaledUV2, time * 0.8);

  // Cell interior color based on ID
  float3 cellColor = salmon;
  float cellHue = cells.z;

  if (cellHue < 0.33) {
    cellColor = mix(salmon, sage, cellHue * 3.0);
  } else if (cellHue < 0.66) {
    cellColor = mix(sage, cream, (cellHue - 0.33) * 3.0);
  } else {
    cellColor = mix(cream, coral, (cellHue - 0.66) * 3.0);
  }

  // Membrane rendering
  float membraneThickness = 0.15;
  float membraneAlpha = smoothstep(membraneThickness, 0.0, cells.y);

  // Inner membrane glow
  float innerGlow = smoothstep(0.3, 0.0, cells.y) * 0.5;

  // Cell interior shading (cytoplasm effect)
  float cytoplasm = 1.0 - cells.x * 0.3;
  cytoplasm *= 0.7 + cells.w * 0.3;

  // Small organelles inside cells
  float3 organelleColor = float3(0.0);
  float organelleAlpha = 0.0;

  // Only show organelles inside cells (not on membrane)
  if (cells.y > membraneThickness) {
    // Nucleus-like structure
    float2 nucleusCenter = floor(scaledUV) + 0.5 + hash2(floor(scaledUV)) * 0.3 - 0.15;
    nucleusCenter += sin(time * 0.5 + hash2(floor(scaledUV)) * 6.28) * 0.1;
    float nucleus = organelle(scaledUV, nucleusCenter, 0.15, time, cells.z);
    organelleColor = mix(coral, salmon, 0.5) * 0.8;
    organelleAlpha = nucleus * 0.6;
  }

  // Compose layers
  float3 color = bgColor;

  // Base cell color with cytoplasm shading
  color = mix(bgColor, cellColor * cytoplasm, 0.9);

  // Organelles
  color = mix(color, organelleColor, organelleAlpha);

  // Inner glow near membrane
  color = mix(color, cellColor * 1.2, innerGlow * 0.3);

  // Membrane
  color = mix(color, membrane, membraneAlpha * 0.7);

  // Overlay smaller cells with transparency
  float membrane2Alpha = smoothstep(0.1, 0.0, cells2.y) * 0.3;
  color = mix(color, membrane * 0.8, membrane2Alpha);

  // Subtle animation highlight
  float highlight = sin(cells.z * 20.0 + time * 2.0) * 0.5 + 0.5;
  color += float3(0.05) * highlight * (1.0 - membraneAlpha);

  // Soft vignette
  float vignette = 1.0 - length(uv - float2(0.5 * aspect, 0.5)) * 0.25;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
