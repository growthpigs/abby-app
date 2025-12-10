/**
 * Vibe Transition Test
 *
 * Test harness for animated color transitions between vibe themes.
 * Tap a button to see colors morph smoothly over 1 second.
 *
 * Usage: Set "main" in package.json to "App.transition-test.tsx"
 * or rename to App.tsx temporarily
 */

import React, { useRef, useState } from 'react';
import { View, Pressable, Text, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  VibeMatrixAnimated,
  VibeMatrixAnimatedRef,
} from './src/components/layers/VibeMatrixAnimated';
import { VibeColorTheme, VibeComplexity } from './src/types/vibe';

const VIBES: VibeColorTheme[] = ['TRUST', 'PASSION', 'CAUTION', 'GROWTH', 'DEEP'];
const COMPLEXITIES: VibeComplexity[] = ['SMOOTHIE', 'FLOW', 'OCEAN', 'STORM', 'PAISLEY'];

// Color indicators for each vibe
const VIBE_PREVIEW: Record<VibeColorTheme, string> = {
  TRUST: '#3B82F6',     // Blue
  PASSION: '#E11D48',   // Red
  CAUTION: '#F59E0B',   // Amber
  GROWTH: '#10B981',    // Green
  DEEP: '#4C1D95',      // Violet
};

export default function TransitionTest() {
  const vibeRef = useRef<VibeMatrixAnimatedRef>(null);
  const [currentVibe, setCurrentVibe] = useState<VibeColorTheme>('TRUST');
  const [currentComplexity, setCurrentComplexity] = useState<VibeComplexity>('FLOW');

  const handleVibePress = (theme: VibeColorTheme) => {
    setCurrentVibe(theme);
    vibeRef.current?.setVibe(theme);
  };

  const handleComplexityPress = (level: VibeComplexity) => {
    setCurrentComplexity(level);
    vibeRef.current?.setComplexity(level);
  };

  return (
    <View style={styles.container}>
      {/* Animated background */}
      <VibeMatrixAnimated
        ref={vibeRef}
        initialTheme="TRUST"
        initialComplexity="FLOW"
        transitionDuration={1000}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Current vibe label */}
        <View style={styles.header}>
          <Text style={styles.title}>Vibe Transitions</Text>
          <View style={styles.currentState}>
            <View style={[styles.colorDot, { backgroundColor: VIBE_PREVIEW[currentVibe] }]} />
            <Text style={styles.stateText}>
              {currentVibe} • {currentComplexity}
            </Text>
          </View>
        </View>

        {/* Vibe buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COLOR THEME</Text>
          <View style={styles.buttonRow}>
            {VIBES.map((theme) => (
              <Pressable
                key={theme}
                style={[
                  styles.btn,
                  currentVibe === theme && styles.btnActive,
                  { borderColor: VIBE_PREVIEW[theme] },
                ]}
                onPress={() => handleVibePress(theme)}
              >
                <View style={[styles.btnDot, { backgroundColor: VIBE_PREVIEW[theme] }]} />
                <Text style={[styles.btnText, currentVibe === theme && styles.btnTextActive]}>
                  {theme}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Complexity buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COMPLEXITY</Text>
          <View style={styles.buttonRow}>
            {COMPLEXITIES.map((level) => (
              <Pressable
                key={level}
                style={[styles.btn, currentComplexity === level && styles.btnActive]}
                onPress={() => handleComplexityPress(level)}
              >
                <Text style={[styles.btnText, currentComplexity === level && styles.btnTextActive]}>
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tap buttons to see smooth 1s color transitions
          </Text>
        </View>
      </SafeAreaView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  currentState: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  stateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  btnActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  btnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  btnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  btnTextActive: {
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
});
