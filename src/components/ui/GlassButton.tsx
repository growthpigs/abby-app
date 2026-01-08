/**
 * GlassButton - Rich inline button with glass effect
 *
 * Pill-shaped button with blur background, press state, and haptic feedback.
 * "The Vogue" button - luxury tactile response.
 *
 * Usage:
 *   <GlassButton onPress={handlePress}>
 *     Let's Begin
 *   </GlassButton>
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface GlassButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
  /** Test ID for testing */
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200 });
    opacity.value = withTiming(1, { duration: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Derive accessible label from children if not provided
  const derivedLabel = accessibilityLabel ??
    (typeof children === 'string' ? children : undefined);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.container,
        variantStyles.container,
        animatedStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <Text style={[styles.text, variantStyles.text, textStyle]}>
          {children}
        </Text>
      </BlurView>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 9999, // Pill shape
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabled: {
    opacity: 0.4,
  },
  blur: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Primary variant - subtle glass
  primaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  // Secondary variant - more transparent
  secondaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Ghost variant - border only
  ghostContainer: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ghostText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
});

export default GlassButton;
