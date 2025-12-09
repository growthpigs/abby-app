/**
 * Shader Development Toggle
 *
 * Toggle between:
 * - Background (VibeMatrix) - CC1 works on this
 * - Liquid Glass (blob) - CC2 works on this
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LiquidGlass } from './src/components/layers/LiquidGlass';
import { VibeMatrix } from './src/components/layers/VibeMatrix';

export default function AppLiquid() {
  const [showVibeMatrix, setShowVibeMatrix] = useState(false);

  return (
    <View style={styles.container}>
      {/* Shader - only one renders at a time */}
      {showVibeMatrix ? <VibeMatrix /> : <LiquidGlass />}

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Background</Text>
        <Switch
          value={!showVibeMatrix}
          onValueChange={(val) => setShowVibeMatrix(!val)}
          trackColor={{ false: '#444', true: '#444' }}
          thumbColor={'#fff'}
        />
        <Text style={styles.toggleLabel}>Liquid Glass</Text>
      </View>

      {/* Label */}
      <View style={styles.label}>
        <Text style={styles.text}>
          {showVibeMatrix ? 'Background' : 'Liquid Glass'}
        </Text>
        <Text style={styles.hint}>
          {showVibeMatrix ? 'VibeMatrix shader (CC1)' : 'SDF blobs (CC2)'}
        </Text>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  toggleContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 100,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  label: {
    position: 'absolute',
    top: 120,
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
