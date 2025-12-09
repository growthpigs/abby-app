/**
 * VibeMatrix3 - NEON AURORA SPIRALS Background
 *
 * Polar coordinate spirals with vibrant neon colors
 * (hot pink, electric blue, cyan, purple)
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
import { VIBE_MATRIX_3_SHADER } from '../../shaders/vibeMatrix3';

export const VibeMatrix3: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const { complexity } = useVibeStore();

  const clock = useClock();

  const shader = useMemo(() => {
    console.log('[VibeMatrix3] Compiling shader...');
    const effect = Skia.RuntimeEffect.Make(VIBE_MATRIX_3_SHADER);
    if (!effect) {
      console.error('[VibeMatrix3] SHADER COMPILE FAILED');
      return null;
    }
    console.log('[VibeMatrix3] Shader compiled successfully');
    return effect;
  }, []);

  const complexityValue = COMPLEXITY_VALUES[complexity];

  const uniforms = useDerivedValue(() => {
    return {
      u_time: clock.value,
      u_resolution: [width, height],
      u_complexity: complexityValue,
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
    <Canvas style={styles.canvas} mode="continuous">
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

export default VibeMatrix3;
