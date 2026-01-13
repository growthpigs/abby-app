/**
 * ClockTest - Minimal useClock test
 *
 * Displays the raw clock value to verify useClock is updating.
 * If this animates, useClock works. If static, there's a fundamental issue.
 */

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

// Simplest possible animated shader
const SIMPLE_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  vec4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;

    // Simple color cycling based on time
    float r = sin(time * 0.5) * 0.5 + 0.5;
    float g = sin(time * 0.7 + 2.0) * 0.5 + 0.5;
    float b = sin(time * 0.3 + 4.0) * 0.5 + 0.5;

    return vec4(r, g, b, 1.0);
  }
`);

export const ClockTest: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  // NO dependency array - critical for useClock to update
  const uniforms = useDerivedValue(() => {
    return {
      resolution: [width, height],
      time: clock.value / 1000,
    };
  });

  if (!SIMPLE_SHADER) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Shader failed to compile</Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Canvas style={styles.canvas}>
        <Fill>
          <Shader source={SIMPLE_SHADER} uniforms={uniforms} />
        </Fill>
      </Canvas>
      <View style={styles.overlay}>
        <Text style={styles.label}>CLOCK TEST</Text>
        <Text style={styles.hint}>
          If colors cycle smoothly, useClock works.{'\n'}
          If static, useClock is broken.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
  },
  label: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#300',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#f00',
    fontSize: 18,
  },
});

export default ClockTest;
