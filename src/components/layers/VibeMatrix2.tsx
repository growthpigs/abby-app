/**
 * VibeMatrix2 - WARM FIRE SWIRLS Background
 *
 * Multiple drifting swirl centers with warm colors
 * (reds, oranges, yellows, magentas)
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
import { VIBE_MATRIX_2_SHADER } from '../../shaders/vibeMatrix2';

export const VibeMatrix2: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const { complexity } = useVibeStore();

  const clock = useClock();

  const shader = useMemo(() => {
    console.log('[VibeMatrix2] Compiling shader...');
    const effect = Skia.RuntimeEffect.Make(VIBE_MATRIX_2_SHADER);
    if (!effect) {
      console.error('[VibeMatrix2] SHADER COMPILE FAILED');
      return null;
    }
    console.log('[VibeMatrix2] Shader compiled successfully');
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
        <Fill color="#1a0a0a" />
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

export default VibeMatrix2;
