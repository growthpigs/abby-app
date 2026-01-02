/**
 * VibeMatrix - Production Background (Layer 0)
 *
 * Uses GLSL shader with domain warping and fBM for
 * organic, fluid "oil in water" patterns.
 *
 * Animation: Uses useClock from Skia to update
 * u_time every frame for smooth 60fps animation.
 */

import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useVibeController } from '../../store/useVibeController';
import { VIBE_MATRIX_SHADER } from '../../shaders/vibeMatrix';

export const VibeMatrix: React.FC = () => {
  const { width, height } = useWindowDimensions();
  // Use selectors to minimize re-renders
  const colorA = useVibeController((state) => state.colorA);
  const colorB = useVibeController((state) => state.colorB);
  const complexityValue = useVibeController((state) => state.complexityValue);

  // useClock from Skia - returns milliseconds since first frame
  const clock = useClock();

  // Compile shader once
  const shader = useMemo(() => {
    if (__DEV__) console.log('[VibeMatrix] Compiling shader...');
    const effect = Skia.RuntimeEffect.Make(VIBE_MATRIX_SHADER);
    if (!effect) {
      if (__DEV__) console.error('[VibeMatrix] SHADER COMPILE FAILED');
      return null;
    }
    if (__DEV__) console.log('[VibeMatrix] Shader compiled successfully');
    return effect;
  }, []);

  // Pink accent color (normalized RGB 0-1)
  // #E11D48 = [225, 29, 72] → [0.88, 0.11, 0.28]
  const pinkAccent = [0.88, 0.11, 0.28];

  // Create animated uniforms using useDerivedValue
  // Pass raw milliseconds - shader multiplies by 0.0001 internally
  const uniforms = useDerivedValue(() => {
    return {
      u_time: clock.value, // Raw ms - shader expects this
      u_resolution: [width, height],
      u_complexity: complexityValue,
      u_colorA: colorA,
      u_colorB: colorB,
      u_colorC: pinkAccent, // Pink accent
    };
  }, [clock]);

  if (!shader) {
    return (
      <Canvas style={styles.canvas}>
        <Fill color="#0a0a1a" />
      </Canvas>
    );
  }

  return (
    <Canvas style={styles.canvas}>
      <Fill>
        <Shader source={shader} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default VibeMatrix;
