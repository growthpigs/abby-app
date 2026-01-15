/**
 * RevealScreen - Photo reveal with celebration
 *
 * The climax of the demo - photo is revealed with animation.
 * Uses GlassSheet with animated content inside.
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { GlassSheet, GlassButton, Headline, Body, Caption } from '../ui';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';

export interface RevealScreenProps {
  onSecretBack?: () => void;
  onSecretForward?: () => void;
  onMessage?: (matchName: string) => void;
  onFindMoreMatches?: () => void;
  onViewAllMatches?: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  onSecretBack,
  onSecretForward,
  onMessage,
  onFindMoreMatches,
  onViewAllMatches,
}) => {
  const reset = useDemoStore((state) => state.reset);
  const advance = useDemoStore((state) => state.advance);
  const matchData = useDemoStore((state) => state.matchData);
  const setOrbEnergy = useVibeController((state) => state.setOrbEnergy);
  const setColorTheme = useVibeController((state) => state.setColorTheme);

  // Secret navigation handlers
  const handleSecretBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretBack?.();
  }, [onSecretBack]);

  const handleSecretForward = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretForward?.();
  }, [onSecretForward]);

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

  const handleMessage = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (matchData?.name) {
      onMessage?.(matchData.name);
    }
    // Fallback: advance to Coach for now
    if (!onMessage) {
      advance();
    }
  }, [matchData?.name, onMessage, advance]);

  const handleFindMoreMatches = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onFindMoreMatches) {
      onFindMoreMatches();
    } else {
      // Fallback: reset to start new interview
      reset();
    }
  }, [onFindMoreMatches, reset]);

  const handleViewAllMatches = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewAllMatches?.();
  }, [onViewAllMatches]);

  // Navigate to coach screen (secret middle trigger or "Meet Your Coach" button)
  const handleMeetCoach = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    advance(); // Advance to CoachScreen
  }, [advance]);

  // Guard against missing or incomplete matchData
  if (!matchData || !matchData.name || typeof matchData.age !== 'number') {
    return null;
  }

  return (
    <View style={styles.container}>
      <GlassSheet height={1}>
        {/* Celebration header */}
        <Caption style={styles.celebration}>YOUR MATCH</Caption>

        {/* Photo reveal - animated */}
        <Animated.View style={[styles.photoContainer, photoAnimatedStyle]}>
          <View style={styles.photoCircle}>
            <View style={styles.photoGradient}>
              <Headline style={styles.photoInitial}>
                {matchData.name.charAt(0)}
              </Headline>
            </View>
          </View>
        </Animated.View>

        {/* Match info - animated */}
        <Animated.View style={[styles.infoSection, contentAnimatedStyle]}>
          <Headline style={styles.name}>
            {matchData.name}, {matchData.age}
          </Headline>
          <View style={styles.compatibilityBadge}>
            <Caption style={styles.compatibilityLabel}>
              {matchData.compatibilityScore}% Compatible
            </Caption>
          </View>
          <Body style={styles.bio}>{matchData.bio}</Body>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View style={[styles.buttonContainer, contentAnimatedStyle]}>
          <GlassButton onPress={handleMessage} variant="primary">
            Message {matchData.name}
          </GlassButton>
          <GlassButton onPress={handleFindMoreMatches} variant="secondary">
            Find More Matches
          </GlassButton>
          {onViewAllMatches && (
            <Pressable onPress={handleViewAllMatches} style={styles.viewAllLink}>
              <Caption style={styles.viewAllText}>View All Matches →</Caption>
            </Pressable>
          )}
        </Animated.View>
      </GlassSheet>

      {/* Secret navigation triggers (all 70x70, invisible) */}
      {/* Left = Back */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={10}
      />
      {/* Middle = Primary action (Meet Your Coach) */}
      <Pressable
        onPress={handleMeetCoach}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
      {/* Right = Forward */}
      <Pressable
        onPress={handleSecretForward}
        style={styles.secretForwardTrigger}
        hitSlop={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  celebration: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    letterSpacing: 1,
    fontSize: 11,
    color: '#5A5A5A', // Medium GRAY for readability on pale blur
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  photoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(225, 29, 72, 0.4)',
    // No shadows - clean design
    elevation: 0,
  },
  photoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E11D48',
  },
  photoInitial: {
    fontSize: 64,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 23,
    color: '#3A3A3A', // Charcoal like CertificationScreen
  },
  compatibilityBadge: {
    backgroundColor: 'rgba(225, 29, 72, 0.15)', // PASSION pink tint
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  compatibilityLabel: {
    color: '#E11D48', // PASSION pink
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bio: {
    textAlign: 'center',
    lineHeight: 21,
    fontSize: 14,
    color: '#5A5A5A', // Charcoal gray
    paddingHorizontal: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 32,
  },
  viewAllLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewAllText: {
    color: 'rgba(255, 255, 255, 0.7)', // Subtle white on glass
    fontSize: 13,
    fontWeight: '500',
  },

  // Secret navigation triggers (invisible - for demo navigation)
  secretBackTrigger: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    // No visible border - truly invisible
  },
  secretMiddleTrigger: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    zIndex: 9999,
    // No visible border - truly invisible
  },
  secretForwardTrigger: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    // No visible border - truly invisible
  },
});

export default RevealScreen;
