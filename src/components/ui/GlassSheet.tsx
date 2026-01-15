/**
 * GlassSheet - Bottom sheet with glassmorphism
 *
 * Non-draggable version for display screens (Match, Payment, Reveal).
 * Uses BlurView for the frosted glass effect.
 *
 * Usage:
 *   <GlassSheet height={0.6}>
 *     <Text>Content here</Text>
 *   </GlassSheet>
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GlassSheetProps {
  children: ReactNode;
  /**
   * Height as percentage of screen (0.0 - 1.0)
   * @default 0.6 (60% of screen)
   */
  height?: number;
  /**
   * Whether to animate in on mount
   * @default true
   */
  animateIn?: boolean;
  /**
   * Show drag handle indicator
   * @default true
   */
  showHandle?: boolean;
}

export const GlassSheet: React.FC<GlassSheetProps> = ({
  children,
  height = 0.6,
  animateIn = true,
  showHandle = true,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // Clamp height to valid range (10% - 100% of screen)
  const clampedHeight = Math.max(0.1, Math.min(1.0, height));
  const sheetHeight = SCREEN_HEIGHT * clampedHeight;

  useEffect(() => {
    if (animateIn) {
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT - sheetHeight,
        useNativeDriver: true,
        damping: 50,
        stiffness: 400,
      }).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT - sheetHeight);
    }
  }, [animateIn, sheetHeight]);

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          height: sheetHeight,
          transform: [{ translateY }],
        },
      ]}
    >
      <BlurView intensity={40} tint="light" style={styles.blur}>
        {showHandle && (
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    // No shadows - clean design
    elevation: 0,
  },
  blur: {
    flex: 1,
  },
  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
});

export default GlassSheet;
