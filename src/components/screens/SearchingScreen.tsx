/**
 * SearchingScreen - "Finding your match" animation
 *
 * Fake loading screen with status messages cycling.
 * Auto-advances after delay. Vibe: CAUTION (amber, anticipation)
 * Glass aesthetic with blur backing.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { DEMO_MATCH } from '../../data/demo-match';

const STATUS_MESSAGES = [
  'Analyzing your responses...',
  'Understanding your values...',
  'Finding compatible matches...',
  'Checking compatibility scores...',
  'Found someone special!',
];

export const SearchingScreen: React.FC = () => {
  const advance = useDemoStore((state) => state.advance);
  const setMatchData = useDemoStore((state) => state.setMatchData);
  const setFromAppState = useVibeController((state) => state.setFromAppState);
  const setOrbEnergy = useVibeController((state) => state.setOrbEnergy);

  const [statusIndex, setStatusIndex] = useState(0);
  const [dots, setDots] = useState('');

  // Cycle through status messages
  useEffect(() => {
    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < STATUS_MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(statusTimer);
  }, []);

  // Animate dots
  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(dotsTimer);
  }, []);

  // Set orb to engaged state during search
  useEffect(() => {
    setOrbEnergy('ENGAGED');
  }, []);

  // Auto-advance after finding match
  useEffect(() => {
    if (statusIndex === STATUS_MESSAGES.length - 1) {
      const advanceTimer = setTimeout(() => {
        setMatchData(DEMO_MATCH);
        setFromAppState('MATCH_FOUND');
        setOrbEnergy('EXCITED');
        advance();
      }, 2000);

      return () => clearTimeout(advanceTimer);
    }
  }, [statusIndex]);

  return (
    <View style={styles.container}>
      {/* Glassmorphic content card - positioned below orb */}
      <View style={styles.cardWrapper}>
        <BlurView intensity={60} tint="light" style={styles.card}>
          <Text style={styles.headline}>
            Searching{dots}
          </Text>
          <Text style={styles.status}>
            {STATUS_MESSAGES[statusIndex]}
          </Text>
          <View style={styles.progressDots}>
            {STATUS_MESSAGES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index <= statusIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.hint}>
            This may take a moment
          </Text>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', // Push card to bottom, orb stays centered
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  headline: {
    fontFamily: 'Merriweather_700Bold',
    fontSize: 28,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  status: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 24,
    minHeight: 44,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dotActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  hint: {
    fontFamily: 'Merriweather_300Light',
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default SearchingScreen;
