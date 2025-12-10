/**
 * LiquidGlass2 - Original LiquidGlass BUT contained in a sphere
 *
 * Same beautiful flowing blobs as CC1's LiquidGlass,
 * but trapped inside a visible orb boundary.
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
import { useDerivedValue } from 'react-native-reanimated';

// Same as LiquidGlass BUT with boundary sphere
const LIQUID_GLASS_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  // SDF for a circle
  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  // Smooth minimum - the magic that makes blobs merge
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  // Create a moving blob position - SAME AS ORIGINAL
  vec2 blobPos(float seed, float t) {
    return vec2(
      sin(t * 0.7 + seed * 6.28) * 0.3,
      cos(t * 0.9 + seed * 4.17) * 0.3
    );
  }

  vec4 main(vec2 fragCoord) {
    // Normalize to -1 to 1, centered
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);

    float t = time;

    // === BOUNDARY SPHERE ===
    float boundaryRadius = 0.6;
    boundaryRadius += sin(t * 0.8) * 0.02;
    float boundary = sdCircle(uv, boundaryRadius);

    // === ORIGINAL BLOBS - the squiggly amoeba ===
    float d1 = sdCircle(uv - blobPos(0.0, t), 0.35);
    float d2 = sdCircle(uv - blobPos(0.33, t * 1.1), 0.28);
    float d3 = sdCircle(uv - blobPos(0.66, t * 0.9), 0.32);
    float d4 = sdCircle(uv - blobPos(0.15, t * 1.2), 0.25);
    float d5 = sdCircle(uv - blobPos(0.85, t * 0.8), 0.22);

    // Smooth merge - creates the squiggly organic shape
    float blobs = d1;
    blobs = smin(blobs, d2, 0.5);
    blobs = smin(blobs, d3, 0.5);
    blobs = smin(blobs, d4, 0.5);
    blobs = smin(blobs, d5, 0.5);

    // === MERGE BLOBS WITH BOUNDARY using smin ===
    // This creates the organic edge where blobs meet the boundary
    float d = smin(blobs, boundary, 0.3);

    // Colors
    vec3 bgColor = vec3(0.02, 0.02, 0.08);
    vec3 blobColor1 = vec3(0.2, 0.5, 1.0);   // Blue
    vec3 blobColor2 = vec3(0.9, 0.3, 0.5);   // Pink/Red
    vec3 blobColor3 = vec3(0.3, 0.9, 0.7);   // Cyan/Green

    // Color based on position and time
    float colorMix = sin(atan(uv.y, uv.x) * 2.0 + t) * 0.5 + 0.5;
    float colorMix2 = sin(length(uv) * 5.0 - t * 2.0) * 0.5 + 0.5;

    vec3 blobColor = mix(blobColor1, blobColor2, colorMix);
    blobColor = mix(blobColor, blobColor3, colorMix2 * 0.5);

    // Edge rendering - shows the squiggly merged shape
    float edge = smoothstep(0.02, -0.02, d);
    float glow = smoothstep(0.15, -0.1, d);
    float inner = smoothstep(-0.3, 0.0, d);

    // Combine
    vec3 color = blobColor;
    color += blobColor * (1.0 - inner) * 0.3;     // Inner brightness

    // Highlights
    float highlight = pow(max(0.0, 1.0 - inner), 3.0) * 0.5;
    color += vec3(highlight);

    // Alpha based on edge + glow
    float alpha = edge + glow * 0.4;

    return vec4(color, alpha);
  }
`);

export const LiquidGlass2: React.FC = () => {
  const { width, height } = useWindowDimensions();

  // useClock from Skia - returns milliseconds since first frame
  const clock = useClock();

  // Create uniforms - convert to seconds for shader
  const uniforms = useDerivedValue(() => {
    return {
      resolution: [width, height],
      time: clock.value / 1000, // Seconds
    };
  }, [clock]);

  if (!LIQUID_GLASS_SHADER) {
    console.error('[LiquidGlass2] Shader failed to compile');
    return null;
  }

  return (
    <Canvas style={styles.canvas}>
      <Fill>
        <Shader source={LIQUID_GLASS_SHADER} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default LiquidGlass2;
