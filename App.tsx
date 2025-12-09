/**
 * ABBY - VibeMatrix Test
 *
 * Tests the animated blob background with controls
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { VibeMatrix } from './src/components/layers/VibeMatrix';
import { useVibeStore } from './src/store/useVibeStore';
import { VibeColorTheme, VibeComplexity } from './src/types/vibe';

const COLOR_THEMES: VibeColorTheme[] = ['TRUST', 'PASSION', 'CAUTION', 'GROWTH', 'DEEP'];
const COMPLEXITY_LEVELS: VibeComplexity[] = ['SMOOTHIE', 'FLOW', 'OCEAN', 'STORM', 'PAISLEY'];

export default function App() {
  const { colorTheme, complexity, setColorTheme, setComplexity } = useVibeStore();

  const nextTheme = () => {
    const currentIndex = COLOR_THEMES.indexOf(colorTheme);
    const nextIndex = (currentIndex + 1) % COLOR_THEMES.length;
    setColorTheme(COLOR_THEMES[nextIndex]);
  };

  const nextComplexity = () => {
    const currentIndex = COMPLEXITY_LEVELS.indexOf(complexity);
    const nextIndex = (currentIndex + 1) % COMPLEXITY_LEVELS.length;
    setComplexity(COMPLEXITY_LEVELS[nextIndex]);
  };

  return (
    <View style={styles.container}>
      {/* Layer 0: Animated Background */}
      <VibeMatrix />

      {/* Controls Overlay */}
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>VIBE MATRIX</Text>
          <Text style={styles.subtitle}>Tap buttons to change</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={nextTheme}>
            <Text style={styles.buttonLabel}>COLOR</Text>
            <Text style={styles.buttonValue}>{colorTheme}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={nextComplexity}>
            <Text style={styles.buttonLabel}>COMPLEXITY</Text>
            <Text style={styles.buttonValue}>{complexity}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            5 colors × 5 complexity levels = 25 vibes
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  buttonValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
});
