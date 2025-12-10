/**
 * VibeMatrixAnimated - Animated Background with Smooth Color Transitions
 *
 * Same shader as VibeMatrix but with Reanimated-driven color uniforms
 * for smooth transitions between vibe themes.
 *
 * Usage:
 *   const ref = useRef<VibeMatrixAnimatedRef>(null);
 *   ref.current?.setVibe('PASSION'); // Smooth transition to red/pink
 */

import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { VIBE_MATRIX_SHADER } from '../../shaders/vibeMatrix';
import { VIBE_COLORS, COMPLEXITY_VALUES } from '../../constants/colors';
import { VibeColorTheme, VibeComplexity } from '../../types/vibe';

// Ref interface for external control
export interface VibeMatrixAnimatedRef {
  setVibe: (theme: VibeColorTheme) => void;
  setComplexity: (level: VibeComplexity) => void;
  setVibeAndComplexity: (theme: VibeColorTheme, level: VibeComplexity) => void;
}

interface VibeMatrixAnimatedProps {
  initialTheme?: VibeColorTheme;
  initialComplexity?: VibeComplexity;
  transitionDuration?: number;
}

export const VibeMatrixAnimated = forwardRef<VibeMatrixAnimatedRef, VibeMatrixAnimatedProps>(
  (
    {
      initialTheme = 'TRUST',
      initialComplexity = 'FLOW',
      transitionDuration = 1000,
    },
    ref
  ) => {
    const { width, height } = useWindowDimensions();
    const clock = useClock();

    // Compile shader once
    const shader = useMemo(() => {
      console.log('[VibeMatrixAnimated] Compiling shader...');
      const effect = Skia.RuntimeEffect.Make(VIBE_MATRIX_SHADER);
      if (!effect) {
        console.error('[VibeMatrixAnimated] SHADER COMPILE FAILED');
        return null;
      }
      console.log('[VibeMatrixAnimated] Shader compiled successfully');
      return effect;
    }, []);

    // Get initial values
    const initialPalette = VIBE_COLORS[initialTheme];
    const initialComplexityValue = COMPLEXITY_VALUES[initialComplexity];

    // Animated shared values for colors
    const colorA_r = useSharedValue(initialPalette.primary[0]);
    const colorA_g = useSharedValue(initialPalette.primary[1]);
    const colorA_b = useSharedValue(initialPalette.primary[2]);

    const colorB_r = useSharedValue(initialPalette.secondary[0]);
    const colorB_g = useSharedValue(initialPalette.secondary[1]);
    const colorB_b = useSharedValue(initialPalette.secondary[2]);

    const complexity = useSharedValue(initialComplexityValue);

    // Pink accent color (static)
    const pinkAccent: [number, number, number] = [0.88, 0.11, 0.28];

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      setVibe: (theme: VibeColorTheme) => {
        const palette = VIBE_COLORS[theme];
        colorA_r.value = withTiming(palette.primary[0], { duration: transitionDuration });
        colorA_g.value = withTiming(palette.primary[1], { duration: transitionDuration });
        colorA_b.value = withTiming(palette.primary[2], { duration: transitionDuration });

        colorB_r.value = withTiming(palette.secondary[0], { duration: transitionDuration });
        colorB_g.value = withTiming(palette.secondary[1], { duration: transitionDuration });
        colorB_b.value = withTiming(palette.secondary[2], { duration: transitionDuration });
      },

      setComplexity: (level: VibeComplexity) => {
        const value = COMPLEXITY_VALUES[level];
        complexity.value = withTiming(value, { duration: transitionDuration * 0.8 });
      },

      setVibeAndComplexity: (theme: VibeColorTheme, level: VibeComplexity) => {
        const palette = VIBE_COLORS[theme];
        const complexityValue = COMPLEXITY_VALUES[level];

        colorA_r.value = withTiming(palette.primary[0], { duration: transitionDuration });
        colorA_g.value = withTiming(palette.primary[1], { duration: transitionDuration });
        colorA_b.value = withTiming(palette.primary[2], { duration: transitionDuration });

        colorB_r.value = withTiming(palette.secondary[0], { duration: transitionDuration });
        colorB_g.value = withTiming(palette.secondary[1], { duration: transitionDuration });
        colorB_b.value = withTiming(palette.secondary[2], { duration: transitionDuration });

        complexity.value = withTiming(complexityValue, { duration: transitionDuration * 0.8 });
      },
    }));

    // Create animated uniforms
    const uniforms = useDerivedValue(() => {
      return {
        u_time: clock.value,
        u_resolution: [width, height],
        u_complexity: complexity.value,
        u_colorA: [colorA_r.value, colorA_g.value, colorA_b.value],
        u_colorB: [colorB_r.value, colorB_g.value, colorB_b.value],
        u_colorC: pinkAccent,
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
  }
);

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default VibeMatrixAnimated;
