/**
 * Abby App - AbbyOrb Test (CC2)
 *
 * Testing the full Layer 0 + Layer 1 stack:
 * - VibeMatrix (shader background)
 * - AbbyOrb (petal orb)
 *
 * Tap the orb to toggle between center/docked modes.
 * Tap the vibe buttons to change color themes.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { VibeMatrix } from './src/components/layers/VibeMatrix';
import { AbbyOrb } from './src/components/layers/AbbyOrb';
import { useVibeStore } from './src/store/useVibeStore';
import { VibeColorTheme, VibeComplexity } from './src/types/vibe';
import { OrbMode } from './src/types/orb';

type TestLayer = 'vibe' | 'orb';

// Vibe presets for testing
const VIBE_PRESETS: { label: string; theme: VibeColorTheme; complexity: VibeComplexity }[] = [
  { label: 'Trust', theme: 'TRUST', complexity: 'SMOOTHIE' },
  { label: 'Passion', theme: 'PASSION', complexity: 'STORM' },
  { label: 'Caution', theme: 'CAUTION', complexity: 'OCEAN' },
  { label: 'Growth', theme: 'GROWTH', complexity: 'FLOW' },
  { label: 'Deep', theme: 'DEEP', complexity: 'PAISLEY' },
];

export default function AppOrb() {
  const [orbMode, setOrbMode] = useState<OrbMode>('center');
  const [testLayer, setTestLayer] = useState<TestLayer>('orb');
  const { setVibe, colorTheme } = useVibeStore();

  const toggleOrbMode = () => {
    setOrbMode((prev) => (prev === 'center' ? 'docked' : 'center'));
  };

  return (
    <View style={styles.container}>
      {/* Layer 0: Shader Background */}
      <VibeMatrix />

      {/* Layer 1: Abby Orb (conditional) */}
      {testLayer === 'orb' && (
        <AbbyOrb mode={orbMode} onTap={toggleOrbMode} />
      )}

      {/* Layer Toggle at very top */}
      <View style={styles.layerToggle}>
        <Pressable
          style={[
            styles.layerButton,
            testLayer === 'vibe' && styles.layerButtonActive,
          ]}
          onPress={() => setTestLayer('vibe')}
        >
          <Text style={styles.layerButtonText}>VibeMatrix</Text>
        </Pressable>
        <Pressable
          style={[
            styles.layerButton,
            testLayer === 'orb' && styles.layerButtonActive,
          ]}
          onPress={() => setTestLayer('orb')}
        >
          <Text style={styles.layerButtonText}>AbbyOrb</Text>
        </Pressable>
      </View>

      {/* Test UI */}
      <View style={styles.topUI}>
        <Text style={styles.title}>ABBY</Text>
        <Text style={styles.subtitle}>
          {testLayer === 'orb' ? `Orb: ${orbMode} | ` : ''}Vibe: {colorTheme}
        </Text>
        {testLayer === 'orb' && (
          <Text style={styles.hint}>Tap orb to toggle mode</Text>
        )}
      </View>

      {/* Vibe selector */}
      <View style={styles.vibeSelector}>
        {VIBE_PRESETS.map((preset) => (
          <Pressable
            key={preset.theme}
            style={[
              styles.vibeButton,
              colorTheme === preset.theme && styles.vibeButtonActive,
            ]}
            onPress={() => setVibe(preset.theme, preset.complexity)}
          >
            <Text style={styles.vibeButtonText}>{preset.label}</Text>
          </Pressable>
        ))}
      </View>

      <StatusBar hidden />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  layerToggle: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  layerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  layerButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.8)',
  },
  layerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  topUI: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  vibeSelector: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  vibeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  vibeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
