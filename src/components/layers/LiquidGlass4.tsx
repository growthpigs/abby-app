/**
 * LiquidGlass4 - Abby's Talking Orb
 *
 * Combines:
 * - G2's organic blob boundary (smin merging)
 * - G10's domain-warped lava texture
 * - Audio-reactive edge distortion
 * - Vibe-driven color palette
 *
 * Uniforms:
 * - u_audioLevel: 0.0-1.0 speech amplitude
 * - u_colorA: Primary vibe color (vec3)
 * - u_colorB: Secondary vibe color (vec3)
 */

import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

// Default vibe colors (PASSION: pink/red)
const DEFAULT_COLOR_A = [0.957, 0.447, 0.714]; // #F472B6 Hot Pink
const DEFAULT_COLOR_B = [0.659, 0.333, 0.969]; // #A855F7 Purple

const ABBY_ORB_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;
  uniform float audioLevel;
  uniform float3 colorA;
  uniform float3 colorB;

  // === NOISE FUNCTIONS ===
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash3(i);
    float n001 = hash3(i + vec3(0.0, 0.0, 1.0));
    float n010 = hash3(i + vec3(0.0, 1.0, 0.0));
    float n011 = hash3(i + vec3(0.0, 1.0, 1.0));
    float n100 = hash3(i + vec3(1.0, 0.0, 0.0));
    float n101 = hash3(i + vec3(1.0, 0.0, 1.0));
    float n110 = hash3(i + vec3(1.0, 1.0, 0.0));
    float n111 = hash3(i + vec3(1.0, 1.0, 1.0));

    float n00 = mix(n000, n001, f.z);
    float n01 = mix(n010, n011, f.z);
    float n10 = mix(n100, n101, f.z);
    float n11 = mix(n110, n111, f.z);

    float n0 = mix(n00, n01, f.y);
    float n1 = mix(n10, n11, f.y);

    return mix(n0, n1, f.x);
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amp * noise3D(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return value;
  }

  // === SDF FUNCTIONS ===
  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  // Smooth minimum - organic blob merging
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  // Blob position - gentle organic drift (very subtle audio influence)
  vec2 blobPos(float seed, float t, float audio) {
    float audioBoost = 1.0 + audio * 0.08; // Very subtle speed change
    return vec2(
      sin(t * 0.4 * audioBoost + seed * 6.28) * 0.22,
      cos(t * 0.5 * audioBoost + seed * 4.17) * 0.22
    );
  }

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);

    float t = time * 0.3;
    float audio = audioLevel;

    // === BREATHING: Uniform expansion from center ===
    // Scale UV inward = orb appears larger (inflating balloon)
    float breath = 1.0 - audio * 0.15;  // 15% expansion when audio=1.0
    uv *= breath;

    // === PURE BLOB APPROACH (no hard boundary) ===
    // Central large blob with gentle breathing
    float breathe = sin(t * 0.8) * 0.015;
    float core = sdCircle(uv, 0.35 + breathe);

    // Orbiting blobs - very slow, gentle drift
    float d1 = sdCircle(uv - blobPos(0.0, t, audio) * 0.45, 0.24);
    float d2 = sdCircle(uv - blobPos(0.2, t * 1.05, audio) * 0.48, 0.21);
    float d3 = sdCircle(uv - blobPos(0.4, t * 0.95, audio) * 0.45, 0.23);
    float d4 = sdCircle(uv - blobPos(0.6, t * 1.08, audio) * 0.47, 0.19);
    float d5 = sdCircle(uv - blobPos(0.8, t * 0.92, audio) * 0.44, 0.22);

    // Very soft merge (high k = blobby organic)
    float shape = core;
    shape = smin(shape, d1, 0.7);
    shape = smin(shape, d2, 0.7);
    shape = smin(shape, d3, 0.7);
    shape = smin(shape, d4, 0.7);
    shape = smin(shape, d5, 0.7);

    // Sine wave edge wobble (doubled amplitude)
    float angle = atan(uv.y, uv.x);
    float waveAmp = 0.016 + audio * 0.024; // 1.6% to 4% of size
    float edgeWobble = sin(angle * 5.0 + t * 2.0) * waveAmp;
    edgeWobble += sin(angle * 3.0 - t * 1.5) * waveAmp * 0.5;
    shape -= edgeWobble;

    // === DOMAIN-WARPED LAVA TEXTURE (from G10) ===
    // Rotation
    float rotAngle = t * 0.1;
    float co = cos(rotAngle);
    float si = sin(rotAngle);
    vec2 rotUV = vec2(uv.x * co - uv.y * si, uv.x * si + uv.y * co);

    // Speed up noise when speaking
    float noiseSpeed = 0.15 + audio * 0.3;

    // Domain warping layers
    vec3 p1 = vec3(rotUV * 1.5 + vec2(t * 0.2, t * 0.3), t * noiseSpeed);
    float noise1 = fbm(p1);

    vec2 warpedUV = rotUV + (noise1 - 0.5) * 0.7;
    vec3 p2 = vec3(warpedUV * 2.0, t * noiseSpeed * 1.3);
    float noise2 = fbm(p2);

    vec2 warpedUV2 = warpedUV + (noise2 - 0.5) * 0.4;
    vec3 p3 = vec3(warpedUV2 * 1.2, t * noiseSpeed * 0.7);
    float noise3 = fbm(p3);

    float n = noise2 * 0.6 + noise3 * 0.4;

    // === COLOR PALETTE (vibe-driven) ===
    // Create gradient from colorA (warm) to colorB (cool)
    vec3 warmColor = colorA;
    vec3 coolColor = colorB;

    // Yellow/white for hot center
    vec3 hotColor = vec3(0.992, 0.878, 0.278);
    vec3 whiteHot = vec3(1.0, 0.98, 0.95);

    // Build color from noise
    vec3 lavaColor = mix(coolColor, warmColor, smoothstep(0.2, 0.6, n));
    lavaColor = mix(lavaColor, hotColor, smoothstep(0.55, 0.8, n));
    lavaColor = mix(lavaColor, whiteHot, smoothstep(0.75, 0.95, n));

    // Audio brightness boost
    lavaColor += vec3(0.1, 0.08, 0.05) * audio;

    // === RENDER ===
    vec3 bgColor = vec3(0.03, 0.03, 0.06);

    // Shape masks
    float edge = smoothstep(0.02, -0.02, shape);
    float glow = smoothstep(0.15, -0.1, shape);
    float inner = smoothstep(-0.25, 0.0, shape);

    // Build final color
    vec3 color = bgColor;

    // Outer glow (uses vibe colors)
    vec3 glowColor = mix(coolColor, warmColor, 0.3) * 0.4;
    color = mix(color, glowColor, glow);

    // Main fill with lava texture
    color = mix(color, lavaColor, edge);

    // Inner brightness
    color += lavaColor * (1.0 - inner) * 0.25;

    // Core highlight
    float dist = length(uv);
    float coreGlow = smoothstep(0.3, 0.0, dist) * edge;
    color += hotColor * coreGlow * 0.3;

    // Hot center when speaking
    float hotCenter = smoothstep(0.15, 0.0, dist) * edge;
    color += whiteHot * hotCenter * audio * 0.5;

    // Specular highlight
    float highlight = pow(max(0.0, 1.0 - inner), 3.0) * 0.4;
    color += vec3(highlight);

    // === SPARKLES (subtle) ===
    for (int i = 0; i < 15; i++) {
      float fi = float(i);
      float sparkAngle = hash(vec2(fi, 0.0)) * 6.28;
      float sparkDist = 0.1 + hash(vec2(fi, 1.0)) * 0.4;
      vec2 sparkPos = vec2(cos(sparkAngle + t * 0.1), sin(sparkAngle + t * 0.1)) * sparkDist;

      float sparkSize = 0.004 + hash(vec2(fi, 2.0)) * 0.004;
      float spark = smoothstep(sparkSize, 0.0, length(uv - sparkPos));

      float twinkle = pow(sin(t * 4.0 + fi * 2.5) * 0.5 + 0.5, 2.0);

      // Sparkles use vibe colors
      vec3 sparkColor = mix(warmColor, whiteHot, hash(vec2(fi, 3.0)));
      color += sparkColor * spark * twinkle * 0.5 * edge;
    }

    // Alpha based on shape + glow
    float alpha = edge + glow * 0.4;

    return vec4(color, alpha);
  }
