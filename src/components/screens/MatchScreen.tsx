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
        hitSlop={0}
      />
      {/* Middle = Primary action (I'm Interested) */}
      <Pressable
        onPress={advance}
        style={styles.secretMiddleTrigger}
        hitSlop={0}
      />
      {/* Right = Forward */}
      <Pressable
        onPress={handleSecretForward}
        style={styles.secretForwardTrigger}
        hitSlop={0}
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
    letterSpacing: 3,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  photoBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  photoHint: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: 12,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    textAlign: 'center',
    marginBottom: 12,
    color: 'rgba(0, 0, 0, 0.85)',
  },
  compatibilityBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  compatibilityLabel: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bio: {
    textAlign: 'center',
    lineHeight: 22,
    color: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 32,
  },

  // Secret navigation triggers
  secretBackTrigger: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  secretMiddleTrigger: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  secretForwardTrigger: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
});

export default MatchScreen;
