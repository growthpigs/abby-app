/**
 * VibeMatrix10 - CHROMATIC BLOOM Background
 *
 * Central glow with RGB channel splitting/chromatic aberration
 * (prismatic: red shift, cyan shift, white core)
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
import { VIBE_MATRIX_10_SHADER } from '../../shaders/vibeMatrix10';

export const VibeMatrix10: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const { complexity } = useVibeStore();
  const clock = useClock();

  const shader = useMemo(() => {
    if (__DEV__) console.log('[VibeMatrix10] Compiling shader...');
    const effect = Skia.RuntimeEffect.Make(VIBE_MATRIX_10_SHADER);
    if (!effect) {
      console.error('[VibeMatrix10] SHADER COMPILE FAILED');
      return null;
    }
    if (__DEV__) console.log('[VibeMatrix10] Shader compiled successfully');
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
        <Fill color="#0a0a15" />
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
  canvas: { ...StyleSheet.absoluteFillObject },
});

export default VibeMatrix10;
