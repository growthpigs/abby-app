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
import { useVibeStore } from '../../store/useVibeStore';
import { COMPLEXITY_VALUES } from '../../constants/colors';
import { VIBE_MATRIX_SHADER } from '../../shaders/vibeMatrix';

export const VibeMatrix: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const { config, complexity } = useVibeStore();

  // useClock from Skia - returns milliseconds since first frame
  const clock = useClock();

  // Compile shader once
  const shader = useMemo(() => {
    console.log('[VibeMatrix] Compiling shader...');
    const effect = Skia.RuntimeEffect.Make(VIBE_MATRIX_SHADER);
    if (!effect) {
      console.error('[VibeMatrix] SHADER COMPILE FAILED');
      return null;
    }
    console.log('[VibeMatrix] Shader compiled successfully');
    return effect;
  }, []);

  // Get complexity value
  const complexityValue = COMPLEXITY_VALUES[complexity];

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
      u_colorA: config.colorA,
      u_colorB: config.colorB,
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
