/**
 * Simple Shader Animation Test
 *
 * Minimal test to verify shader animation works.
 * If this animates, the pattern is correct.
 * If this doesn't animate, there's a fundamental issue.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { VibeMatrixSimple } from './src/components/layers/VibeMatrixSimple';

export default function AppSimple() {
  return (
    <View style={styles.container}>
      {/* Simple animated shader */}
      <VibeMatrixSimple />

      {/* Label */}
      <View style={styles.label}>
        <Text style={styles.text}>Simple Shader Test</Text>
        <Text style={styles.hint}>Should animate between blue and red</Text>
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
  label: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  hint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 8,
  },
});
