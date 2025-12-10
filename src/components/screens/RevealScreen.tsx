/**
 * RevealScreen - Photo reveal with celebration
 *
 * The climax of the demo - photo is revealed with animation.
 * Vibe: PASSION + PAISLEY (maximum celebration)
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { GlassCard, GlassButton, Headline, Body, Caption } from '../ui';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';

export const RevealScreen: React.FC = () => {
  const reset = useDemoStore((state) => state.reset);
  const matchData = useDemoStore((state) => state.matchData);
  const setOrbEnergy = useVibeController((state) => state.setOrbEnergy);
  const setColorTheme = useVibeController((state) => state.setColorTheme);

  // Animation values
  const photoScale = useSharedValue(0);
  const photoOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  // Trigger reveal animation
  useEffect(() => {
    setOrbEnergy('EXCITED');
    setColorTheme('PASSION');

    // Animate photo reveal
    photoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });
    photoOpacity.value = withSpring(1, { damping: 15 });

    // Animate content after photo
    contentOpacity.value = withDelay(600, withSpring(1, { damping: 15 }));
  }, []);

  const photoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoScale.value }],
    opacity: photoOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleStartOver = () => {
    reset();
  };

  if (!matchData) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Celebration header */}
      <Caption style={styles.celebration}>YOUR MATCH</Caption>

      {/* Photo reveal */}
      <Animated.View style={[styles.photoContainer, photoAnimatedStyle]}>
        <View style={styles.photoCircle}>
          {/* Placeholder gradient - in production would be actual photo */}
          <View style={styles.photoGradient}>
            <Headline style={styles.photoInitial}>
              {matchData.name.charAt(0)}
            </Headline>
          </View>
        </View>
      </Animated.View>

      {/* Match info */}
      <Animated.View style={contentAnimatedStyle}>
        <GlassCard style={styles.infoCard}>
          <Headline style={styles.name}>
            {matchData.name}, {matchData.age}
          </Headline>
          <View style={styles.compatibilityBadge}>
            <Caption style={styles.compatibilityLabel}>
              {matchData.compatibilityScore}% Compatible
            </Caption>
          </View>
          <Body style={styles.bio}>{matchData.bio}</Body>
        </GlassCard>

        {/* Actions */}
        <View style={styles.buttonContainer}>
          <GlassButton onPress={handleStartOver} variant="secondary">
            Start Over (Demo)
          </GlassButton>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 80,
    paddingHorizontal: 24,
  },
  celebration: {
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 4,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  photoCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  photoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E11D48',
  },
  photoInitial: {
    fontSize: 72,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  infoCard: {
    marginBottom: 24,
  },
  name: {
    textAlign: 'center',
    marginBottom: 12,
  },
  compatibilityBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  compatibilityLabel: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bio: {
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
  },
});

export default RevealScreen;
