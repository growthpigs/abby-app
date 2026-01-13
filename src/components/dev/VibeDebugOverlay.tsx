/**
 * VibeDebugOverlay - Dev-only state tester
 *
 * Shows a floating button that opens a panel to test all vibe states.
 * Only renders in __DEV__ mode.
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useDemoStore, DemoState } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { AppState } from '../../types/vibe';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// All testable states
const DEMO_STATES: { state: DemoState; label: string; color: string }[] = [
  { state: 'COACH_INTRO', label: 'Coach Intro', color: '#10B981' },
  { state: 'INTERVIEW', label: 'Interview', color: '#3B82F6' },
  { state: 'SEARCHING', label: 'Searching', color: '#F59E0B' },
  { state: 'MATCH', label: 'Match', color: '#E11D48' },
  { state: 'PAYMENT', label: 'Payment', color: '#E11D48' },
  { state: 'REVEAL', label: 'Reveal', color: '#E11D48' },
  { state: 'COACH', label: 'Coach', color: '#10B981' },
];

// Direct vibe states (bypass demo)
const VIBE_STATES: { state: AppState; label: string; color: string }[] = [
  { state: 'COACH_INTRO', label: 'COACH_INTRO', color: '#10B981' },
  { state: 'ONBOARDING', label: 'ONBOARDING', color: '#3B82F6' },
  { state: 'INTERVIEW_LIGHT', label: 'INT_LIGHT', color: '#3B82F6' },
  { state: 'INTERVIEW_DEEP', label: 'INT_DEEP', color: '#4C1D95' },
  { state: 'INTERVIEW_SPICY', label: 'INT_SPICY', color: '#E11D48' },
  { state: 'SEARCHING', label: 'SEARCHING', color: '#F59E0B' },
  { state: 'MATCH_FOUND', label: 'MATCH', color: '#E11D48' },
  { state: 'COACH', label: 'COACH', color: '#10B981' },
  { state: 'INTERVENTION', label: 'INTERVENE', color: '#4C1D95' },
];

export const VibeDebugOverlay: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const goToState = useDemoStore((s) => s.goToState);
  const currentDemoState = useDemoStore((s) => s.currentState);
  const setFromAppState = useVibeController((s) => s.setFromAppState);
  const colorTheme = useVibeController((s) => s.colorTheme);
  const complexity = useVibeController((s) => s.complexity);
  const activeParty = useVibeController((s) => s.activeParty);
  const activeMode = useVibeController((s) => s.activeMode);

  if (!__DEV__) return null;

  if (!expanded) {
    // Collapsed: Just show floating button
    return (
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setExpanded(true)}
      >
        <Text style={styles.floatingText}>🎨</Text>
      </TouchableOpacity>
    );
  }

  // Expanded: Show full panel
  return (
    <View style={styles.expandedContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Vibe Debug</Text>
        <TouchableOpacity onPress={() => setExpanded(false)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Current State Display */}
      <View style={styles.statusRow}>
        <Text style={styles.statusText}>
          {colorTheme} / {complexity} | {activeParty}→{activeMode}
        </Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Demo States */}
        <Text style={styles.sectionTitle}>DEMO STATES</Text>
        <View style={styles.buttonRow}>
          {DEMO_STATES.map((item) => (
            <TouchableOpacity
              key={item.state}
              style={[
                styles.stateButton,
                { borderColor: item.color },
                currentDemoState === item.state && { backgroundColor: item.color + '40' },
              ]}
              onPress={() => goToState(item.state)}
            >
              <Text style={[styles.buttonText, { color: item.color }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Direct Vibe States */}
        <Text style={styles.sectionTitle}>DIRECT VIBE STATES</Text>
        <View style={styles.buttonRow}>
          {VIBE_STATES.map((item) => (
            <TouchableOpacity
              key={item.state}
              style={[styles.stateButton, { borderColor: item.color }]}
              onPress={() => setFromAppState(item.state)}
            >
              <Text style={[styles.buttonText, { color: item.color }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  floatingText: {
    fontSize: 24,
  },
  expandedContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.45,
    backgroundColor: 'rgba(10,10,20,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    paddingHorizontal: 8,
  },
  statusRow: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingBottom: 40,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  stateButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default VibeDebugOverlay;
