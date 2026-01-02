/**
 * ParametricVibeMatrix - Universal shader component
 *
 * Replaces all 18 individual VibeMatrix components with a single
 * parametric component that takes a shader ID from the registry.
 *
 * Usage:
 *   <ParametricVibeMatrix shaderId={5} />  // Renders LIQUID_MARBLE
 *   <ParametricVibeMatrix shaderName="WARM_FIRE_SWIRLS" />
 *
 * This eliminates ~1200 lines of duplicate code across 18 files.
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
import { useVibeController } from '../../store/useVibeController';
import { getShaderById, getShaderByName, ShaderId } from '../../shaders/registry';

export interface ParametricVibeMatrixProps {
  /** Shader ID (0-18) - takes precedence over shaderName */
  shaderId?: ShaderId | number;
  /** Shader name (e.g., 'LIQUID_MARBLE') - used if shaderId not provided */
  shaderName?: string;
}

export const ParametricVibeMatrix: React.FC<ParametricVibeMatrixProps> = ({
  shaderId,
  shaderName,
}) => {
  const { width, height } = useWindowDimensions();
  const complexityValue = useVibeController((state) => state.complexityValue);
  const clock = useClock();

  // Get shader from registry
  const shaderEntry = useMemo(() => {
    if (shaderId !== undefined) {
      return getShaderById(shaderId);
    }
    if (shaderName) {
      return getShaderByName(shaderName);
    }
    return getShaderById(0); // Default to base shader
  }, [shaderId, shaderName]);

  // Compile shader
  const shader = useMemo(() => {
    if (__DEV__) console.log(`[ParametricVibeMatrix] Compiling shader: ${shaderEntry.name}`);
    const effect = Skia.RuntimeEffect.Make(shaderEntry.source);
    if (!effect) {
      console.error(`[ParametricVibeMatrix] SHADER COMPILE FAILED: ${shaderEntry.name}`);
      return null;
    }
    if (__DEV__) console.log(`[ParametricVibeMatrix] Shader compiled: ${shaderEntry.name}`);
    return effect;
  }, [shaderEntry]);

  // Animated uniforms
  const uniforms = useDerivedValue(() => {
    return {
      u_time: clock.value,
      u_resolution: [width, height],
      u_complexity: complexityValue,
    };
  }, [clock, width, height, complexityValue]);

  // Fallback if shader fails to compile
  if (!shader) {
    return (
      <View style={styles.canvas}>
        <Canvas style={styles.canvas}>
          <Fill color={shaderEntry.fallbackColor} />
        </Canvas>
      </View>
    );
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

export default ParametricVibeMatrix;
