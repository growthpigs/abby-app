/**
 * VibeMatrix2 Shader - WARM FIRE SWIRLS
 *
 * Multiple drifting swirl centers with warm colors
 * (reds, oranges, yellows, magentas)
 */

export const VIBE_MATRIX_2_SHADER = `
// Uniforms
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Warm color palette - fire/sunset
const float3 COLOR_RED = float3(0.9, 0.15, 0.1);
const float3 COLOR_ORANGE = float3(1.0, 0.5, 0.1);
const float3 COLOR_YELLOW = float3(1.0, 0.85, 0.2);
const float3 COLOR_MAGENTA = float3(0.85, 0.1, 0.5);

// ============================================
// SIMPLEX NOISE (2D)
// ============================================

float3 mod289_3(float3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float2 mod289_2(float2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float3 permute(float3 x) {
  return mod289_3(((x * 34.0) + 1.0) * x);
}

float snoise(float2 v) {
  const float4 C = float4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );

  float2 i = floor(v + dot(v, C.yy));
  float2 x0 = v - i + dot(i, C.xx);

  float2 i1;
  i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
  float4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289_2(i);
  float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0))
                    + i.x + float3(0.0, i1.x, 1.0));

  float3 m = max(0.5 - float3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

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

// ============================================
// MULTI-SWIRL - Multiple drifting vortex centers
// ============================================

float2 multiSwirl(float2 uv, float time) {
  float2 result = uv;

  // 4 drifting swirl centers with different speeds and directions
  float2 center1 = float2(0.3 + sin(time * 0.15) * 0.4, 0.4 + cos(time * 0.2) * 0.3);
  float2 center2 = float2(0.7 + cos(time * 0.18) * 0.3, 0.6 + sin(time * 0.12) * 0.4);
  float2 center3 = float2(0.5 + sin(time * 0.22) * 0.35, 0.3 + cos(time * 0.16) * 0.35);
  float2 center4 = float2(0.4 + cos(time * 0.14) * 0.3, 0.7 + sin(time * 0.19) * 0.3);

  // Apply each swirl with different strengths and directions
  for (int i = 0; i < 4; i++) {
    float2 center;
    float strength;
    float dir;

    if (i == 0) { center = center1; strength = 1.5; dir = 1.0; }
    else if (i == 1) { center = center2; strength = 1.2; dir = -1.0; }  // Counter-clockwise
    else if (i == 2) { center = center3; strength = 1.8; dir = 1.0; }
    else { center = center4; strength = 1.0; dir = -1.0; }  // Counter-clockwise

    float2 delta = result - center;
    float dist = length(delta);
    float angle = dir * strength / (dist + 0.3) + time * 0.3 * dir;
    float c = cos(angle);
    float s = sin(angle);

    // Blend influence based on distance
    float influence = smoothstep(0.8, 0.0, dist);
    float2 swirled = float2(c * delta.x - s * delta.y, s * delta.x + c * delta.y) + center;
    result = mix(result, swirled, influence * 0.6);
  }

  return result;
}

// ============================================
// fBM for texture
// ============================================

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

  float time = u_time * 0.00025;  // Medium speed
  float octaves = 1.0 + u_complexity * 4.0;

  // Apply multi-swirl distortion
  float2 swirledUV = multiSwirl(uv, time);

  // Add some turbulence
  float2 turbulence = float2(
    snoise(swirledUV * 3.0 + time * 0.5),
    snoise(swirledUV * 3.0 + time * 0.5 + 100.0)
  );
  swirledUV += turbulence * 0.08;

  // Sample noise for color mixing
  float n1 = fbm(swirledUV * 2.5, octaves);
  float n2 = fbm(swirledUV * 1.5 + time, octaves * 0.7);
  float n3 = fbm(swirledUV * 4.0 - time * 0.5, octaves * 0.5);

  n1 = n1 * 0.5 + 0.5;
  n2 = n2 * 0.5 + 0.5;
  n3 = n3 * 0.5 + 0.5;

  // Mix warm colors based on noise
  half3 color = mix(half3(COLOR_RED), half3(COLOR_ORANGE), half(n1));
  color = mix(color, half3(COLOR_YELLOW), half(n2 * 0.6));
  color = mix(color, half3(COLOR_MAGENTA), half(n3 * 0.4));

  // Boost saturation and brightness
  color = pow(color, half3(0.9));
  color *= 1.1;

  // Subtle vignette
  float2 vignetteUV = xy / u_resolution;
  float vignette = 1.0 - length((vignetteUV - 0.5) * 1.3);
  vignette = smoothstep(0.0, 0.6, vignette);
  color *= half(0.8 + 0.2 * vignette);

  return half4(color, 1.0);
}
`;
