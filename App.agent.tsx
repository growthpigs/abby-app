/**
 * App.agent.tsx - Voice Agent Test Entry Point
 *
 * Standalone test screen for voice conversation.
 * Includes background + orb + conversation UI.
 * Now uses client API instead of ElevenLabs.
 *
 * To use: Rename to App.tsx or import in App.tsx
 */

import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Background - uses parametric shader with registry
import { ParametricVibeMatrix } from './src/components/layers/ParametricVibeMatrix';

// Orb (G4 - audio reactive)
import { LiquidGlass4 } from './src/components/layers/LiquidGlass4';

// Conversation UI
import { AbbyConversation } from './src/components/AbbyConversation';

// Store
import { useVibeController, useVibeColors, useOrbState } from './src/store/useVibeController';

// Orb wrapper that connects to VibeController
function ConnectedOrb() {
  const { colorA, colorB } = useVibeColors();
  const { audioLevel } = useOrbState();

  return (
    <LiquidGlass4
      audioLevel={audioLevel}
      colorA={colorA as [number, number, number]}
      colorB={colorB as [number, number, number]}
    />
  );
}

// Header showing current state
function StatusHeader() {
  const colorTheme = useVibeController((s) => s.colorTheme);
  const activeMode = useVibeController((s) => s.activeMode);
  const audioLevel = useVibeController((s) => s.audioLevel);

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Talk to Abby</Text>
      <Text style={styles.subtitle}>
        {activeMode} | {colorTheme} | Audio: {(audioLevel * 100).toFixed(0)}%
      </Text>
    </View>
  );
}

export default function AppAgent() {
  return (
    <View style={styles.container}>
      {/* Layer 0: Background - Aurora spirals (shader 3) */}
      <View style={styles.backgroundLayer} pointerEvents="none">
        <ParametricVibeMatrix shaderId={3} />
      </View>

      {/* Layer 1: Orb */}
      <View style={styles.orbLayer} pointerEvents="none">
        <ConnectedOrb />
      </View>

      {/* Layer 2: Interface */}
      <SafeAreaView style={styles.interfaceLayer}>
        <StatusHeader />
        <AbbyConversation />
      </SafeAreaView>

      <StatusBar hidden />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  orbLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  interfaceLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});
