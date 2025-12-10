/**
 * Dev Mode Switcher
 *
 * Toggle between test screens at runtime:
 * - DEMO: Full demo flow (App.demo)
 * - SHADERS: Background + Orb shader testing (App.liquid)
 * - ABBY: Voice/TTS testing (App.abby) - disabled due to LiveKit native module issue
 */

import React, { useState, Suspense, lazy } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

// Import demo and shaders directly (no native dependencies)
import AppLiquid from './App.liquid';
import AppDemo from './App.demo';

// Lazy load App.abby to avoid LiveKit native module error
// Uncomment after running: cd ios && pod install
// const AppAbby = lazy(() => import('./App.abby'));

// Placeholder for App.abby until native modules are linked
const AppAbbyPlaceholder = () => (
  <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center', padding: 24 }}>
      Voice Mode Disabled{'\n\n'}
      Run 'cd ios && pod install' then rebuild{'\n'}
      to enable ElevenLabs voice features.
    </Text>
  </View>
);

type DevMode = 'shaders' | 'abby' | 'demo';

const MODE_ORDER: DevMode[] = ['demo', 'shaders', 'abby'];

export default function AppDev() {
  const [mode, setMode] = useState<DevMode>('demo');

  const cycleMode = () => {
    const currentIndex = MODE_ORDER.indexOf(mode);
    const nextIndex = (currentIndex + 1) % MODE_ORDER.length;
    setMode(MODE_ORDER[nextIndex]);
  };

  const renderApp = () => {
    switch (mode) {
      case 'demo':
        return <AppDemo />;
      case 'shaders':
        return <AppLiquid />;
      case 'abby':
        return <AppAbbyPlaceholder />;
      default:
        return <AppDemo />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Render active screen */}
      {renderApp()}

      {/* Mode toggle - top left with glass blur */}
      <Pressable style={styles.toggle} onPress={cycleMode}>
        <BlurView intensity={60} tint="light" style={styles.toggleBlur}>
          <Text style={styles.toggleLabel}>SWITCH TO</Text>
          <Text style={styles.toggleValue}>
            {MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length].toUpperCase()}
          </Text>
        </BlurView>
      </Pressable>

      {/* A button - top right (only show in shaders mode) */}
      {mode === 'shaders' && (
        <Pressable style={styles.abbyButton} onPress={() => setMode('abby')}>
          <Text style={styles.abbyButtonText}>A</Text>
        </Pressable>
      )}

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
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 999,
  },
  toggleBlur: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  toggleLabel: {
    color: '#999',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  toggleValue: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
  },
  abbyButton: {
    position: 'absolute',
    top: 17,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(225, 29, 72, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  abbyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
