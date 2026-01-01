/**
 * Shader Development Toggle
 *
 * Four rows of tabs (all left-aligned):
 * - ROW 1 (Glass): G1-G9 (glass/orb effects)
 * - ROW 2 (BG): 1-7 (original backgrounds)
 * - ROW 3 (BG2): 8-13 (William Mapan inspired)
 * - ROW 4 (BG3): 14-18 (artistic effects)
 *
 * REFACTORED: Now uses ParametricVibeMatrix with shader registry
 * instead of 18 individual component imports.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Glass components (still need individual imports for now)
import { LiquidGlass } from './src/components/layers/LiquidGlass';
import { LiquidGlass2 } from './src/components/layers/LiquidGlass2';
import { LiquidGlass3 } from './src/components/layers/LiquidGlass3';
import { LiquidGlass4 } from './src/components/layers/LiquidGlass4';
import { LiquidGlass5 } from './src/components/layers/LiquidGlass5';
import { LiquidGlass6 } from './src/components/layers/LiquidGlass6';
import { LiquidGlass7 } from './src/components/layers/LiquidGlass7';
import { LiquidGlass8 } from './src/components/layers/LiquidGlass8';
import { LiquidGlass9 } from './src/components/layers/LiquidGlass9';
import { LiquidGlass10 } from './src/components/layers/LiquidGlass10';

// Single parametric component replaces 18 VibeMatrix imports!
import { ParametricVibeMatrix } from './src/components/layers/ParametricVibeMatrix';

import { FPSMonitor } from './src/components/dev/FPSMonitor';

// Glass/orb modes
type GlassMode = 'none' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7' | 'G8' | 'G9' | 'G10';

// Background modes (18 versions) - now just numeric IDs
type BgMode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;

const GLASS_INFO: Record<GlassMode, { label: string; hint: string }> = {
  none: { label: '-', hint: 'No glass' },
  G1: { label: 'G1', hint: 'Flowing amoeba' },
  G2: { label: 'G2', hint: 'Contained orb' },
  G3: { label: 'G3', hint: 'Orbiting satellites' },
  G4: { label: 'G4', hint: 'Abby talking orb' },
  G5: { label: 'G5', hint: 'Depth parallax' },
  G6: { label: 'G6', hint: 'Wave shells + core' },
  G7: { label: 'G7', hint: 'Crashing waves' },
  G8: { label: 'G8', hint: 'Spiral nebula' },
  G9: { label: 'G9', hint: 'Fluid ribbons' },
  G10: { label: 'G10', hint: 'Lava orb' },
};

const BG_INFO: Record<BgMode, { label: string; hint: string }> = {
  1: { label: '1', hint: 'Tie-dye pink' },
  2: { label: '2', hint: 'Fire swirls' },
  3: { label: '3', hint: 'Aurora spirals' },
  4: { label: '4', hint: 'Aerial reef' },
  5: { label: '5', hint: 'Liquid marble' },
  6: { label: '6', hint: 'Kaleidoscope' },
  7: { label: '7', hint: 'Ocean shore' },
  8: { label: '8', hint: 'Deep ocean' },
  9: { label: '9', hint: 'Blob metaballs' },
  10: { label: '10', hint: 'Chromatic bloom' },
  11: { label: '11', hint: 'Coral reef' },
  12: { label: '12', hint: 'Stippled gradient' },
  13: { label: '13', hint: 'Fluid shoreline' },
  14: { label: '14', hint: 'Tidal pools' },
  15: { label: '15', hint: 'Seafoam' },
  16: { label: '16', hint: 'Ink bloom' },
  17: { label: '17', hint: 'Lagoon' },
  18: { label: '18', hint: 'Ocean currents' },
};

export default function AppLiquid() {
  const [glassMode, setGlassMode] = useState<GlassMode>('none');
  const [bgMode, setBgMode] = useState<BgMode>(1);

  const renderGlass = () => {
    switch (glassMode) {
      case 'G1': return <LiquidGlass />;
      case 'G2': return <LiquidGlass2 />;
      case 'G3': return <LiquidGlass3 />;
      case 'G4': return <LiquidGlass4 />;
      case 'G5': return <LiquidGlass5 />;
      case 'G6': return <LiquidGlass6 />;
      case 'G7': return <LiquidGlass7 />;
      case 'G8': return <LiquidGlass8 />;
      case 'G9': return <LiquidGlass9 />;
      case 'G10': return <LiquidGlass10 />;
      default: return null;
    }
  };

  // Build hint text
  const getHint = () => {
    const parts = [];
    if (glassMode !== 'none') parts.push(GLASS_INFO[glassMode].hint);
    parts.push(BG_INFO[bgMode].hint);
    return parts.join(' + ');
  };

  // Build label text
  const getLabel = () => {
    const parts = [];
    if (glassMode !== 'none') parts.push(glassMode);
    parts.push(`BG${bgMode}`);
    return parts.join(' ');
  };

  return (
    <View style={styles.container}>
      {/* Background layer - now uses single parametric component! */}
      <View style={styles.shaderLayer} pointerEvents="none">
        <ParametricVibeMatrix shaderId={bgMode} />
      </View>

      {/* Glass/orb layer (topmost) */}
      <View style={styles.shaderLayer} pointerEvents="none">
        {renderGlass()}
      </View>

      {/* ROW 1 - Glass tabs (G1-G6) */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>G:</Text>
        <View style={styles.rowContent}>
          {(['none', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6'] as GlassMode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.btn, glassMode === m && styles.btnActive]}
              onPress={() => setGlassMode(m)}
            >
              <Text style={[styles.btnText, glassMode === m && styles.btnTextActive]}>
                {GLASS_INFO[m].label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ROW 2 - Glass tabs (G7-G10) */}
      <View style={[styles.row, { top: 88 }]}>
        <Text style={styles.rowLabel}>G2:</Text>
        <View style={styles.rowContent}>
          {(['G7', 'G8', 'G9', 'G10'] as GlassMode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.btn, glassMode === m && styles.btnActive]}
              onPress={() => setGlassMode(m)}
            >
              <Text style={[styles.btnText, glassMode === m && styles.btnTextActive]}>
                {GLASS_INFO[m].label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ROW 3 - Background tabs (1-7) */}
      <View style={[styles.row, { top: 121 }]}>
        <Text style={styles.rowLabel}>BG:</Text>
        <View style={styles.rowContent}>
          {([1, 2, 3, 4, 5, 6, 7] as BgMode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.btn, bgMode === m && styles.btnActive]}
              onPress={() => setBgMode(m)}
            >
              <Text style={[styles.btnText, bgMode === m && styles.btnTextActive]}>
                {BG_INFO[m].label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ROW 4 - Background tabs (8-13) */}
      <View style={[styles.row, { top: 154 }]}>
        <Text style={styles.rowLabel}>BG2:</Text>
        <View style={styles.rowContent}>
          {([8, 9, 10, 11, 12, 13] as BgMode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.btn, bgMode === m && styles.btnActive]}
              onPress={() => setBgMode(m)}
            >
              <Text style={[styles.btnText, bgMode === m && styles.btnTextActive]}>
                {BG_INFO[m].label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ROW 5 - Background tabs (14-18) */}
      <View style={[styles.row, { top: 187 }]}>
        <Text style={styles.rowLabel}>BG3:</Text>
        <View style={styles.rowContent}>
          {([14, 15, 16, 17, 18] as BgMode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.btn, bgMode === m && styles.btnActive]}
              onPress={() => setBgMode(m)}
            >
              <Text style={[styles.btnText, bgMode === m && styles.btnTextActive]}>
                {BG_INFO[m].label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Label showing current selection */}
      <View style={styles.label}>
        <Text style={styles.text}>{getLabel()}</Text>
        <Text style={styles.hint}>{getHint()}</Text>
      </View>

      {/* FPS Monitor for performance testing */}
      <FPSMonitor />

      <StatusBar hidden />
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
  row: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    paddingLeft: 12,
  },
  rowContent: {
    flexDirection: 'row',
    gap: 4,
  },
  rowLabel: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 10,
    fontWeight: '600',
    marginRight: 4,
    minWidth: 24,
  },
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  btnActive: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderColor: 'rgba(0,0,0,0.5)',
  },
  btnText: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
  btnTextActive: {
    color: '#000',
  },
  label: {
    position: 'absolute',
    top: 224,
    left: 12,
    right: 12,
    alignItems: 'flex-start',
  },
  text: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 11,
    marginTop: 4,
  },
});
