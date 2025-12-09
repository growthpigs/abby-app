/**
 * VibeMatrix8 - RADIAL FLOW FIELD Background
 *
 * William Mapan style flow field emanating from center
 * (warm earth tones: terracotta, sand, rust, cream)
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
import { VIBE_MATRIX_8_SHADER } from '../../shaders/vibeMatrix8';

export const VibeMatrix8: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const { complexity } = useVibeStore();
  const clock = useClock();

  const shader = useMemo(() => {
    console.log('[VibeMatrix8] Compiling shader...');
    const effect = Skia.RuntimeEffect.Make(VIBE_MATRIX_8_SHADER);
    if (!effect) {
      console.error('[VibeMatrix8] SHADER COMPILE FAILED');
      return null;
    }
    console.log('[VibeMatrix8] Shader compiled successfully');
    return effect;
  }, []);

  const complexityValue = COMPLEXITY_VALUES[complexity];

  const uniforms = useDerivedValue(() => ({
    u_time: clock.value,
    u_resolution: [width, height],
    u_complexity: complexityValue,
  }), [clock]);

  if (!shader) {
    return (
      <Canvas style={styles.canvas}>
        <Fill color="#2a1a15" />
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
  canvas: { ...StyleSheet.absoluteFillObject },
});

export default VibeMatrix8;
