/**
 * Shader Development Toggle
 *
 * Two rows of tabs:
 * - TOP ROW (Orb): None, G1-G5, Petals (orb/foreground effects)
 * - BOTTOM ROW (BG): 1BG-7BG (background versions)
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LiquidGlass } from './src/components/layers/LiquidGlass';
import { LiquidGlass2 } from './src/components/layers/LiquidGlass2';
import { LiquidGlass3 } from './src/components/layers/LiquidGlass3';
import { LiquidGlass4 } from './src/components/layers/LiquidGlass4';
import { LiquidGlass5 } from './src/components/layers/LiquidGlass5';
import { VibeMatrix } from './src/components/layers/VibeMatrix';
import { VibeMatrix2 } from './src/components/layers/VibeMatrix2';
import { VibeMatrix3 } from './src/components/layers/VibeMatrix3';
import { VibeMatrix4 } from './src/components/layers/VibeMatrix4';
import { VibeMatrix5 } from './src/components/layers/VibeMatrix5';
import { VibeMatrix6 } from './src/components/layers/VibeMatrix6';
import { VibeMatrix7 } from './src/components/layers/VibeMatrix7';
import { LiquidRosePetals } from './src/components/layers/LiquidRosePetals';

// Orb/foreground modes
type OrbMode = 'none' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'petals';

// Background modes (7 versions of VibeMatrix)
type BgMode = '1BG' | '2BG' | '3BG' | '4BG' | '5BG' | '6BG' | '7BG';

const ORB_INFO: Record<OrbMode, { label: string; hint: string }> = {
  none: { label: 'None', hint: 'Background only' },
  G1: { label: 'G1', hint: 'Original flowing amoeba' },
  G2: { label: 'G2', hint: 'Contained orb with organic edge' },
  G3: { label: 'G3', hint: 'Core with orbiting satellites' },
  G4: { label: 'G4', hint: 'Noisy organic breathing edges' },
  G5: { label: 'G5', hint: 'Layered depth parallax' },
  petals: { label: 'Petals', hint: 'Liquid petals with DoF' },
};

const BG_INFO: Record<BgMode, { label: string; hint: string }> = {
  '1BG': { label: '1BG', hint: 'Tie-dye flow + pink' },
  '2BG': { label: '2BG', hint: 'Fire swirls (red/orange/yellow)' },
  '3BG': { label: '3BG', hint: 'Aurora spirals (pink/blue/cyan)' },
  '4BG': { label: '4BG', hint: 'Cellular dreams (mint/teal)' },
  '5BG': { label: '5BG', hint: 'Liquid marble (navy/gold)' },
  '6BG': { label: '6BG', hint: 'Kaleidoscope bloom (fuchsia)' },
  '7BG': { label: '7BG', hint: 'Flowing streams (lime/aqua)' },
};

export default function AppLiquid() {
  const [orbMode, setOrbMode] = useState<OrbMode>('none');
  const [bgMode, setBgMode] = useState<BgMode>('1BG');

  const renderOrb = () => {
    switch (orbMode) {
      case 'G1':
        return <LiquidGlass />;
      case 'G2':
        return <LiquidGlass2 />;
      case 'G3':
        return <LiquidGlass3 />;
      case 'G4':
        return <LiquidGlass4 />;
      case 'G5':
        return <LiquidGlass5 />;
      case 'petals':
        return <LiquidRosePetals />;
      case 'none':
      default:
        return null;
    }
  };

  const renderBackground = () => {
    switch (bgMode) {
      case '1BG':
        return <VibeMatrix />;
      case '2BG':
        return <VibeMatrix2 />;
      case '3BG':
        return <VibeMatrix3 />;
      case '4BG':
        return <VibeMatrix4 />;
      case '5BG':
        return <VibeMatrix5 />;
      case '6BG':
        return <VibeMatrix6 />;
      case '7BG':
        return <VibeMatrix7 />;
      default:
        return <VibeMatrix />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Background layer (always rendered) - no pointer events */}
      <View style={styles.shaderLayer} pointerEvents="none">
        {renderBackground()}
      </View>

      {/* Orb/foreground layer (optional) - no pointer events */}
      <View style={styles.shaderLayer} pointerEvents="none">
        {renderOrb()}
      </View>

      {/* TOP ROW - Orb tabs */}
      <View style={styles.topRow}>
        <Text style={styles.rowLabel}>Orb:</Text>
        {(['none', 'G1', 'G2', 'G3', 'G4', 'G5', 'petals'] as OrbMode[]).map((m) => (
          <Pressable
            key={m}
            style={[styles.button, orbMode === m && styles.buttonActive]}
            onPress={() => setOrbMode(m)}
          >
            <Text style={[styles.buttonText, orbMode === m && styles.buttonTextActive]}>
              {ORB_INFO[m].label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* BOTTOM ROW - Background tabs (scrollable) */}
      <View style={styles.bottomRow}>
        <Text style={styles.rowLabel}>BG:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bgScrollContent}
        >
          {(['1BG', '2BG', '3BG', '4BG', '5BG', '6BG', '7BG'] as BgMode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.button, bgMode === m && styles.buttonActive]}
              onPress={() => setBgMode(m)}
            >
              <Text style={[styles.buttonText, bgMode === m && styles.buttonTextActive]}>
                {BG_INFO[m].label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Label showing current selection */}
      <View style={styles.label}>
        <Text style={styles.text}>
          {orbMode !== 'none' ? ORB_INFO[orbMode].label : ''} {BG_INFO[bgMode].label}
        </Text>
        <Text style={styles.hint}>
          {orbMode !== 'none' ? ORB_INFO[orbMode].hint : BG_INFO[bgMode].hint}
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
  shaderLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  topRow: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 100,
    paddingHorizontal: 10,
  },
  bottomRow: {
    position: 'absolute',
    top: 105,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    paddingLeft: 10,
  },
  bgScrollContent: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 10,
  },
  rowLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  buttonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: '#fff',
  },
  label: {
    position: 'absolute',
    top: 155,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  hint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 6,
  },
});
