/**
 * VibeMatrix15 - CRYSTALLINE FACETS
 *
 * Geometric low-poly style with shifting colors
 * (gem tones: amethyst, sapphire, emerald, ruby)
 */

export const VIBE_MATRIX_15_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Hash for randomness
float2 hash2(float2 p) {
  p = float2(dot(p, float2(127.1, 311.7)), dot(p, float2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// Voronoi for crystalline facets
float3 voronoi(float2 x, float time) {
  float2 n = floor(x);
  float2 f = fract(x);

  float minDist = 1.0;
  float2 minPoint = float2(0.0);
  float cellId = 0.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      float2 neighbor = float2(float(i), float(j));
      float2 point = hash2(n + neighbor);

      // Subtle movement
      point = 0.5 + 0.4 * sin(time * 0.3 + 6.2831 * point);

      float2 diff = neighbor + point - f;
      float dist = length(diff);

      if (dist < minDist) {
        minDist = dist;
        minPoint = point;
        cellId = hash2(n + neighbor).x;
      }
    }
  }

  return float3(minDist, cellId, minPoint.x);
}

// Second pass for edges
float voronoiEdge(float2 x, float time) {
  float2 n = floor(x);
  float2 f = fract(x);

  float minDist1 = 1.0;
  float minDist2 = 1.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      float2 neighbor = float2(float(i), float(j));
      float2 point = hash2(n + neighbor);
      point = 0.5 + 0.4 * sin(time * 0.3 + 6.2831 * point);

      float2 diff = neighbor + point - f;
      float dist = length(diff);

      if (dist < minDist1) {
        minDist2 = minDist1;
        minDist1 = dist;
      } else if (dist < minDist2) {
        minDist2 = dist;
      }
    }
  }

  return minDist2 - minDist1;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(3.0, 8.0, u_complexity);

  // Background - deep dark
  float3 bgColor = float3(0.02, 0.02, 0.05);

  // Gem colors
  float3 amethyst = float3(0.58, 0.27, 0.71);
  float3 sapphire = float3(0.15, 0.23, 0.66);
  float3 emerald = float3(0.20, 0.57, 0.40);
  float3 ruby = float3(0.70, 0.11, 0.24);
  float3 diamond = float3(0.85, 0.88, 0.95);

  // Create crystalline pattern
  float2 scaledUV = uv * complexity;
  float3 vor = voronoi(scaledUV, time);
  float edge = voronoiEdge(scaledUV, time);

  // Second layer at different scale
  float2 scaledUV2 = uv * complexity * 0.5 + float2(100.0, 0.0);
  float3 vor2 = voronoi(scaledUV2, time * 0.7);
  float edge2 = voronoiEdge(scaledUV2, time * 0.7);

  // Color each cell based on its ID
  float cellHue = vor.y;
  float3 cellColor = amethyst;

  if (cellHue < 0.25) {
    cellColor = mix(amethyst, sapphire, cellHue * 4.0);
  } else if (cellHue < 0.5) {
    cellColor = mix(sapphire, emerald, (cellHue - 0.25) * 4.0);
  } else if (cellHue < 0.75) {
    cellColor = mix(emerald, ruby, (cellHue - 0.5) * 4.0);
  } else {
    cellColor = mix(ruby, amethyst, (cellHue - 0.75) * 4.0);
  }

  // Time-based color shift
  float colorShift = sin(time * 0.2 + vor.y * 6.28) * 0.5 + 0.5;
  cellColor = mix(cellColor, cellColor.zxy, colorShift * 0.3);

  // Facet shading - simulate light reflection
  float facetShade = 0.5 + vor.z * 0.5;
  facetShade *= 0.7 + sin(vor.y * 100.0 + time) * 0.3;

  // Edge highlighting
  float edgeFactor = smoothstep(0.0, 0.05, edge);
  float edgeFactor2 = smoothstep(0.0, 0.08, edge2);

  // Sparkle effect
  float sparkle = pow(1.0 - vor.x, 8.0) * (0.5 + 0.5 * sin(time * 5.0 + vor.y * 50.0));

  // Compose layers
  float3 color = bgColor;

  // Base facet color
  color = mix(bgColor, cellColor * facetShade, 0.8);

  // Second layer overlay
  float3 layer2Color = sapphire;
  if (vor2.y > 0.5) layer2Color = amethyst;
  color = mix(color, layer2Color * 0.5, (1.0 - edgeFactor2) * 0.3);

  // Edge glow
  float edgeGlow = (1.0 - edgeFactor) * 0.8;
  color = mix(color, diamond * 0.8, edgeGlow);

  // Sparkle
  color += diamond * sparkle * 0.5;

  // Depth effect - darker at edges of screen
  float depth = 1.0 - length(uv - float2(0.5 * aspect, 0.5)) * 0.4;
  color *= depth;

  // Subtle refraction lines
  float refraction = sin(uv.x * 50.0 + uv.y * 30.0 + time * 2.0) * 0.02;
  color += diamond * refraction;

  return half4(half3(color), 1.0);
}
`;
