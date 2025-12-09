/**
 * OrbCore2D - The glowing core of Abby
 *
 * Based on the petal orb reference:
 * - Warm peach/orange center with bright white highlight
 * - Soft, luminous glow
 * - Off-center highlight for 3D depth
 */

import React, { useEffect } from 'react';
import { Canvas, Circle, RadialGradient, vec, Blur, Group } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { OrbCore2DProps } from '../../../types/orb';
import { ORB_TIMING } from './constants';

export const OrbCore2D: React.FC<OrbCore2DProps> = ({
  size,
  colors,
  breathing = true,
}) => {
  const scale = useSharedValue(1);

  // Breathing animation
  useEffect(() => {
    if (breathing) {
      scale.value = withRepeat(
        withSequence(
          withTiming(ORB_TIMING.breathingScale, {
            duration: ORB_TIMING.breathingDuration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: ORB_TIMING.breathingDuration / 2,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [breathing, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const center = vec(size / 2, size / 2);
  const radius = size / 2;

  // Highlight position - upper left for 3D effect (like the reference)
  const highlightPos = vec(size * 0.38, size * 0.38);

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
      <Canvas style={styles.canvas}>
        <Group>
          {/* Outer glow - soft edge - uses colors from vibe */}
          <Circle cx={center.x} cy={center.y} r={radius * 0.95}>
            <RadialGradient
              c={center}
              r={radius}
              colors={[
                colors.core.inner,   // Primary vibe color with glow
                colors.core.outer,   // Secondary vibe color fade
                'transparent',
              ]}
              positions={[0.3, 0.7, 1]}
            />
            <Blur blur={15} />
          </Circle>

          {/* Main sphere - gradient from highlight to vibe colors */}
          <Circle cx={center.x} cy={center.y} r={radius * 0.7}>
            <RadialGradient
              c={highlightPos}
              r={radius * 0.9}
              colors={[
                colors.core.highlight,  // Bright white/yellow highlight
                colors.core.inner,      // Primary vibe color
                colors.core.outer,      // Secondary vibe color
              ]}
              positions={[0, 0.4, 1]}
            />
            <Blur blur={4} />
          </Circle>

          {/* Inner bright spot - always white for luminosity */}
          <Circle cx={highlightPos.x} cy={highlightPos.y} r={radius * 0.25}>
            <RadialGradient
              c={highlightPos}
              r={radius * 0.3}
              colors={[
                colors.core.highlight,
                'transparent',
              ]}
              positions={[0, 1]}
            />
            <Blur blur={8} />
          </Circle>
        </Group>
      </Canvas>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  canvas: {
    flex: 1,
  },
});

export default OrbCore2D;
