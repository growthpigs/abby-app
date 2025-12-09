/**
 * ANIMATION WORKING! Now testing animated shader uniforms.
 *
 * Using the pattern from Skia docs: pass uniforms as useDerivedValue
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Animated shader - time-based pulsing gradient
const ANIMATED_SHADER = `
uniform float u_time;
uniform float2 u_resolution;

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;

  // Pulsing effect (u_time goes 0->1 and back)
  float pulse = sin(u_time * 6.28318) * 0.5 + 0.5;

  // Colors
  half3 blue = half3(0.231, 0.510, 0.965);
  half3 cyan = half3(0.024, 0.714, 0.831);

  // Organic blend - diagonal with pulse modulation
  float blend = uv.x * 0.5 + uv.y * 0.5;
  blend = blend * (1.0 - pulse * 0.5) + pulse * 0.5;

  half3 color = mix(blue, cyan, blend);
  return half4(color, 1.0);
}
`;

export const ShaderTest: React.FC = () => {
  const { width, height } = useWindowDimensions();

  // Animated time: 0 -> 1 over 2 seconds, repeating
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      true // ping-pong for smooth loop
    );
  }, []);

  // Compile shader once
  const shader = useMemo(() => {
    const effect = Skia.RuntimeEffect.Make(ANIMATED_SHADER);
    if (!effect) {
      console.error('Failed to compile shader');
      return null;
    }
    return effect;
  }, []);

  // KEY: uniforms as useDerivedValue
  const uniforms = useDerivedValue(() => ({
    u_time: time.value,
    u_resolution: [width, height],
  }));

  if (!shader) {
    return null;
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

export default ShaderTest;
