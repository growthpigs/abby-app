/**
 * Dev Mode Switcher
 *
 * Toggle between test screens at runtime:
 * - SHADERS: Background + Orb shader testing (App.liquid)
 * - ABBY: Voice/TTS testing (App.abby)
 * - VIBES: Color transition testing (App.transition-test)
 * - 750: Full 4-axis vibe system (App.vibe-test)
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import all test apps
import AppLiquid from './App.liquid';
import AppAbby from './App.abby';
import AppTransition from './App.transition-test';
import AppVibeTest from './App.vibe-test';

type DevMode = 'shaders' | 'abby' | 'vibes' | '750';

const MODE_ORDER: DevMode[] = ['shaders', 'abby', 'vibes', '750'];
const MODE_LABELS: Record<DevMode, string> = {
  shaders: 'SHADERS',
  abby: 'ABBY',
  vibes: 'VIBES',
  '750': '750-STATE',
};

export default function AppDev() {
  const [mode, setMode] = useState<DevMode>('750'); // Start on 750 to test new system

  const toggleMode = () => {
    const currentIndex = MODE_ORDER.indexOf(mode);
    const nextIndex = (currentIndex + 1) % MODE_ORDER.length;
    setMode(MODE_ORDER[nextIndex]);
  };

  const renderApp = () => {
    switch (mode) {
      case 'shaders':
        return <AppLiquid />;
      case 'abby':
        return <AppAbby />;
      case 'vibes':
        return <AppTransition />;
      case '750':
        return <AppVibeTest />;
    }
  };

  const getNextMode = () => {
    const currentIndex = MODE_ORDER.indexOf(mode);
    const nextIndex = (currentIndex + 1) % MODE_ORDER.length;
    return MODE_LABELS[MODE_ORDER[nextIndex]];
  };

  return (
    <View style={styles.container}>
      {/* Render active screen */}
      {renderApp()}

      {/* Mode toggle - top left, where time normally shows */}
      <Pressable style={styles.toggle} onPress={toggleMode}>
        <Text style={styles.toggleLabel}>SWITCH TO</Text>
        <Text style={styles.toggleValue}>{getNextMode()}</Text>
      </Pressable>

      {/* Hide status bar */}
      <StatusBar hidden />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggle: {
    position: 'absolute',
    top: 17,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 999,
    alignItems: 'center',
  },
  toggleLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  toggleValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
