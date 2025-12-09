/**
 * VibeMatrix11 - LAYERED ORBS Background
 *
 * Multiple transparent orb layers at different depths
 * (ocean depths: deep blue, teal, aquamarine, seafoam)
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
import { VIBE_MATRIX_11_SHADER } from '../../shaders/vibeMatrix11';

export const VibeMatrix11: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const { complexity } = useVibeStore();
  const clock = useClock();

  const shader = useMemo(() => {
    console.log('[VibeMatrix11] Compiling shader...');
    const effect = Skia.RuntimeEffect.Make(VIBE_MATRIX_11_SHADER);
    if (!effect) {
      console.error('[VibeMatrix11] SHADER COMPILE FAILED');
      return null;
    }
    console.log('[VibeMatrix11] Shader compiled successfully');
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
        <Fill color="#051020" />
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

export default VibeMatrix11;
