/**
 * GlassCard - Frosted glass container for content
 *
 * The "Vogue" layer - frosted glass sheet where information lives.
 * Text NEVER touches the background directly. Always on Glass.
 *
 * Usage:
 *   <GlassCard>
 *     <Text>Content here</Text>
 *   </GlassCard>
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
  borderRadius?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 80,
  padding = 24,
  borderRadius = 24,
}) => {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[styles.blur, { borderRadius, padding }]}
      >
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blur: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default GlassCard;
