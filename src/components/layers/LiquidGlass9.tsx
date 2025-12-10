/**
 * LiquidGlass9 - Wrapped Shell Bloom
 *
 * 3 large soft blobs that wrap/overlap like the reference.
 * Each distinct, with that watercolor gradient.
 * More dramatic curl, closer to the reference image.
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

  // Smooth blob shape - soft rounded
  float sdBlob(vec2 p, float r) {
    // Add slight waviness to edge
    float angle = atan(p.y, p.x);
    float wave = sin(angle * 3.0) * 0.08 + sin(angle * 5.0) * 0.04;
    return length(p) - r - wave * r;
  }

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);
    float t = time * 0.15;

    vec3 bgColor = vec3(0.06, 0.06, 0.08);
    vec3 color = bgColor;

    // === 3 LARGE WRAPPING BLOBS ===
    // Like the reference - distinct shapes that overlap

    // BLOB 1 - Top right, curling down (blue-ish)
    {
      float angle = t + 0.3;
      vec2 pos = vec2(0.15, 0.12);
      pos = vec2(pos.x * cos(angle) - pos.y * sin(angle),
                 pos.x * sin(angle) + pos.y * cos(angle));

      vec2 p = uv - pos;
      // Rotate blob shape
      float rot = -0.4 + sin(t) * 0.1;
      p = vec2(p.x * cos(rot) - p.y * sin(rot), p.x * sin(rot) + p.y * cos(rot));
      // Stretch into petal shape
      p.x *= 0.7;

      float d = sdBlob(p, 0.32);
      float blob = smoothstep(0.1, -0.15, d);

      // Gradient
      float colorT = (length(p) / 0.35);
      vec3 blobColor = mix(vec3(1.0, 0.85, 0.55), vec3(1.0, 0.6, 0.5), smoothstep(0.0, 0.3, colorT));
      blobColor = mix(blobColor, vec3(0.85, 0.5, 0.7), smoothstep(0.25, 0.55, colorT));
      blobColor = mix(blobColor, vec3(0.55, 0.45, 0.9), smoothstep(0.45, 0.75, colorT));
      blobColor = mix(blobColor, vec3(0.4, 0.6, 0.95), smoothstep(0.65, 0.95, colorT));

      color = mix(color, blobColor, blob * 0.65);
    }

    // BLOB 2 - Left side, curling right (pink-ish)
    {
      float angle = t + PI * 0.7;
      vec2 pos = vec2(-0.18, 0.0);
      pos = vec2(pos.x * cos(angle * 0.8) - pos.y * sin(angle * 0.8),
                 pos.x * sin(angle * 0.8) + pos.y * cos(angle * 0.8));

      vec2 p = uv - pos;
      float rot = 0.8 + cos(t * 0.7) * 0.15;
      p = vec2(p.x * cos(rot) - p.y * sin(rot), p.x * sin(rot) + p.y * cos(rot));
      p.y *= 0.75;

      float d = sdBlob(p, 0.35);
      float blob = smoothstep(0.1, -0.18, d);

      float colorT = (length(p) / 0.38);
      vec3 blobColor = mix(vec3(1.0, 0.9, 0.6), vec3(1.0, 0.7, 0.55), smoothstep(0.0, 0.25, colorT));
      blobColor = mix(blobColor, vec3(0.95, 0.55, 0.65), smoothstep(0.2, 0.5, colorT));
      blobColor = mix(blobColor, vec3(0.7, 0.4, 0.85), smoothstep(0.4, 0.7, colorT));
      blobColor = mix(blobColor, vec3(0.5, 0.55, 0.9), smoothstep(0.6, 0.9, colorT));

      // More pink tint
      blobColor = mix(blobColor, vec3(0.95, 0.5, 0.7), 0.15);

      color = mix(color, blobColor, blob * 0.6);
    }

    // BLOB 3 - Bottom, curling up (cyan-ish)
    {
      float angle = t + PI * 1.4;
      vec2 pos = vec2(0.05, -0.15);
      pos = vec2(pos.x * cos(angle * 0.6) - pos.y * sin(angle * 0.6),
                 pos.x * sin(angle * 0.6) + pos.y * cos(angle * 0.6));

      vec2 p = uv - pos;
      float rot = -1.2 + sin(t * 0.5) * 0.2;
      p = vec2(p.x * cos(rot) - p.y * sin(rot), p.x * sin(rot) + p.y * cos(rot));
      p.x *= 0.8;

      float d = sdBlob(p, 0.3);
      float blob = smoothstep(0.08, -0.14, d);

      float colorT = (length(p) / 0.33);
      vec3 blobColor = mix(vec3(1.0, 0.88, 0.5), vec3(1.0, 0.65, 0.5), smoothstep(0.0, 0.28, colorT));
      blobColor = mix(blobColor, vec3(0.9, 0.5, 0.65), smoothstep(0.22, 0.52, colorT));
      blobColor = mix(blobColor, vec3(0.6, 0.45, 0.88), smoothstep(0.42, 0.72, colorT));
      blobColor = mix(blobColor, vec3(0.45, 0.7, 0.9), smoothstep(0.62, 0.92, colorT));

      // More cyan tint
      blobColor = mix(blobColor, vec3(0.4, 0.75, 0.9), 0.2);

      color = mix(color, blobColor, blob * 0.55);
    }

    // === CENTRAL KERNEL ===
    float centerDist = length(uv);
    vec3 kernelColor = vec3(1.0, 0.92, 0.65);

    float kernelGlow = smoothstep(0.3, 0.08, centerDist);
    float kernel = smoothstep(0.14, 0.0, centerDist);
    float hotSpot = smoothstep(0.05, 0.0, centerDist);

    color = mix(color, vec3(1.0, 0.75, 0.55), kernelGlow * 0.45);
    color = mix(color, kernelColor, kernel * 0.9);
    color = mix(color, vec3(1.0, 1.0, 0.92), hotSpot * 0.65);

    // === SPARKLES ===
    for (int i = 0; i < 30; i++) {
      float fi = float(i);
      float sAngle = hash(vec2(fi, 0.0)) * 2.0 * PI;
      float sDist = 0.12 + hash(vec2(fi, 1.0)) * 0.55;
      vec2 sPos = vec2(cos(sAngle + t * 0.06), sin(sAngle + t * 0.06)) * sDist;

      float sSize = 0.003 + hash(vec2(fi, 2.0)) * 0.005;
      float spark = smoothstep(sSize, 0.0, length(uv - sPos));

      float twinkle = pow(sin(t * 3.0 + fi * 2.7) * 0.5 + 0.5, 2.5);

      vec3 sCol = mix(vec3(0.8, 0.7, 1.0), vec3(0.5, 0.85, 1.0), hash(vec2(fi, 3.0)));
      color += sCol * spark * twinkle * 0.65;
    }

    // Alpha based on blobs + kernel
    float alpha = max(kernelGlow * 0.5, kernel * 0.9);
    // Add blob contribution
    alpha = max(alpha, hotSpot);

    return vec4(color, alpha);
  }
`);

export const LiquidGlass9: React.FC = () => {
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

export default LiquidGlass9;
