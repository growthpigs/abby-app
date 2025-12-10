/**
 * SearchingScreen - "Finding your match" animation
 *
 * Fake loading screen with status messages cycling.
 * Auto-advances after delay. Vibe: CAUTION (amber, anticipation)
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Headline, Body, Caption } from '../ui';
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
      <View style={styles.content}>
        <Headline style={styles.headline}>
          Searching{dots}
        </Headline>
        <Body style={styles.status}>
          {STATUS_MESSAGES[statusIndex]}
        </Body>
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
        <Caption style={styles.hint}>
          This may take a moment
        </Caption>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: 'center',
    minWidth: 200,
  },
  status: {
    fontSize: 18,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
    minHeight: 50,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  hint: {
    textAlign: 'center',
  },
});

export default SearchingScreen;
