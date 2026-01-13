/**
 * VibeMatrixAnimated - Animated Background with Smooth Color Transitions
 *
 * Same shader as VibeMatrix but with Reanimated-driven color uniforms
 * for smooth transitions between vibe themes.
 *
 * Now supports dynamic shader switching with MORPH transitions.
 * Uses noise-based per-pixel blending for organic "ink spreading" effect.
 *
 * Usage:
 *   const ref = useRef<VibeMatrixAnimatedRef>(null);
 *   ref.current?.setVibe('PASSION'); // Smooth transition to red/pink
 *   ref.current?.setShader(newShaderSource); // Morph to new shader
 */

import React, { useMemo, useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { getShaderById } from '../../shaders/factory/registryV2';
import { VIBE_COLORS, COMPLEXITY_VALUES } from '../../constants/colors';
import { VibeColorTheme, VibeComplexity } from '../../types/vibe';
import { wrapWithMorph } from '../../shaders/morphWrapper';

// Default shader source from registry (shader ID 0 - Domain Warp)
const VIBE_MATRIX_SHADER = getShaderById(0).source;

// Fallback gradient for shader compile failures (matches TRUST theme)
const FALLBACK_COLORS = {
  primary: 'rgb(59, 130, 246)',   // Blue
  secondary: 'rgb(96, 165, 250)', // Lighter blue
};

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

// Single shader layer component with morph transition support
const ShaderLayer = React.memo(({
  shaderSource,
  colors,
  complexity,
  morphProgress,
  morphDirection,
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
  morphProgress: SharedValue<number>;
  morphDirection: number; // 1.0 = fading in, -1.0 = fading out
}) => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();
  const pinkAccent: [number, number, number] = [0.88, 0.11, 0.28];

  // Wrap shader with morph capability and compile
  const shader = useMemo(() => {
    const wrappedSource = wrapWithMorph(shaderSource);
    const effect = Skia.RuntimeEffect.Make(wrappedSource);
    if (!effect) {
      if (__DEV__) console.error('[ShaderLayer] SHADER COMPILE FAILED');
      if (__DEV__) console.error('[ShaderLayer] Source preview:', wrappedSource.slice(0, 500));
      return null;
    }
    return effect;
  }, [shaderSource]);

  // Create animated uniforms including morph params
  // CRITICAL: NO dependency array - required for useClock to update (GitHub Issue #2640)
  const uniforms = useDerivedValue(() => {
    return {
      u_time: clock.value,
      u_resolution: [width, height],
      u_complexity: complexity.value,
      u_colorA: [colors.colorA_r.value, colors.colorA_g.value, colors.colorA_b.value],
      u_colorB: [colors.colorB_r.value, colors.colorB_g.value, colors.colorB_b.value],
      u_colorC: pinkAccent,
      u_morphProgress: morphProgress.value,
      u_morphDirection: morphDirection,
    };
  });

  // Fallback gradient when shader fails to compile (never show blank screen)
  if (!shader) {
    return (
      <View style={styles.canvas}>
        <Canvas style={styles.canvas}>
          <Fill>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={[FALLBACK_COLORS.primary, FALLBACK_COLORS.secondary]}
            />
          </Fill>
        </Canvas>
      </View>
    );
  }

  return (
    <View style={styles.canvas}>
      {/* @ts-ignore - mode prop exists but not in type definitions (Skia 2.4.7) */}
      <Canvas style={styles.canvas} mode="continuous">
        <Fill>
          <Shader source={shader} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
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

    // Morph progress: 0 = fully showing current, 1 = fully showing next
    const morphProgress = useSharedValue(0);

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

    // Callback to complete shader transition (called from Reanimated worklet)
    const completeTransition = useCallback((newShader: string) => {
      // ONLY update state - DON'T reset morphProgress yet!
      // Will be reset AFTER React renders with new currentShader
      setCurrentShader(newShader);
      pendingUnmountRef.current = newShader;
    }, []);

    // Morph transition logic - uses noise-based per-pixel blending
    // Wrapped in useCallback to prevent stale closure issues
    const startShaderTransition = useCallback((newShader: string) => {
      if (newShader === currentShader) return;

      setNextShader(newShader);
      setIsTransitioning(true);
      morphProgress.value = 0; // Start at 0 (fully showing current)

      // Animate morph progress from 0→1 (organic blob transition)
      morphProgress.value = withTiming(1, { duration: transitionDuration }, () => {
        runOnJS(completeTransition)(newShader);
      });
    }, [currentShader, transitionDuration, morphProgress, completeTransition]);

    // Handle prop-driven shader changes
    useEffect(() => {
      if (propShaderSource && propShaderSource !== currentShader && !isTransitioning) {
        startShaderTransition(propShaderSource);
      }
    }, [propShaderSource, currentShader, isTransitioning, startShaderTransition]);

    // Cleanup effect - runs AFTER React renders with new currentShader
    // This ensures the new shader is visible before we reset morph state
    useEffect(() => {
      if (pendingUnmountRef.current && pendingUnmountRef.current === currentShader && nextShader) {
        // React has rendered with new currentShader - NOW safe to reset
        morphProgress.value = 0; // Reset for next transition
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
        {/* Current shader layer - fades OUT during transition */}
        <ShaderLayer
          shaderSource={currentShader}
          colors={colors}
          complexity={complexity}
          morphProgress={morphProgress}
          morphDirection={-1.0} // Fading out = show where noise < threshold
        />

        {/* Next shader layer - fades IN during transition (organic morph blend) */}
        {nextShader && (
          <ShaderLayer
            shaderSource={nextShader}
            colors={colors}
            complexity={complexity}
            morphProgress={morphProgress}
            morphDirection={1.0} // Fading in = show where noise > threshold
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
