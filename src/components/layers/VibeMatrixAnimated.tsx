/**
 * VibeMatrixAnimated - Animated Background with Smooth Color Transitions
 *
 * Same shader as VibeMatrix but with Reanimated-driven color uniforms
 * for smooth transitions between vibe themes.
 *
 * Now supports dynamic shader switching with crossfade transitions.
 *
 * Usage:
 *   const ref = useRef<VibeMatrixAnimatedRef>(null);
 *   ref.current?.setVibe('PASSION'); // Smooth transition to red/pink
 *   ref.current?.setShader(newShaderSource); // Crossfade to new shader
 */

import React, { useMemo, useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from '@shopify/react-native-skia';
import Animated, {
  useDerivedValue,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { VIBE_MATRIX_SHADER } from '../../shaders/vibeMatrix';
import { VIBE_COLORS, COMPLEXITY_VALUES } from '../../constants/colors';
import { VibeColorTheme, VibeComplexity } from '../../types/vibe';

// Ref interface for external control
export interface VibeMatrixAnimatedRef {
  setVibe: (theme: VibeColorTheme) => void;
  setComplexity: (level: VibeComplexity) => void;
  setVibeAndComplexity: (theme: VibeColorTheme, level: VibeComplexity) => void;
  setShader: (shaderSource: string) => void;
}

interface VibeMatrixAnimatedProps {
  initialTheme?: VibeColorTheme;
  initialComplexity?: VibeComplexity;
  transitionDuration?: number;
  shaderSource?: string;
}

// Single shader layer component
const ShaderLayer = React.memo(({
  shaderSource,
  colors,
  complexity,
  opacity,
}: {
  shaderSource: string;
  colors: {
    colorA_r: SharedValue<number>;
    colorA_g: SharedValue<number>;
    colorA_b: SharedValue<number>;
    colorB_r: SharedValue<number>;
    colorB_g: SharedValue<number>;
    colorB_b: SharedValue<number>;
  };
  complexity: SharedValue<number>;
  opacity: SharedValue<number>;
}) => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();
  const pinkAccent: [number, number, number] = [0.88, 0.11, 0.28];

  // Compile shader
  const shader = useMemo(() => {
    const effect = Skia.RuntimeEffect.Make(shaderSource);
    if (!effect) {
      console.error('[ShaderLayer] SHADER COMPILE FAILED');
      return null;
    }
    return effect;
  }, [shaderSource]);

  // Create animated uniforms
  const uniforms = useDerivedValue(() => {
    return {
      u_time: clock.value,
      u_resolution: [width, height],
      u_complexity: complexity.value,
      u_colorA: [colors.colorA_r.value, colors.colorA_g.value, colors.colorA_b.value],
      u_colorB: [colors.colorB_r.value, colors.colorB_g.value, colors.colorB_b.value],
      u_colorC: pinkAccent,
    };
  }, [clock]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!shader) {
    return null;
  }

  return (
    <Animated.View style={[styles.canvas, animatedStyle]}>
      <Canvas style={styles.canvas}>
        <Fill>
          <Shader source={shader} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </Animated.View>
  );
});

export const VibeMatrixAnimated = forwardRef<VibeMatrixAnimatedRef, VibeMatrixAnimatedProps>(
  (
    {
      initialTheme = 'TRUST',
      initialComplexity = 'FLOW',
      transitionDuration = 1000,
      shaderSource: propShaderSource,
    },
    ref
  ) => {
    const { width, height } = useWindowDimensions();

    // Current and transitioning shader sources
    const [currentShader, setCurrentShader] = useState(propShaderSource || VIBE_MATRIX_SHADER);
    const [nextShader, setNextShader] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Ref to track pending unmount (synchronized with React render)
    const pendingUnmountRef = useRef<string | null>(null);

    // Opacity for crossfade
    const currentOpacity = useSharedValue(1);
    const nextOpacity = useSharedValue(0);

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

    const complexity = useSharedValue<number>(initialComplexityValue);

    const colors = {
      colorA_r,
      colorA_g,
      colorA_b,
      colorB_r,
      colorB_g,
      colorB_b,
    };

    // Handle prop-driven shader changes
    // All dependencies included to prevent stale closure issues
    useEffect(() => {
      if (propShaderSource && propShaderSource !== currentShader && !isTransitioning) {
        startShaderTransition(propShaderSource);
      }
    }, [propShaderSource, currentShader, isTransitioning]);

    // Crossfade transition logic
    const startShaderTransition = (newShader: string) => {
      if (newShader === currentShader) return;

      setNextShader(newShader);
      setIsTransitioning(true);
      nextOpacity.value = 0;

      // Fade in new shader, fade out current
      currentOpacity.value = withTiming(0, { duration: transitionDuration * 0.8 });
      nextOpacity.value = withTiming(1, { duration: transitionDuration * 0.8 }, () => {
        runOnJS(completeTransition)(newShader);
      });
    };

    const completeTransition = (newShader: string) => {
      // ONLY update state - DON'T reset opacities yet!
      // Opacities will be reset AFTER React renders with new currentShader
      setCurrentShader(newShader);
      pendingUnmountRef.current = newShader;
      // Keep currentOpacity=0 and nextOpacity=1 until React renders
    };

    // Cleanup effect - runs AFTER React renders with new currentShader
    // This ensures the new shader is visible before we reset opacities
    useEffect(() => {
      if (pendingUnmountRef.current && pendingUnmountRef.current === currentShader && nextShader) {
        // React has rendered with new currentShader - NOW safe to reset opacities
        // The currentShader layer now contains the NEW shader, so showing it is correct
        currentOpacity.value = 1;
        nextOpacity.value = 0;
        setNextShader(null);
        setIsTransitioning(false);
        pendingUnmountRef.current = null;
      }
    }, [currentShader, nextShader]);

    // Cleanup ref on unmount (prevent stale refs)
    useEffect(() => {
      return () => {
        pendingUnmountRef.current = null;
      };
    }, []);

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

      setShader: (newShaderSource: string) => {
        if (!isTransitioning) {
          startShaderTransition(newShaderSource);
        }
      },
    }));

    return (
      <View style={styles.container}>
        {/* Current shader layer */}
        <ShaderLayer
          shaderSource={currentShader}
          colors={colors}
          complexity={complexity}
          opacity={currentOpacity}
        />

        {/* Next shader layer (only during transition) */}
        {nextShader && (
          <ShaderLayer
            shaderSource={nextShader}
            colors={colors}
            complexity={complexity}
            opacity={nextOpacity}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default VibeMatrixAnimated;
