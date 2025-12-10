/**
 * LiquidGlass8 - Curling Wave Petals
 *
 * Larger, more defined petal shapes that curl around each other.
 * Like the reference - distinct blob shapes with gradient fills.
 * More visible curl/wrap effect.
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

const LIQUID_GLASS_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  const float PI = 3.14159265359;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Egg/teardrop shape for curling petals
  float sdEgg(vec2 p, float r1, float r2) {
    float k = sqrt(3.0);
    p.x = abs(p.x);
    float r = (p.y < 0.0) ? r1 : r2;
    return length(vec2(p.x, p.y - clamp(p.y, -r1, r2))) - r;
  }

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);
    float t = time * 0.2;

    vec3 bgColor = vec3(0.06, 0.06, 0.08);
    vec3 color = bgColor;
    float totalAlpha = 0.0;

    // === 4 CURLING PETAL BLOBS ===
    // Larger, more distinct than G4
    for (int i = 0; i < 4; i++) {
      float fi = float(i);

      // Position - offset and rotating
      float angle = fi * PI * 0.5 + t * 0.4;
      float offsetDist = 0.08 + fi * 0.04;
      vec2 petalPos = vec2(cos(angle), sin(angle)) * offsetDist;

      vec2 p = uv - petalPos;

      // Rotate petal to curl around center
      float rotAngle = angle + PI * 0.6 + sin(t + fi) * 0.2;
      float c = cos(rotAngle), s = sin(rotAngle);
      p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);

      // Use egg shape for curl
      float d = sdEgg(p, 0.25, 0.35);

      // Soft edge
      float petal = smoothstep(0.08, -0.12, d);

      // === GRADIENT ===
      vec3 warmCore = vec3(1.0, 0.85, 0.5);
      vec3 innerPeach = vec3(1.0, 0.65, 0.5);
      vec3 midPink = vec3(0.92, 0.5, 0.65);
      vec3 outerViolet = vec3(0.65, 0.4, 0.85);
      vec3 edgeBlue = vec3(0.45, 0.55, 0.9);

      // Distance from petal center for color
      float colorDist = length(p) / 0.35;
      vec3 petalColor = mix(warmCore, innerPeach, smoothstep(0.0, 0.25, colorDist));
      petalColor = mix(petalColor, midPink, smoothstep(0.2, 0.5, colorDist));
      petalColor = mix(petalColor, outerViolet, smoothstep(0.4, 0.75, colorDist));
      petalColor = mix(petalColor, edgeBlue, smoothstep(0.65, 1.0, colorDist));

      // Vary per petal
      if (i == 0) petalColor = mix(petalColor, vec3(0.4, 0.7, 0.9), 0.2);
      if (i == 2) petalColor = mix(petalColor, vec3(0.85, 0.5, 0.75), 0.15);

      // Blend
      color = mix(color, petalColor, petal * 0.6);
      totalAlpha = max(totalAlpha, petal * 0.6);
    }

    // === CENTRAL GLOW ===
    float centerDist = length(uv);
    vec3 kernelColor = vec3(1.0, 0.9, 0.65);

    float kernelOuter = smoothstep(0.35, 0.1, centerDist);
    float kernel = smoothstep(0.15, 0.0, centerDist);
    float hotSpot = smoothstep(0.06, 0.0, centerDist);

    color = mix(color, vec3(1.0, 0.75, 0.55), kernelOuter * 0.35);
    color = mix(color, kernelColor, kernel * 0.85);
    color = mix(color, vec3(1.0, 1.0, 0.9), hotSpot * 0.6);

    // === SPARKLES ===
    for (int i = 0; i < 20; i++) {
      float fi = float(i);
      float sAngle = hash(vec2(fi, 0.0)) * 2.0 * PI;
      float sDist = 0.2 + hash(vec2(fi, 1.0)) * 0.45;
      vec2 sPos = vec2(cos(sAngle + t * 0.08), sin(sAngle + t * 0.08)) * sDist;

      float sSize = 0.004 + hash(vec2(fi, 2.0)) * 0.004;
      float spark = smoothstep(sSize, 0.0, length(uv - sPos));

      float twinkle = pow(sin(t * 4.0 + fi * 3.0) * 0.5 + 0.5, 2.0);

      vec3 sCol = mix(vec3(0.75, 0.65, 1.0), vec3(0.5, 0.8, 1.0), hash(vec2(fi, 3.0)));
      color += sCol * spark * twinkle * 0.6;
    }

    // Alpha based on petals + kernel (already tracked in loop)
    float alpha = max(totalAlpha, kernel * 0.9);
    alpha = max(alpha, kernelOuter * 0.5);

    return vec4(color, alpha);
  }
`);

export const LiquidGlass8: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: clock.value / 1000,
  }), [clock]);

  if (!LIQUID_GLASS_SHADER) {
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

export default LiquidGlass8;
