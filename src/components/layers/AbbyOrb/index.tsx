/**
 * AbbyOrb - Layer 1 of the Glass Sandwich
 *
 * LiquidGlass4 Orb - Abby's visual representation.
 * She is never hidden; she only transforms.
 *
 * ARCHITECTURE: Full-screen shader with position/scale uniforms
 * - LiquidGlass4 renders at full screen resolution
 * - centerY uniform moves the orb vertically in UV space
 * - orbScale uniform controls apparent size
 * - Tap overlay tracks the animated orb position for hit detection
 *
 * Modes:
 * - center: Large (250px), top 15%, expressing/speaking
 * - docked: Small (80px), bottom 40px, waiting for user
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { AbbyOrbProps } from '../../../types/orb';
import { useVibeStore } from '../../../store/useVibeStore';
import { VIBE_COLORS } from '../../../constants/colors';
import { ORB_SIZES, ORB_TIMING, ORB_EASING } from './constants';
import { LiquidGlass4 } from '../LiquidGlass4';

/**
 * Calculate UV offset for a given screen Y position
 * UV coords: (y * 2 - height) / min(width, height)
 */
const calculateCenterY = (
  screenY: number,
  screenWidth: number,
  screenHeight: number
): number => {
  // Convert screen position to UV space
  // UV range is roughly -1 to 1 based on aspect ratio
  const minDim = Math.min(screenWidth, screenHeight);
  // Guard against division by zero during app initialization
  if (minDim === 0) return 0;
  return (screenY * 2 - screenHeight) / minDim;
};

export const AbbyOrb: React.FC<AbbyOrbProps> = ({ mode, onTap }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { colorTheme } = useVibeStore();

  // Get vibe colors for shader
  const shaderColors = useMemo(() => {
    const palette = VIBE_COLORS[colorTheme as keyof typeof VIBE_COLORS] || VIBE_COLORS.TRUST;
    return {
      colorA: palette.primary as [number, number, number],
      colorB: palette.secondary as [number, number, number],
    };
  }, [colorTheme]);

  // Animation progress (0 = center, 1 = docked)
  const progress = useSharedValue(mode === 'center' ? 0 : 1);
  const tapScale = useSharedValue(1);

  // Calculate UV positions for each mode
  const centerModeY = useMemo(() => {
    // Center: top 15% of screen + orb radius (so center is visible)
    const screenY = screenHeight * 0.15 + ORB_SIZES.center.radius;
    return calculateCenterY(screenY, screenWidth, screenHeight);
  }, [screenWidth, screenHeight]);

  const dockedModeY = useMemo(() => {
    // Docked: bottom 40px margin + orb radius
    const screenY = screenHeight - 40 - ORB_SIZES.docked.radius;
    return calculateCenterY(screenY, screenWidth, screenHeight);
  }, [screenWidth, screenHeight]);

  // Scale values
  const centerScale = 1.0;
  const dockedScale = ORB_SIZES.docked.diameter / ORB_SIZES.center.diameter; // 80/250 = 0.32

  // Animate mode transition
  useEffect(() => {
    progress.value = withTiming(mode === 'center' ? 0 : 1, {
      duration: ORB_TIMING.modeTransition,
      easing: Easing.bezier(...ORB_EASING.bezier),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Tap overlay position (tracks the orb in screen space)
  const animatedTapStyle = useAnimatedStyle(() => {
    // Interpolate size
    const size = ORB_SIZES.center.diameter +
      (ORB_SIZES.docked.diameter - ORB_SIZES.center.diameter) * progress.value;

    // Interpolate screen Y position (for tap target)
    const centerTop = screenHeight * 0.15;
    const dockedTop = screenHeight - 40 - ORB_SIZES.docked.diameter;
    const top = centerTop + (dockedTop - centerTop) * progress.value;

    return {
      width: size,
      height: size,
      top,
      left: (screenWidth - size) / 2, // Centered horizontally
      transform: [{ scale: tapScale.value }],
    };
  }, [screenWidth, screenHeight]);

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

  // Extract current values for shader props (can't pass SharedValue directly)
  // We need to use the raw calculated values since shader expects numbers
  const currentCenterY = mode === 'center' ? centerModeY : dockedModeY;
  const currentOrbScale = mode === 'center' ? centerScale : dockedScale;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Full-screen shader canvas */}
      <LiquidGlass4
        audioLevel={0}
        colorA={shaderColors.colorA}
        colorB={shaderColors.colorB}
        centerY={currentCenterY}
        orbScale={currentOrbScale}
      />

      {/* Tap overlay - positioned over orb for hit detection */}
      <Animated.View
        style={[styles.tapOverlay, animatedTapStyle]}
        pointerEvents="box-only"
      >
        <Pressable
          onPressIn={handleTapIn}
          onPressOut={handleTapOut}
          onPress={handlePress}
          style={styles.tapPressable}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  tapOverlay: {
    position: 'absolute',
    borderRadius: 9999, // Circular
  },
  tapPressable: {
    flex: 1,
    borderRadius: 9999,
  },
});

export default AbbyOrb;
