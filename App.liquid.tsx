/**
 * Shader Development Toggle
 *
 * Four rows of tabs:
 * - ROW 1 (Glass): None, G1-G6 (glass/orb effects)
 * - ROW 2 (Petals): P1 (petal effects)
 * - ROW 3 (BG Row 1): 1-7 (original backgrounds)
 * - ROW 4 (BG Row 2): 8-13 (William Mapan inspired)
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LiquidGlass } from './src/components/layers/LiquidGlass';
import { LiquidGlass2 } from './src/components/layers/LiquidGlass2';
import { LiquidGlass3 } from './src/components/layers/LiquidGlass3';
import { LiquidGlass4 } from './src/components/layers/LiquidGlass4';
import { LiquidGlass5 } from './src/components/layers/LiquidGlass5';
import { LiquidGlass6 } from './src/components/layers/LiquidGlass6';
import { VibeMatrix } from './src/components/layers/VibeMatrix';
import { VibeMatrix2 } from './src/components/layers/VibeMatrix2';
import { VibeMatrix3 } from './src/components/layers/VibeMatrix3';
import { VibeMatrix4 } from './src/components/layers/VibeMatrix4';
import { VibeMatrix5 } from './src/components/layers/VibeMatrix5';
import { VibeMatrix6 } from './src/components/layers/VibeMatrix6';
import { VibeMatrix7 } from './src/components/layers/VibeMatrix7';
import { VibeMatrix8 } from './src/components/layers/VibeMatrix8';
import { VibeMatrix9 } from './src/components/layers/VibeMatrix9';
import { VibeMatrix10 } from './src/components/layers/VibeMatrix10';
import { VibeMatrix11 } from './src/components/layers/VibeMatrix11';
import { VibeMatrix12 } from './src/components/layers/VibeMatrix12';
import { VibeMatrix13 } from './src/components/layers/VibeMatrix13';
import { LiquidRosePetals } from './src/components/layers/LiquidRosePetals';

// Glass/orb modes
type GlassMode = 'none' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6';

// Petal modes
type PetalMode = 'none' | 'P1';

// Background modes (13 versions)
type BgMode = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13';

const GLASS_INFO: Record<GlassMode, { label: string; hint: string }> = {
  none: { label: '-', hint: 'No glass' },
  G1: { label: 'G1', hint: 'Flowing amoeba' },
  G2: { label: 'G2', hint: 'Contained orb' },
  G3: { label: 'G3', hint: 'Orbiting satellites' },
  G4: { label: 'G4', hint: 'Breathing edges' },
  G5: { label: 'G5', hint: 'Depth parallax' },
  G6: { label: 'G6', hint: 'Aura orb (domain warp)' },
};

const PETAL_INFO: Record<PetalMode, { label: string; hint: string }> = {
  none: { label: '-', hint: 'No petals' },
  P1: { label: 'P1', hint: 'Rose petals DoF' },
};

const BG_INFO: Record<BgMode, { label: string; hint: string }> = {
  '1': { label: '1', hint: 'Tie-dye pink' },
  '2': { label: '2', hint: 'Fire swirls' },
  '3': { label: '3', hint: 'Aurora spirals' },
  '4': { label: '4', hint: 'Cellular teal' },
  '5': { label: '5', hint: 'Liquid marble' },
  '6': { label: '6', hint: 'Kaleidoscope' },
  '7': { label: '7', hint: 'Flowing streams' },
  '8': { label: '8', hint: 'Radial flow field' },
  '9': { label: '9', hint: 'Blob metaballs' },
  '10': { label: '10', hint: 'Chromatic bloom' },
  '11': { label: '11', hint: 'Layered orbs' },
  '12': { label: '12', hint: 'Stippled gradient' },
  '13': { label: '13', hint: 'Breathing nebula' },
};

export default function AppLiquid() {
  const [glassMode, setGlassMode] = useState<GlassMode>('none');
  const [petalMode, setPetalMode] = useState<PetalMode>('none');
  const [bgMode, setBgMode] = useState<BgMode>('1');

  const renderGlass = () => {
    switch (glassMode) {
      case 'G1': return <LiquidGlass />;
      case 'G2': return <LiquidGlass2 />;
      case 'G3': return <LiquidGlass3 />;
      case 'G4': return <LiquidGlass4 />;
      case 'G5': return <LiquidGlass5 />;
      case 'G6': return <LiquidGlass6 />;
      default: return null;
    }
  };

  const renderPetals = () => {
    switch (petalMode) {
      case 'P1': return <LiquidRosePetals />;
      default: return null;
    }
  };

  const renderBackground = () => {
    switch (bgMode) {
      case '1': return <VibeMatrix />;
      case '2': return <VibeMatrix2 />;
      case '3': return <VibeMatrix3 />;
      case '4': return <VibeMatrix4 />;
      case '5': return <VibeMatrix5 />;
      case '6': return <VibeMatrix6 />;
      case '7': return <VibeMatrix7 />;
      case '8': return <VibeMatrix8 />;
      case '9': return <VibeMatrix9 />;
      case '10': return <VibeMatrix10 />;
      case '11': return <VibeMatrix11 />;
      case '12': return <VibeMatrix12 />;
      case '13': return <VibeMatrix13 />;
      default: return <VibeMatrix />;
    }
  };

  // Build hint text
  const getHint = () => {
    const parts = [];
    if (glassMode !== 'none') parts.push(GLASS_INFO[glassMode].hint);
    if (petalMode !== 'none') parts.push(PETAL_INFO[petalMode].hint);
    parts.push(BG_INFO[bgMode].hint);
    return parts.join(' + ');
  };

  // Build label text
  const getLabel = () => {
    const parts = [];
    if (glassMode !== 'none') parts.push(glassMode);
    if (petalMode !== 'none') parts.push(petalMode);
    parts.push(`BG${bgMode}`);
    return parts.join(' ');
  };

  return (
    <View style={styles.container}>
      {/* Background layer */}
      <View style={styles.shaderLayer} pointerEvents="none">
        {renderBackground()}
      </View>

      {/* Petal layer */}
      <View style={styles.shaderLayer} pointerEvents="none">
        {renderPetals()}
      </View>

      {/* Glass/orb layer (topmost) */}
      <View style={styles.shaderLayer} pointerEvents="none">
        {renderGlass()}
      </View>

      {/* ROW 1 - Glass tabs */}
      <View style={styles.row1}>
        <Text style={styles.rowLabel}>G:</Text>
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

      {/* ROW 2 - Petal tabs */}
      <View style={styles.row2}>
        <Text style={styles.rowLabel}>P:</Text>
        {(['none', 'P1'] as PetalMode[]).map((m) => (
          <Pressable
            key={m}
            style={[styles.btn, petalMode === m && styles.btnActive]}
            onPress={() => setPetalMode(m)}
          >
            <Text style={[styles.btnText, petalMode === m && styles.btnTextActive]}>
              {PETAL_INFO[m].label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ROW 3 - Background tabs (1-7) */}
      <View style={styles.row3}>
        <Text style={styles.rowLabel}>BG:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {(['1', '2', '3', '4', '5', '6', '7'] as BgMode[]).map((m) => (
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
        </ScrollView>
      </View>

      {/* ROW 4 - Background tabs (8-13) - Mapan inspired */}
      <View style={styles.row4}>
        <Text style={styles.rowLabel}>BG2:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {(['8', '9', '10', '11', '12', '13'] as BgMode[]).map((m) => (
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
        </ScrollView>
      </View>

      {/* Label showing current selection */}
      <View style={styles.label}>
        <Text style={styles.text}>{getLabel()}</Text>
        <Text style={styles.hint}>{getHint()}</Text>
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
  row1: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    zIndex: 100,
    paddingHorizontal: 8,
  },
  row2: {
    position: 'absolute',
    top: 88,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    zIndex: 100,
    paddingHorizontal: 8,
  },
  row3: {
    position: 'absolute',
    top: 121,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    paddingLeft: 8,
  },
  row4: {
    position: 'absolute',
    top: 154,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    paddingLeft: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 4,
    paddingRight: 8,
  },
  rowLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
    marginRight: 2,
    minWidth: 24,
  },
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
  btnTextActive: {
    color: '#fff',
  },
  label: {
    position: 'absolute',
    top: 191,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
  },
});
