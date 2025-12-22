/**
 * App.vibe-test.tsx - 750-State Visual System Test Harness
 *
 * Test the full 4-axis vibe system:
 * - Active Party (USER/ABBY)
 * - Color Theme (5 themes)
 * - Complexity (5 levels)
 * - Orb Energy (3 levels)
 *
 * Also test high-level actions:
 * - setFromAppState()
 * - setFromResponse()
 * - startSpeakingPulse() / stopSpeakingPulse()
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { AnimatedVibeLayer } from './src/components/layers/AnimatedVibeLayer';
import {
  useVibeController,
  useFullVibeState,
} from './src/store/useVibeController';
import {
  VibeColorTheme,
  VibeComplexity,
  OrbEnergy,
  ActiveParty,
  UserMode,
  AbbyMode,
  AppState,
  ResponseQuality,
} from './src/types/vibe';

// Button component
const Button: React.FC<{
  label: string;
  onPress: () => void;
  active?: boolean;
  color?: string;
}> = ({ label, onPress, active, color }) => (
  <TouchableOpacity
    style={[
      styles.button,
      active && styles.buttonActive,
      color && { borderColor: color },
    ]}
    onPress={onPress}
  >
    <Text style={[styles.buttonText, active && styles.buttonTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Section header
const Section: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

export default function App() {
  const controller = useVibeController();
  const state = useFullVibeState();
  const [showControls, setShowControls] = useState(true);

  // Color themes
  const themes: VibeColorTheme[] = [
    'TRUST',
    'PASSION',
    'CAUTION',
    'GROWTH',
    'DEEP',
  ];
  const themeColors: Record<VibeColorTheme, string> = {
    TRUST: '#3B82F6',
    PASSION: '#E11D48',
    CAUTION: '#F59E0B',
    GROWTH: '#10B981',
    DEEP: '#4C1D95',
  };

  // Complexity levels
  const complexities: VibeComplexity[] = [
    'SMOOTHIE',
    'FLOW',
    'OCEAN',
    'STORM',
    'PAISLEY',
  ];

  // Orb energies
  const energies: OrbEnergy[] = ['CALM', 'ENGAGED', 'EXCITED'];

  // User modes
  const userModes: UserMode[] = [
    'LISTENING',
    'EMPATHY',
    'CURIOSITY',
    'REFLECTION',
    'EXCITEMENT',
  ];

  // Abby modes
  const abbyModes: AbbyMode[] = [
    'SPEAKING',
    'PROCESSING',
    'ADVISING',
    'REVEALING',
    'CELEBRATING',
  ];

  // App states
  const appStates: AppState[] = [
    'ONBOARDING',
    'INTERVIEW_LIGHT',
    'INTERVIEW_DEEP',
    'SEARCHING',
    'MATCH_FOUND',
    'COACH',
  ];

  // Response qualities (matches ResponseQuality type)
  const responses: ResponseQuality[] = [
    'BRIEF',
    'THOUGHTFUL',
    'PROFOUND',
  ];

  return (
    <View style={styles.container}>
      {/* Background + Orb Layer */}
      <AnimatedVibeLayer showDebug={true} />

      {/* Toggle Button */}
      <SafeAreaView style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowControls(!showControls)}
        >
          <Text style={styles.toggleText}>
            {showControls ? '▼ Hide' : '▲ Show'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Controls Panel */}
      {showControls && (
        <ScrollView
          style={styles.controlsContainer}
          contentContainerStyle={styles.controlsContent}
        >
          {/* Current State Display */}
          <View style={styles.stateDisplay}>
            <Text style={styles.stateText}>
              {state.activeParty} / {state.activeMode}
            </Text>
            <Text style={styles.stateText}>
              {state.colorTheme} • {state.complexity} • {state.orbEnergy}
            </Text>
          </View>

          {/* Party Toggle */}
          <Section title="Active Party" />
          <View style={styles.buttonRow}>
            <Button
              label="USER"
              onPress={() => controller.setActiveParty('USER')}
              active={state.activeParty === 'USER'}
            />
            <Button
              label="ABBY"
              onPress={() => controller.setActiveParty('ABBY')}
              active={state.activeParty === 'ABBY'}
            />
          </View>

          {/* User Modes */}
          {state.activeParty === 'USER' && (
            <>
              <Section title="User Mode" />
              <View style={styles.buttonRow}>
                {userModes.map((mode) => (
                  <Button
                    key={mode}
                    label={mode.slice(0, 4)}
                    onPress={() => controller.setUserMode(mode)}
                    active={state.activeMode === mode}
                  />
                ))}
              </View>
            </>
          )}

          {/* Abby Modes */}
          {state.activeParty === 'ABBY' && (
            <>
              <Section title="Abby Mode" />
              <View style={styles.buttonRow}>
                {abbyModes.map((mode) => (
                  <Button
                    key={mode}
                    label={mode.slice(0, 4)}
                    onPress={() => controller.setAbbyMode(mode)}
                    active={state.activeMode === mode}
                  />
                ))}
              </View>
            </>
          )}

          {/* Color Themes */}
          <Section title="Color Theme" />
          <View style={styles.buttonRow}>
            {themes.map((theme) => (
              <Button
                key={theme}
                label={theme.slice(0, 3)}
                onPress={() => controller.setColorTheme(theme)}
                active={state.colorTheme === theme}
                color={themeColors[theme]}
              />
            ))}
          </View>

          {/* Complexity */}
          <Section title="Complexity (Vibe)" />
          <View style={styles.buttonRow}>
            {complexities.map((c) => (
              <Button
                key={c}
                label={c.slice(0, 3)}
                onPress={() => controller.setComplexity(c)}
                active={state.complexity === c}
              />
            ))}
          </View>

          {/* Orb Energy */}
          <Section title="Orb Energy" />
          <View style={styles.buttonRow}>
            {energies.map((e) => (
              <Button
                key={e}
                label={e}
                onPress={() => controller.setOrbEnergy(e)}
                active={state.orbEnergy === e}
              />
            ))}
          </View>

          {/* Speaking Pulse */}
          <Section title="Speaking Pulse" />
          <View style={styles.buttonRow}>
            <Button
              label="Start Pulse"
              onPress={() => controller.startSpeakingPulse()}
              active={controller.isSpeakingPulseActive}
            />
            <Button
              label="Stop Pulse"
              onPress={() => controller.stopSpeakingPulse()}
            />
          </View>

          {/* App State Presets */}
          <Section title="App State Presets" />
          <View style={styles.buttonRow}>
            {appStates.map((s) => (
              <Button
                key={s}
                label={s.slice(0, 6)}
                onPress={() => controller.setFromAppState(s)}
              />
            ))}
          </View>

          {/* Response Quality */}
          <Section title="Response Quality → Reward" />
          <View style={styles.buttonRow}>
            {responses.map((r) => (
              <Button
                key={r}
                label={r.slice(0, 4)}
                onPress={() => controller.setFromResponse(r)}
              />
            ))}
          </View>

          {/* Coverage Slider */}
          <Section title="Coverage % → Theme" />
          <View style={styles.buttonRow}>
            {[0, 20, 40, 60, 80, 100].map((pct) => (
              <Button
                key={pct}
                label={`${pct}%`}
                onPress={() => controller.setCoveragePercent(pct)}
              />
            ))}
          </View>
        </ScrollView>
      )}
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
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  toggleButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    marginTop: 10,
  },
  toggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  controlsContent: {
    padding: 16,
    paddingBottom: 40,
  },
  stateDisplay: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  stateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 2,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buttonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#fff',
  },
  buttonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: '#fff',
  },
});
