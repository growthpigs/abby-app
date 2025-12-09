/**
 * AbbyOrb - Layer 1 of the Glass Sandwich
 *
 * The Petal Orb - Abby's visual representation.
 * She is never hidden; she only transforms.
 *
 * Modes:
 * - center: Large (250px), top 15%, expressing/speaking
 * - docked: Small (80px), bottom 40px, waiting for user
 *
 * The orb color syncs with the VibeMatrix background.
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { AbbyOrbProps, OrbColors } from '../../../types/orb';
import { useVibeStore } from '../../../store/useVibeStore';
import { VIBE_COLORS } from '../../../constants/colors';
import { ORB_SIZES, ORB_TIMING, ORB_EASING } from './constants';
import OrbCore2D from './OrbCore2D';
import OrbPetalsShader from './OrbPetalsShader';
import OrbParticles from './OrbParticles';

/**
 * Convert RGB array to CSS rgba string
 */
const rgbToString = (rgb: [number, number, number], alpha: number = 1): string => {
  return `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)}, ${alpha})`;
};

/**
 * Generate orb colors from vibe theme
 */
const getOrbColors = (colorTheme: string): OrbColors => {
  const palette = VIBE_COLORS[colorTheme as keyof typeof VIBE_COLORS] || VIBE_COLORS.TRUST;

  // Core uses warm tones with bright highlight
  return {
    core: {
      highlight: 'rgba(255, 255, 255, 0.95)',
      inner: rgbToString(palette.primary, 0.8),
      outer: rgbToString(palette.secondary, 0.4),
    },
    petals: {
      warm: rgbToString(palette.primary, 0.8),
      cool: rgbToString(palette.secondary, 0.6),
    },
    particles: rgbToString(palette.secondary, 0.8),
  };
};

export const AbbyOrb: React.FC<AbbyOrbProps> = ({ mode, onTap }) => {
  const { height: screenHeight } = useWindowDimensions();
  const { colorTheme } = useVibeStore();

  // Animation values
  const progress = useSharedValue(mode === 'center' ? 0 : 1);
  const tapScale = useSharedValue(1);

  // Get colors based on current vibe
  const colors = useMemo(() => getOrbColors(colorTheme), [colorTheme]);

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

  // Determine if petals/particles should be visible
  const showPetals = mode === 'center';
  const showParticles = mode === 'center';

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
        {/* Particles layer (behind core) */}
        <OrbParticles
          orbSize={currentSize}
          color={colors.particles}
          visible={showParticles}
        />

        {/* Petals layer - GPU shader version */}
        <OrbPetalsShader
          size={currentSize}
          colors={colors}
          visible={showPetals}
        />

        {/* Core layer (on top) */}
        <OrbCore2D
          size={currentSize}
          colors={colors}
          breathing={mode === 'center'}
        />
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
});

export default AbbyOrb;
