/**
 * MatchScreen - Display match bio (no photo yet)
 *
 * Shows match name, age, bio, compatibility score.
 * Photo is hidden until payment. Vibe: PASSION (red, excitement)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassCard, GlassButton, Headline, Body, Caption } from '../ui';
import { useDemoStore } from '../../store/useDemoStore';

export const MatchScreen: React.FC = () => {
  const advance = useDemoStore((state) => state.advance);
  const matchData = useDemoStore((state) => state.matchData);

  if (!matchData) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Match found announcement */}
      <Caption style={styles.announcement}>MATCH FOUND</Caption>

      {/* Photo placeholder */}
      <View style={styles.photoPlaceholder}>
        <View style={styles.photoBlur}>
          <Body style={styles.photoHint}>Photo Hidden</Body>
        </View>
      </View>

      {/* Match info card */}
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

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <GlassButton onPress={advance}>
          I'm Interested
        </GlassButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 100,
    paddingHorizontal: 24,
  },
  announcement: {
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  photoPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  photoBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  photoHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
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

export default MatchScreen;