`);

interface LiquidGlass4Props {
  audioLevel?: number; // 0.0 - 1.0
  colorA?: [number, number, number]; // Primary vibe color
  colorB?: [number, number, number]; // Secondary vibe color
}

export const LiquidGlass4: React.FC<LiquidGlass4Props> = ({
  audioLevel = 0,
  colorA = DEFAULT_COLOR_A,
  colorB = DEFAULT_COLOR_B,
}) => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  // Convert React prop to shared value for Reanimated
  const audioLevelShared = useSharedValue(0);

  // Update shared value when prop changes
  React.useEffect(() => {
    audioLevelShared.value = audioLevel;
  }, [audioLevel]);

  // Compute final audio level (with idle breathing when silent)
  const finalAudioLevel = useDerivedValue(() => {
    const level = audioLevelShared.value;
    if (level > 0.01) return level;
    // Subtle idle "breathing" pulse
    const breathe = Math.sin(clock.value / 1000 * 0.5) * 0.5 + 0.5;
    return breathe * 0.05;
  }, [clock]);

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: clock.value / 1000,
    audioLevel: finalAudioLevel.value,
    colorA: colorA,
    colorB: colorB,
  }), [clock, finalAudioLevel, colorA, colorB]);

  if (!ABBY_ORB_SHADER) {
    console.error('[LiquidGlass4] Shader failed to compile');
    return null;
  }

  return (
    <Canvas style={styles.canvas} mode="continuous">
      <Fill>
        <Shader source={ABBY_ORB_SHADER} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default LiquidGlass4;
