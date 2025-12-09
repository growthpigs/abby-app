/**
 * VibeMatrix14 - MAGNETIC FIELD LINES
 *
 * Curved field lines like iron filings around magnets
 * (earth tones: copper, bronze, forest, cream)
 */

export const VIBE_MATRIX_14_SHADER = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;

// Simplex noise for field distortion
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

// Magnetic field from a pole
float2 magneticField(float2 p, float2 pole, float strength) {
  float2 delta = p - pole;
  float dist = length(delta) + 0.1;
  return normalize(delta) * strength / (dist * dist);
}

// Trace a field line
float fieldLine(float2 uv, float time, float complexity) {
  float acc = 0.0;

  // Two magnetic poles that orbit
  float2 pole1 = float2(
    0.3 + sin(time * 0.2) * 0.15,
    0.5 + cos(time * 0.15) * 0.2
  );
  float2 pole2 = float2(
    0.7 + cos(time * 0.25) * 0.15,
    0.5 + sin(time * 0.18) * 0.2
  );

  // Calculate combined field
  float2 field = magneticField(uv, pole1, 1.0) - magneticField(uv, pole2, 1.0);

  // Add noise distortion
  float noise = snoise(uv * 3.0 + time * 0.1);
  field += float2(noise, snoise(uv * 3.0 + 100.0)) * 0.3;

  // Field line pattern - perpendicular to field direction
  float angle = atan2(field.y, field.x);
  float linePattern = sin(angle * 20.0 * complexity + length(uv - pole1) * 15.0);
  linePattern *= sin(angle * 15.0 - length(uv - pole2) * 12.0);

  // Field intensity affects line thickness
  float intensity = length(field);
  float lines = smoothstep(0.7, 0.9, abs(linePattern)) * intensity * 0.5;

  return lines;
}

// Flowing particles along field lines
float flowParticles(float2 uv, float time) {
  float particles = 0.0;

  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float2 offset = float2(
      sin(fi * 1.7 + time * 0.5) * 0.3,
      cos(fi * 2.1 + time * 0.4) * 0.3
    );
    float2 p = uv + offset;

    // Particle glow
    float d = length(p - float2(0.5, 0.5 + sin(time + fi) * 0.2));
    particles += 0.02 / (d * d + 0.01);
  }

  return particles * 0.1;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time / 1000.0;
  float complexity = mix(0.5, 1.5, u_complexity);

  // Background gradient - warm earth tones
  float3 bgColor1 = float3(0.15, 0.08, 0.05);  // Dark earth
  float3 bgColor2 = float3(0.12, 0.10, 0.08);  // Dark brown
  float3 bg = mix(bgColor1, bgColor2, uv.y);

  // Field line colors
  float3 copper = float3(0.72, 0.45, 0.20);
  float3 bronze = float3(0.55, 0.47, 0.33);
  float3 forest = float3(0.13, 0.35, 0.22);
  float3 cream = float3(0.96, 0.94, 0.88);

  // Calculate field lines
  float lines = fieldLine(uv, time, complexity);

  // Secondary field layer
  float lines2 = fieldLine(uv * 0.8 + 0.1, time * 0.7 + 100.0, complexity * 0.8);

  // Flowing particles
  float particles = flowParticles(uv, time);

  // Color based on position and time
  float colorAngle = atan2(uv.y - 0.5, uv.x - 0.5 * aspect) + time * 0.1;
  float colorMix = sin(colorAngle * 2.0) * 0.5 + 0.5;
  float colorMix2 = cos(length(uv - float2(0.5 * aspect, 0.5)) * 4.0 - time) * 0.5 + 0.5;

  float3 lineColor = mix(copper, bronze, colorMix);
  lineColor = mix(lineColor, forest, colorMix2 * 0.4);

  float3 lineColor2 = mix(bronze, cream, colorMix2);

  // Compose
  float3 color = bg;
  color = mix(color, lineColor, lines * 0.8);
  color = mix(color, lineColor2, lines2 * 0.5);
  color += cream * particles;

  // Subtle center glow
  float centerGlow = exp(-length(uv - float2(0.5 * aspect, 0.5)) * 2.0) * 0.1;
  color += copper * centerGlow;

  // Vignette
  float vignette = 1.0 - length(uv - float2(0.5 * aspect, 0.5)) * 0.5;
  color *= vignette;

  return half4(half3(color), 1.0);
}
`;
