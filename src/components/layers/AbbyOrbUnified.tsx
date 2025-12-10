/**
 * AbbyOrbUnified - Single Orb with Energy Morphing
 *
 * Instead of switching between G1/G2/G4, this shader morphs between
 * energy states via a single `energy` uniform:
 *
 * - energy = 0.0 (CALM): Tight contained sphere, slow lava texture
 * - energy = 0.5 (ENGAGED): Looser boundary, blobs start drifting
 * - energy = 1.0 (EXCITED): No boundary, free-flowing amoeba blobs
 *
 * Morphs smoothly over 2.5 seconds.
 */

import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Default vibe colors (TRUST: Blue/Cyan)
const DEFAULT_COLOR_A = [0.231, 0.510, 1.0];
const DEFAULT_COLOR_B = [0.063, 0.725, 0.506];

// Transition duration for energy morphing - 2.5 seconds for smooth morph
const MORPH_DURATION = 2500;

const UNIFIED_ORB_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;
  uniform float audioLevel;
  uniform float energy;      // 0.0 = CALM, 0.5 = ENGAGED, 1.0 = EXCITED
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
    for (int i = 0; i < 2; i++) {
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

  // Smooth min - k controls how soft the blend is
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  // Blob position - amplitude increases dramatically with energy
  vec2 blobPos(float seed, float t, float audio, float e) {
    float audioBoost = 1.0 + audio * 0.1;
    // CALM: blobs barely move (0.05), EXCITED: big drift (0.45)
    float amp = 0.05 + e * 0.40;
    // Speed also increases with energy
    float speed = 0.3 + e * 0.5;
    return vec2(
      sin(t * speed * audioBoost + seed * 6.28) * amp,
      cos(t * speed * 1.1 * audioBoost + seed * 4.17) * amp
    );
  }

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);

    float t = time;
    float audio = audioLevel;
    float e = energy;  // 0.0 = calm, 1.0 = excited

    // === GENTLE BREATHING ===
    float breathAmp = 0.05 + audio * 0.08;
    float breath = 1.0 - breathAmp * sin(t * 0.8);
    uv *= breath;

    // === CORE SHAPE ===
    // CALM: large solid core (0.38), EXCITED: small core lets blobs dominate (0.18)
    float coreSize = 0.38 - e * 0.20;
    float coreBreathe = sin(t * 0.6) * 0.015;
    float core = sdCircle(uv, coreSize + coreBreathe);

    // === BLOBS ===
    // Blob size: CALM = small (0.12), EXCITED = large (0.24)
    float blobSize = 0.12 + e * 0.12;

    // 6 blobs that drift more with energy
    float d1 = sdCircle(uv - blobPos(0.0, t, audio, e), blobSize + 0.03);
    float d2 = sdCircle(uv - blobPos(0.17, t * 1.05, audio, e), blobSize);
    float d3 = sdCircle(uv - blobPos(0.33, t * 0.95, audio, e), blobSize + 0.02);
    float d4 = sdCircle(uv - blobPos(0.50, t * 1.08, audio, e), blobSize - 0.01);
    float d5 = sdCircle(uv - blobPos(0.67, t * 0.92, audio, e), blobSize + 0.01);
    float d6 = sdCircle(uv - blobPos(0.83, t * 1.02, audio, e), blobSize);

    // Soft merge - higher k = blobier, smoother merges
    // CALM: tight merge (0.4), EXCITED: very blobby (0.9)
    float sminK = 0.4 + e * 0.5;

    float shape = core;
    shape = smin(shape, d1, sminK);
    shape = smin(shape, d2, sminK);
    shape = smin(shape, d3, sminK);
    shape = smin(shape, d4, sminK);
    shape = smin(shape, d5, sminK);
    shape = smin(shape, d6, sminK);

    // === BOUNDARY SPHERE - smoothly fades with energy ===
    // CALM: tight containment sphere clips blobs
    // EXCITED: no containment, blobs roam free
    float boundaryRadius = 0.52 + sin(t * 0.5) * 0.02;
    float boundary = sdCircle(uv, boundaryRadius);

    // Blend factor: 1.0 at calm (use boundary), 0.0 at excited (ignore boundary)
    float boundaryBlend = 1.0 - smoothstep(0.0, 0.6, e);

    // Smoothly interpolate between bounded and unbounded shape
    float boundedShape = max(shape, boundary);  // Hard clip to boundary
    shape = mix(shape, boundedShape, boundaryBlend);

    // === EDGE WOBBLE (subtle, less during morph) ===
    float angle = atan(uv.y, uv.x);
    float waveAmp = 0.008 + audio * 0.01;
    float edgeWobble = sin(angle * 4.0 + t * 1.5) * waveAmp;
    shape -= edgeWobble;

    // === TEXTURE: Domain warping for lava effect ===
    // CALM: rich lava texture, EXCITED: simpler color bands
    float textureStrength = 1.0 - e * 0.8;

    float rotAngle = t * 0.08;
    float co = cos(rotAngle);
    float si = sin(rotAngle);
    vec2 rotUV = vec2(uv.x * co - uv.y * si, uv.x * si + uv.y * co);

    float noiseSpeed = 0.12 + audio * 0.2;

    vec3 p1 = vec3(rotUV * 1.5, t * noiseSpeed);
    float noise1 = fbm(p1);

    vec2 warpedUV = rotUV + (noise1 - 0.5) * 0.6 * textureStrength;
    vec3 p2 = vec3(warpedUV * 2.0, t * noiseSpeed * 1.2);
    float noise2 = fbm(p2);

    float n = noise1 * 0.4 + noise2 * 0.6;

    // === COLOR PALETTE ===
    vec3 warmColor = colorA;
    vec3 coolColor = colorB;
    vec3 hotColor = vec3(0.95, 0.85, 0.3);
    vec3 whiteHot = vec3(1.0, 0.98, 0.94);

    float colorPulse1 = sin(atan(uv.y, uv.x) * 2.0 + t * 0.8) * 0.5 + 0.5;
    float colorPulse2 = sin(length(uv) * 4.0 - t * 1.5) * 0.5 + 0.5;

    // EXCITED: more vibrant saturation
    float vibrancy = 1.0 + e * 0.25;

    // Lava color (textured)
    vec3 lavaColor = mix(coolColor, warmColor, smoothstep(0.25, 0.55, n) * colorPulse1);
    lavaColor = mix(lavaColor, hotColor, smoothstep(0.5, 0.75, n) * colorPulse2 * textureStrength);
    lavaColor = mix(lavaColor, whiteHot, smoothstep(0.7, 0.9, n) * textureStrength * 0.5);
    lavaColor *= vibrancy;

    // Simple color (for excited state - cleaner gradients)
    vec3 simpleColor = mix(warmColor, coolColor, colorPulse1);
    simpleColor = mix(simpleColor, hotColor, colorPulse2 * 0.3);
    simpleColor *= vibrancy;

    // Blend between lava and simple based on energy
    vec3 finalTexture = mix(lavaColor, simpleColor, e * 0.7);

    // Audio glow
    finalTexture += vec3(0.08, 0.06, 0.04) * audio;

    // === RENDER ===
    float edge = smoothstep(0.015, -0.015, shape);
    float glow = smoothstep(0.12 + e * 0.08, -0.08, shape);
    float inner = smoothstep(-0.2, 0.0, shape);

    vec3 glowColor = mix(warmColor, coolColor, colorPulse1) * vibrancy;

    vec3 color = glowColor;
    color = mix(color, finalTexture, edge);
    color += finalTexture * (1.0 - inner) * 0.2;

    // Core glow
    float dist = length(uv);
    float coreGlow = smoothstep(0.25, 0.0, dist) * edge;
    color += hotColor * coreGlow * 0.25;

    // Audio-reactive center
    float hotCenter = smoothstep(0.12, 0.0, dist) * edge;
    color += whiteHot * hotCenter * audio * 0.4;

    // Rim highlight
    float highlight = pow(max(0.0, 1.0 - inner), 2.5) * 0.3;
    color += vec3(highlight);

    // === SPARKLES ===
    int sparkleCount = 3 + int(e * 5.0);
    for (int i = 0; i < 8; i++) {
      if (i >= sparkleCount) break;
      float fi = float(i);
      float sparkAngle = hash(vec2(fi, 0.0)) * 6.28;
      float sparkDist = 0.08 + hash(vec2(fi, 1.0)) * (0.25 + e * 0.15);
      vec2 sparkPos = vec2(cos(sparkAngle + t * 0.08), sin(sparkAngle + t * 0.08)) * sparkDist;

      float sparkSize = 0.003 + hash(vec2(fi, 2.0)) * 0.003;
      float spark = smoothstep(sparkSize, 0.0, length(uv - sparkPos));
      float twinkle = pow(sin(t * 2.5 + fi * 2.2) * 0.5 + 0.5, 2.0);

      vec3 sparkColor = mix(warmColor, whiteHot, hash(vec2(fi, 3.0)));
      color += sparkColor * spark * twinkle * 0.5 * edge;
    }

    // Alpha
    float alpha = edge + glow * 0.5;

    return vec4(color, alpha);
  }
