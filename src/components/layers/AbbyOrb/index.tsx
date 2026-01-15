/**
 * AbbyOrb - Layer 1 of the Glass Sandwich
 *
 * LiquidGlass4 Orb - Abby's visual representation.
 * She is never hidden; she only transforms.
 *
 * Uses LiquidGlass4 shader rendered FULL SCREEN with position/scale uniforms.
 * The shader creates the orb shape internally - glow extends to affect background.
 *
 * Modes:
 * - center: Large orb at top 15% of screen
 * - docked: Small orb at bottom of screen
 *
 * The orb color syncs with the VibeMatrix background.
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { AbbyOrbProps } from '../../../types/orb';
import { useVibeController } from '../../../store/useVibeController';
import { VIBE_COLORS } from '../../../constants/colors';
import { ORB_SIZES, ORB_POSITIONS, ORB_TIMING, ORB_EASING } from './constants';
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

/**
 * Convert screen Y position to shader UV Y coordinate
 * UV coords: (y * 2 - height) / min(width, height)
 */
const screenToUV = (screenY: number, width: number, height: number): number => {
  return (screenY * 2 - height) / Math.min(width, height);
};

export const AbbyOrb: React.FC<AbbyOrbProps> = ({ mode, onTap }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const colorTheme = useVibeController((state) => state.colorTheme);

  // Animation progress: 0 = center, 1 = docked
  const progress = useSharedValue(mode === 'center' ? 0 : 1);
  const tapScale = useSharedValue(1);

  // Get colors based on current vibe
  const shaderColors = useMemo(() => getShaderColors(colorTheme), [colorTheme]);

  // Calculate UV positions for each mode
  // Orb moved up 40px toward Dynamic Island
  const centerModeY = useMemo(() => {
    const screenY = screenHeight * 0.15 + ORB_SIZES.center.radius - 40;
    return screenToUV(screenY, screenWidth, screenHeight);
  }, [screenWidth, screenHeight]);

  const dockedModeY = useMemo(() => {
    const bottomOffset = ORB_POSITIONS.docked.bottom ?? 60;
    const screenY = screenHeight - bottomOffset - ORB_SIZES.docked.radius;
    return screenToUV(screenY, screenWidth, screenHeight);
  }, [screenWidth, screenHeight]);

  // Animate mode transition
  useEffect(() => {
    progress.value = withTiming(mode === 'center' ? 0 : 1, {
      duration: ORB_TIMING.modeTransition,
      easing: Easing.bezier(...ORB_EASING.bezier),
    });
  }, [mode, progress]);

  // Derived animated values for shader
  const centerY = useDerivedValue(() => {
    // Interpolate between center and docked Y positions
    const centerVal = centerModeY;
    const dockedVal = dockedModeY;
    return centerVal + (dockedVal - centerVal) * progress.value;
  }, [centerModeY, dockedModeY]);

  const orbScale = useDerivedValue(() => {
    // Interpolate between full scale and docked scale
    const centerScale = 1.0;
    const dockedScale = ORB_SIZES.docked.diameter / ORB_SIZES.center.diameter; // 0.32
    return centerScale + (dockedScale - centerScale) * progress.value;
  }, [progress]);

  // Animated style for tap overlay (positioned over the orb)
  const animatedTapStyle = useAnimatedStyle(() => {
    // Calculate screen position from UV
    // Inverse of screenToUV: screenY = (uvY * min + height) / 2
    const minDim = Math.min(screenWidth, screenHeight);
    const screenY = (centerY.value * minDim + screenHeight) / 2;

    // Calculate diameter based on scale
    const diameter = ORB_SIZES.center.diameter * orbScale.value;

    return {
      position: 'absolute' as const,
      top: screenY - diameter / 2,
      left: screenWidth / 2 - diameter / 2,
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
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

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Full-screen shader canvas - pass SharedValues directly for smooth animation */}
      <LiquidGlass4
        audioLevel={0}
        colorA={shaderColors.colorA}
        colorB={shaderColors.colorB}
        centerY={centerY}
        orbScale={orbScale}
      />

      {/* Tap overlay - positioned over orb center */}
      <Animated.View style={animatedTapStyle}>
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
  container: {
    ...StyleSheet.absoluteFillObject,
    // No zIndex - rendered between VibeMatrix (layer 0) and UI (layer 2)
    // The JSX order in App.tsx handles layering
  },
  tapPressable: {
    flex: 1,
  },
});

export default AbbyOrb;
