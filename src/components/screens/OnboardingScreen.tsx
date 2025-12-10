/**
 * OnboardingScreen - Just the "Let's Begin" button
 *
 * No text - Abby will speak her intro via voice.
 * Just the blurry glass button at bottom.
 * Vibe: TRUST (blue, calm, welcoming)
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';

export const OnboardingScreen: React.FC = () => {
  const advance = useDemoStore((state) => state.advance);
  const setUserName = useDemoStore((state) => state.setUserName);
  const setFromAppState = useVibeController((state) => state.setFromAppState);

  const handleBegin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUserName('Demo User');
    setFromAppState('INTERVIEW_LIGHT');
    advance();
  };

  return (
    <View style={styles.container}>
      {/* Empty space - orb is visible, Abby will speak */}
      <View style={styles.spacer} />

      {/* "Let's Begin" button at bottom with blur backing */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleBegin}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <BlurView intensity={80} tint="light" style={styles.buttonBlur}>
            <Text style={styles.buttonText}>Let's Begin</Text>
          </BlurView>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    alignItems: 'center',
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonBlur: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // 15% dark tint
  },
  buttonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 18,
    color: '#666', // Lighter gray
    fontWeight: '600',
  },
});

export default OnboardingScreen;
