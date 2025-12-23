/**
 * BackgroundShaderRenderer - Generic shader renderer for VibeMatrix backgrounds
 *
 * Replaces the 18 individual VibeMatrix*.tsx components with a single
 * reusable component that takes a shader source string.
 *
 * Usage:
 *   import { getBackgroundShader } from '../../shaders';
 *   <BackgroundShaderRenderer shaderSource={getBackgroundShader(5)} />
 */

import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useVibeController, useVibeColors } from '../../store/useVibeController';
import { COMPLEXITY_VALUES } from '../../constants/colors';

interface BackgroundShaderRendererProps {
  /**
   * GLSL shader source string
   * Must include uniforms: u_time, u_resolution, u_complexity, u_colorA, u_colorB, u_colorC
   */
  shaderSource: string;
  /**
   * Optional: use simple uniforms (just time/resolution/complexity)
   * Set to true for shaders that don't use color uniforms
   */
  simpleUniforms?: boolean;
}

/**
 * Fallback component shown when shader fails to compile
 */
const ShaderFallback: React.FC = () => (
  <Canvas style={styles.canvas}>
    <Fill color="#0a0a1a" />
  </Canvas>
);

export const BackgroundShaderRenderer: React.FC<BackgroundShaderRendererProps> = ({
  shaderSource,
  simpleUniforms = false,
}) => {
  const { width, height } = useWindowDimensions();
  const complexity = useVibeController((state) => state.complexity);
  const colors = useVibeColors();
  const clock = useClock();

  // Compile shader once (memoized by source)
  const shader = useMemo(() => {
    if (__DEV__) {
      console.log('[BackgroundShaderRenderer] Compiling shader...');
    }
    const effect = Skia.RuntimeEffect.Make(shaderSource);
    if (!effect) {
      console.error('[BackgroundShaderRenderer] SHADER COMPILE FAILED');
      console.error('[BackgroundShaderRenderer] Source preview:', shaderSource.slice(0, 200));
      return null;
    }
    if (__DEV__) {
      console.log('[BackgroundShaderRenderer] Shader compiled successfully');
    }
    return effect;
  }, [shaderSource]);

  const complexityValue = COMPLEXITY_VALUES[complexity];

  // Pink accent color (normalized RGB 0-1)
  // #E11D48 = [225, 29, 72] → [0.88, 0.11, 0.28]
  const pinkAccent: [number, number, number] = [0.88, 0.11, 0.28];

  // Create animated uniforms - always include all properties for type safety
  const uniforms = useDerivedValue(() => {
    const baseUniforms = {
      u_time: clock.value,
      u_resolution: [width, height] as [number, number],
      u_complexity: complexityValue,
    };

    if (simpleUniforms) {
      return baseUniforms;
    }

    return {
      ...baseUniforms,
      u_colorA: colors.colorA,
      u_colorB: colors.colorB,
      u_colorC: pinkAccent,
    };
  }, [clock, complexityValue, colors.colorA, colors.colorB, simpleUniforms]);

  if (!shader) {
    return <ShaderFallback />;
  }

  return (
    <View style={styles.canvas}>
      <Canvas style={styles.canvas}>
        <Fill>
          <Shader source={shader} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default BackgroundShaderRenderer;
