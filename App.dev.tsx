/**
 * Dev Mode Switcher
 *
 * Toggle between test screens at runtime:
 * - SHADERS: Background + Orb shader testing (App.liquid)
 * - ABBY: Voice/TTS testing (App.abby)
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import both test apps
import AppLiquid from './App.liquid';
import AppAbby from './App.abby';

type DevMode = 'shaders' | 'abby';

export default function AppDev() {
  const [mode, setMode] = useState<DevMode>('shaders');

  const toggleMode = () => {
    setMode(mode === 'shaders' ? 'abby' : 'shaders');
  };

  return (
    <View style={styles.container}>
      {/* Render active screen */}
      {mode === 'shaders' ? <AppLiquid /> : <AppAbby />}

      {/* Mode toggle - top left, where time normally shows */}
      <Pressable style={styles.toggle} onPress={toggleMode}>
        <Text style={styles.toggleLabel}>SWITCH TO</Text>
        <Text style={styles.toggleValue}>
          {mode === 'shaders' ? 'ABBY' : 'SHADERS'}
        </Text>
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
