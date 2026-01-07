/**
 * GlassFloor - Full-screen frosted glass overlay
 *
 * Provides subtle frosting between VibeMatrix shader and UI content.
 * Applied to auth/onboarding screens to improve text readability.
 * NOT used on demo screens where AbbyOrb is present.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const GlassFloor: React.FC = () => (
  <Animated.View
    entering={FadeIn.duration(400)}
    exiting={FadeOut.duration(400)}
    style={styles.container}
    pointerEvents="none"
  >
    <BlurView
      intensity={25}
      tint="light"
      style={styles.blur}
      pointerEvents="none"
    />
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GlassFloor;
