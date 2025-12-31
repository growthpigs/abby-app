/**
 * AbbyOrb - Layer 1 of the Glass Sandwich
 *
 * LiquidGlass4 Orb - Abby's visual representation.
 * She is never hidden; she only transforms.
 *
 * Uses LiquidGlass4 shader with 5-blob pentagon structure.
 *
 * Modes:
 * - center: Large (250px), top 15%, expressing/speaking
 * - docked: Small (80px), bottom 40px, waiting for user
 *
 * The orb color syncs with the VibeMatrix background.
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { AbbyOrbProps } from '../../../types/orb';
import { useVibeStore } from '../../../store/useVibeStore';
import { VIBE_COLORS } from '../../../constants/colors';
import { ORB_SIZES, ORB_TIMING, ORB_EASING } from './constants';
import { LiquidGlass4 } from '../LiquidGlass4';

/**
 * Get LiquidGlass4 colors from vibe theme
 * Returns RGB arrays normalized to 0-1 range
 */
const getShaderColors = (colorTheme: string): {
  colorA: [number, number, number];
  colorB: [number, number, number];
} => {
  const palette = VIBE_COLORS[colorTheme as keyof typeof VIBE_COLORS] || VIBE_COLORS.TRUST;

  return {
    colorA: palette.primary,
    colorB: palette.secondary,
  };
};

export const AbbyOrb: React.FC<AbbyOrbProps> = ({ mode, onTap }) => {
  const { height: screenHeight } = useWindowDimensions();
  const { colorTheme } = useVibeStore();

  // Animation values
  const progress = useSharedValue(mode === 'center' ? 0 : 1);
  const tapScale = useSharedValue(1);

  // Get colors based on current vibe (for LiquidGlass4)
  const shaderColors = useMemo(() => getShaderColors(colorTheme), [colorTheme]);

  // Animate mode transition
  useEffect(() => {
    progress.value = withTiming(mode === 'center' ? 0 : 1, {
      duration: ORB_TIMING.modeTransition,
      easing: Easing.bezier(...ORB_EASING.bezier),
    });
  }, [mode, progress]);

  // Animated container style
  const animatedContainerStyle = useAnimatedStyle(() => {
    const size = interpolate(
      progress.value,
      [0, 1],
      [ORB_SIZES.center.diameter, ORB_SIZES.docked.diameter]
    );

    // Calculate positions
    // Center: top 15% of screen
    // Docked: bottom 40px
    const centerTop = screenHeight * 0.15;
    const dockedTop = screenHeight - 40 - ORB_SIZES.docked.diameter;

    const top = interpolate(progress.value, [0, 1], [centerTop, dockedTop]);

    return {
      width: size,
      height: size,
      top,
      transform: [{ scale: tapScale.value }],
    };
  }, [screenHeight]);

  // Handle tap
  const handleTapIn = () => {
    tapScale.value = withSpring(ORB_TIMING.tapPulseScale, {
      damping: 10,
      stiffness: 400,
    });
  };

  const handleTapOut = () => {
    tapScale.value = withSpring(1, {
      damping: 10,
      stiffness: 400,
    });
  };

  const handlePress = () => {
    onTap?.();
  };

  // Current size for child components
  const currentSize = mode === 'center' ? ORB_SIZES.center.diameter : ORB_SIZES.docked.diameter;

  return (
    <Pressable
      onPressIn={handleTapIn}
      onPressOut={handleTapOut}
      onPress={handlePress}
      style={styles.pressable}
    >
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {/* LiquidGlass4 shader - 5-blob pentagon orb */}
        <View style={[styles.shaderContainer, { width: currentSize, height: currentSize }]}>
          <LiquidGlass4
            audioLevel={0}
            colorA={shaderColors.colorA}
            colorB={shaderColors.colorB}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 10,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shaderContainer: {
    borderRadius: 1000, // Large enough to be circular
    overflow: 'hidden',
  },
});

export default AbbyOrb;
