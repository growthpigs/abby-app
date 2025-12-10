/**
 * LiquidRosePetals - Rose petal blobs with depth-of-field effect
 *
 * Combines CC1's liquid glass technique with:
 * - Rose petal SDF shapes (teardrop)
 * - Smooth minimum for liquid merging
 * - Per-petal depth for DoF blur (sharp foreground, soft background)
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

// Liquid Rose Petals shader with depth-of-field
const LIQUID_ROSE_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  // Rotate 2D point
  vec2 rotate(vec2 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
  }

  // Rose petal SDF - teardrop/egg shape
  float sdRosePetal(vec2 p, float width, float plen) {
    // Shift so wide end is near origin
    p.y += plen * 0.35;

    // Taper toward the tip
    float taper = 1.0 - clamp(p.y * 0.4 / plen, -0.5, 0.8);
    p.x /= max(taper * width, 0.01);
    p.y /= plen;

    // Egg-like distortion
    p.y *= 1.0 + p.y * 0.2;

    return length(p) - 0.5;
  }

  // Smooth minimum - liquid merging effect
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  vec4 main(vec2 fragCoord) {
    // Normalize to -1 to 1, centered
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);

    float t = time * 0.4;

    // Colors
    vec3 bgColor = vec3(0.02, 0.02, 0.06);
    vec3 warmColor = vec3(0.9, 0.3, 0.5);   // Pink/Rose
    vec3 coolColor = vec3(0.2, 0.5, 1.0);   // Blue
    vec3 whiteHighlight = vec3(1.0, 0.95, 0.98);

    // Create 6 petals with different depths (0 = sharp foreground, 1 = blurry background)
    // Petal data: angle offset, depth, size multiplier, rotation speed
    const int NUM_PETALS = 6;

    // Combined SDF for liquid merging
    float liquidSDF = 1000.0;

    // Color accumulator
    vec3 color = bgColor;

    // Process each petal layer (back to front)
    for (int i = 0; i < NUM_PETALS; i++) {
      float fi = float(i);

      // Distribute petals around center
      float baseAngle = fi * 1.047; // 60 degrees apart
      float depth = fract(fi * 0.37 + 0.1); // Pseudo-random depth 0-1
      float size = 0.8 + depth * 0.4; // Larger in back
      float speed = 0.3 + (1.0 - depth) * 0.2; // Faster in front

      // Petal rotation (slower for dreamy effect)
      float angle = baseAngle + t * speed;

      // Position: petals radiate from center
      vec2 petalCenter = vec2(cos(angle), sin(angle)) * 0.2;
      vec2 petalUV = uv - petalCenter;

      // Rotate petal to point outward
      petalUV = rotate(petalUV, angle + 1.57); // +90 degrees

      // Calculate petal SDF
      float d = sdRosePetal(petalUV, 0.18 * size, 0.45 * size);

      // DoF blur: background petals have softer edges
      float blurAmount = mix(0.02, 0.15, depth);
      float innerBlur = blurAmount * 0.3;

      // Edge with DoF
      float edge = smoothstep(blurAmount, -innerBlur, d);

      // Color based on angle and depth
      float colorMix = sin(angle * 2.0 + t * 0.5) * 0.5 + 0.5;
      vec3 petalColor = mix(warmColor, coolColor, colorMix);

      // Background petals are slightly darker/desaturated (atmospheric perspective)
      petalColor *= 1.0 - depth * 0.25;
      petalColor = mix(petalColor, vec3(0.5, 0.4, 0.6), depth * 0.2);

      // Inner glow/highlight (stronger on foreground petals)
      float innerGlow = smoothstep(0.1, -0.2, d) * (1.0 - depth);
      petalColor += whiteHighlight * innerGlow * 0.3;

      // Blend petal (back petals more transparent)
      float alpha = edge * (0.6 + (1.0 - depth) * 0.4);
      color = mix(color, petalColor, alpha);

      // Add to liquid SDF for merged glow
      liquidSDF = smin(liquidSDF, d, 0.4);
    }

    // Outer glow from merged liquid shape
    float glow = smoothstep(0.3, -0.1, liquidSDF);
    vec3 glowColor = mix(warmColor, coolColor, sin(t) * 0.5 + 0.5) * 0.2;
    color = mix(color, color + glowColor, glow * 0.5);

    // Subtle vignette
    float vignette = 1.0 - length(uv) * 0.3;
    color *= vignette;

    return vec4(color, 1.0);
  }
`);

export const LiquidRosePetals: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(() => {
    return {
      resolution: [width, height],
      time: clock.value / 1000,
    };
  }, [clock]);

  if (!LIQUID_ROSE_SHADER) {
    console.error('[LiquidRosePetals] Shader failed to compile');
    return null;
  }

  return (
    <Canvas style={styles.canvas}>
      <Fill>
        <Shader source={LIQUID_ROSE_SHADER} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default LiquidRosePetals;
