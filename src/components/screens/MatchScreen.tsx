/**
 * MatchScreen - Display match bio (no photo yet)
 *
 * Shows match name, age, bio, compatibility score.
 * Photo is hidden until payment. Uses GlassSheet for proper glassmorphism.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassSheet, GlassButton, Headline, Body, Caption } from '../ui';
import { useDemoStore } from '../../store/useDemoStore';

export interface MatchScreenProps {
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const MatchScreen: React.FC<MatchScreenProps> = ({
  onSecretBack,
  onSecretForward,
}) => {
  const advance = useDemoStore((state) => state.advance);
  const matchData = useDemoStore((state) => state.matchData);

  // Secret navigation handlers
  const handleSecretBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretBack?.();
  }, [onSecretBack]);

  const handleSecretForward = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretForward?.();
  }, [onSecretForward]);

  if (!matchData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GlassSheet height={0.67}>
        {/* Match found announcement */}
        <Caption style={styles.announcement}>MATCH FOUND</Caption>

        {/* Photo placeholder - blurred circle */}
        <View style={styles.photoPlaceholder}>
          <View style={styles.photoBlur}>
            <Caption style={styles.photoHint}>Photo Hidden</Caption>
          </View>
        </View>

        {/* Match info */}
        <View style={styles.infoSection}>
          <Headline style={styles.name}>
            {matchData.name}, {matchData.age}
          </Headline>
          <View style={styles.compatibilityBadge}>
            <Caption style={styles.compatibilityLabel}>
              {matchData.compatibilityScore}% Compatible
            </Caption>
          </View>
          <Body style={styles.bio}>{matchData.bio}</Body>
        </View>

        {/* Action button */}
        <View style={styles.buttonContainer}>
          <GlassButton onPress={advance}>
            I'm Interested
          </GlassButton>
        </View>
      </GlassSheet>

      {/* Secret navigation triggers (all 70x70, invisible) */}
      {/* Left = Back */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={10}
      />
      {/* Middle = Primary action (I'm Interested) */}
      <Pressable
        onPress={advance}
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
  announcement: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    letterSpacing: 1,
    fontSize: 11,
    color: '#5A5A5A', // Medium GRAY for readability on pale blur
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(225, 29, 72, 0.1)', // PASSION pink tint
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    // No border - clean glass design
  },
  photoBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  photoHint: {
    color: 'rgba(255, 255, 255, 0.6)', // White text on glass
    fontSize: 11,
    letterSpacing: 0.5,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 23,
    color: '#3A3A3A', // Charcoal like CertificationScreen headlines
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
    color: '#5A5A5A', // Charcoal gray like CertificationScreen description
    paddingHorizontal: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 32,
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

export default MatchScreen;