`);

interface AbbyOrbUnifiedProps {
  audioLevel?: number;
  energy?: number;  // 0.0 = CALM, 0.5 = ENGAGED, 1.0 = EXCITED
  colorA?: [number, number, number];
  colorB?: [number, number, number];
}

export const AbbyOrbUnified: React.FC<AbbyOrbUnifiedProps> = ({
  audioLevel = 0,
  energy = 0,
  colorA = DEFAULT_COLOR_A as [number, number, number],
  colorB = DEFAULT_COLOR_B as [number, number, number],
}) => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  // Animated values for smooth transitions
  const audioLevelShared = useSharedValue(0);
  const energyShared = useSharedValue(energy);

  // Animated color channels
  const colorA_r = useSharedValue(colorA[0]);
  const colorA_g = useSharedValue(colorA[1]);
  const colorA_b = useSharedValue(colorA[2]);
  const colorB_r = useSharedValue(colorB[0]);
  const colorB_g = useSharedValue(colorB[1]);
  const colorB_b = useSharedValue(colorB[2]);

  // Update audio level (no animation - instant)
  useEffect(() => {
    audioLevelShared.value = audioLevel;
  }, [audioLevel]);

  // Morph energy with slow, smooth easing
  useEffect(() => {
    energyShared.value = withTiming(energy, {
      duration: MORPH_DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),  // Smooth ease-in-out
    });
  }, [energy]);

  // Animate colors (same duration as morph)
  useEffect(() => {
    const config = { duration: MORPH_DURATION, easing: Easing.bezier(0.25, 0.1, 0.25, 1.0) };
    colorA_r.value = withTiming(colorA[0], config);
    colorA_g.value = withTiming(colorA[1], config);
    colorA_b.value = withTiming(colorA[2], config);
  }, [colorA[0], colorA[1], colorA[2]]);

  useEffect(() => {
    const config = { duration: MORPH_DURATION, easing: Easing.bezier(0.25, 0.1, 0.25, 1.0) };
    colorB_r.value = withTiming(colorB[0], config);
    colorB_g.value = withTiming(colorB[1], config);
    colorB_b.value = withTiming(colorB[2], config);
  }, [colorB[0], colorB[1], colorB[2]]);

  // Idle breathing when silent
  const finalAudioLevel = useDerivedValue(() => {
    const level = audioLevelShared.value;
    if (level > 0.01) return level;
    const breathe = Math.sin(clock.value / 1000 * 0.4) * 0.5 + 0.5;
    return breathe * 0.03;
  }, [clock]);

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: clock.value / 1000,
    audioLevel: finalAudioLevel.value,
    energy: energyShared.value,
    colorA: [colorA_r.value, colorA_g.value, colorA_b.value],
    colorB: [colorB_r.value, colorB_g.value, colorB_b.value],
  }), [clock, finalAudioLevel]);

  if (!UNIFIED_ORB_SHADER) {
    console.error('[AbbyOrbUnified] Shader failed to compile');
    return null;
  }

  return (
    <Canvas style={styles.canvas} mode="continuous">
      <Fill>
        <Shader source={UNIFIED_ORB_SHADER} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default AbbyOrbUnified;
