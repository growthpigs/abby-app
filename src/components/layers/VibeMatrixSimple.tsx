/**
 * VibeMatrixSimple - Minimal animated shader test
 *
 * Following William Candillon's exact pattern:
 * - useClock from Skia for time (ms since first frame)
 * - useDerivedValue for uniforms object
 * - on Canvas
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

// Super simple shader - just animates between two colors based on time
const SIMPLE_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  vec4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;

    // Oscillate between 0 and 1 based on time (in seconds)
    float progress = sin(time * 2.0) * 0.5 + 0.5;

    // Animate between blue and red based on progress
    vec3 color1 = vec3(0.2, 0.4, 0.9); // Blue
    vec3 color2 = vec3(0.9, 0.2, 0.4); // Red

    vec3 color = mix(color1, color2, progress);

    // Add some gradient based on position
    color += uv.y * 0.2;

    return vec4(color, 1.0);
  }
`);

export const VibeMatrixSimple: React.FC = () => {
  const { width, height } = useWindowDimensions();

  // useClock from Skia - returns milliseconds since first frame
  const clock = useClock();

  // Create uniforms using useDerivedValue
  // Convert clock (ms) to seconds for shader
  const uniforms = useDerivedValue(() => {
    return {
      resolution: [width, height],
      time: clock.value / 1000, // Convert ms to seconds
    };
  }, [clock]);

  if (!SIMPLE_SHADER) {
    if (__DEV__) console.error('[VibeMatrixSimple] Shader failed to compile');
    return null;
  }

  return (
    <Canvas style={styles.canvas}>
      <Fill>
        <Shader source={SIMPLE_SHADER} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default VibeMatrixSimple;
