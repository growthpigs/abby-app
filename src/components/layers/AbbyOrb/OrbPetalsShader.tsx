/**
 * OrbPetalsShader - GPU-accelerated petal orb using GLSL shader
 *
 * Uses useClock from Skia for frame-by-frame animation.
 */

import React, { useMemo } from 'react';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  Circle,
  Mask,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { OrbPetalsProps } from '../../../types/orb';

// GLSL shader for petal orb effect
// NOTE: Parameter renamed from 'length' to 'len' to avoid shadowing built-in length() function
const PETAL_SHADER_SOURCE = `
  uniform float2 resolution;
  uniform float time;
  uniform vec3 warmColor;
  uniform vec3 coolColor;

  // Rotate 2D point
  vec2 rotate(vec2 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
  }

  // Soft petal shape using distance field
  float petal(vec2 p, float angle, float w, float len) {
    vec2 rp = rotate(p, angle);
    // Elongated ellipse
    rp.x /= w;
    rp.y /= len;
    // Shift outward from center
    rp.y -= 0.5;
    return length(rp);
  }

  // Glow falloff
  float glow(float d, float radius, float softness) {
    return smoothstep(radius + softness, radius - softness, d);
  }

  vec4 main(vec2 fragCoord) {
    vec2 uv = (fragCoord - resolution * 0.5) / min(resolution.x, resolution.y);

    // Distance from center for circular mask
    float centerDist = length(uv);

    // Petal parameters
    float petalWidth = 0.15;
    float petalLen = 0.6;

    // Three petals rotating at different speeds
    float t = time;

    float d1 = petal(uv, t * 0.3, petalWidth, petalLen);
    float d2 = petal(uv, t * -0.25 + 2.094, petalWidth * 0.9, petalLen * 0.95);
    float d3 = petal(uv, t * 0.2 + 4.189, petalWidth * 0.85, petalLen * 0.9);

    // Combine petals
    float petalGlow = glow(d1, 0.4, 0.3);
    petalGlow += glow(d2, 0.4, 0.3) * 0.9;
    petalGlow += glow(d3, 0.4, 0.3) * 0.8;
    petalGlow = clamp(petalGlow, 0.0, 1.0);

    // Color based on angle
    float angle = atan(uv.y, uv.x);
    float colorMix = sin(angle * 1.5 + t * 0.5) * 0.5 + 0.5;
    vec3 petalColor = mix(warmColor, coolColor, colorMix);

    // Add brightness at petal centers
    petalColor += vec3(0.2) * petalGlow;

    // Circular falloff - fade at edges
    float circleMask = 1.0 - smoothstep(0.35, 0.55, centerDist);

    // Final alpha - petals visible, background transparent
    float alpha = petalGlow * circleMask;

    return vec4(petalColor * alpha, alpha);
  }
`;

// Parse color string to RGB values (0-1 range)
const parseColor = (color: string): [number, number, number] => {
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return [
      parseInt(rgbaMatch[1]) / 255,
      parseInt(rgbaMatch[2]) / 255,
      parseInt(rgbaMatch[3]) / 255,
    ];
  }
  return [0.5, 0.3, 0.8];
};

export const OrbPetalsShader: React.FC<OrbPetalsProps> = ({
  size,
  colors,
  visible,
}) => {
  // useClock from Skia - returns milliseconds since first frame
  const clock = useClock();

  // Compile shader once
  const shader = useMemo(() => {
    const effect = Skia.RuntimeEffect.Make(PETAL_SHADER_SOURCE);
    if (!effect) {
      console.error('[OrbPetalsShader] Failed to compile shader');
      return null;
    }
    return effect;
  }, []);

  const warmRGB = parseColor(colors.petals.warm);
  const coolRGB = parseColor(colors.petals.cool);

  // Convert clock (ms) to seconds for shader
  const uniforms = useDerivedValue(() => ({
    resolution: [size, size],
    time: clock.value / 1000, // Convert ms to seconds
    warmColor: [warmRGB[0], warmRGB[1], warmRGB[2]],
    coolColor: [coolRGB[0], coolRGB[1], coolRGB[2]],
  }), [clock]);

  if (!shader || !visible) return null;

  // Use a circular mask to clip the shader output
  return (
    <Canvas style={[styles.canvas, { width: size, height: size }]}>
      <Mask
        mask={
          <Circle cx={size / 2} cy={size / 2} r={size / 2} color="white" />
        }
      >
        <Fill>
          <Shader source={shader} uniforms={uniforms} />
        </Fill>
      </Mask>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
  },
});

export default OrbPetalsShader;
