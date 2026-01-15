/**
 * VibeDebugOverlay - Dev-only state tester
 *
 * Shows a floating button that opens a panel to test all vibe states.
 * Now includes SHADER PRESET switching (the different textures/effects).
 * Only renders in __DEV__ mode.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { AppState, VibeColorTheme } from '../../types/vibe';
import { getAllShaders, type ShaderEntry } from '../../shaders/factory/registryV2';
import { VIBE_SHADER_GROUPS } from '../../constants/vibeShaderMap';
import type { VibeMatrixAnimatedRef } from '../layers/VibeMatrixAnimated';

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

// Props for vibeMatrix ref (to switch shaders)
interface VibeDebugOverlayProps {
  vibeMatrixRef?: React.RefObject<VibeMatrixAnimatedRef | null>;
}

// Get all 19 shader presets
const SHADER_PRESETS = getAllShaders();

// Vibe Test Cycle - showcases all 6 color themes with example questions
const VIBE_TEST_CYCLE: {
  theme: VibeColorTheme;
  color: string;
  emoji: string;
  label: string;
  example: string;
}[] = [
  { theme: 'TRUST', color: '#3B82F6', emoji: '🔵', label: 'TRUST', example: '"What\'s your favorite movie?"' },
  { theme: 'DEEP', color: '#8B5CF6', emoji: '🟣', label: 'DEEP', example: '"What are you most afraid of?"' },
  { theme: 'PASSION', color: '#E11D48', emoji: '🔴', label: 'PASSION', example: '"Tell me about love"' },
  { theme: 'GROWTH', color: '#10B981', emoji: '🟢', label: 'GROWTH', example: '"What are your goals?"' },
  { theme: 'CAUTION', color: '#F59E0B', emoji: '🟠', label: 'CAUTION', example: '"What\'s your dealbreaker?"' },
  { theme: 'ALERT', color: '#6B7280', emoji: '⚫', label: 'ALERT', example: '"Have you felt unsafe?"' },
];

export const VibeDebugOverlay: React.FC<VibeDebugOverlayProps> = ({ vibeMatrixRef }) => {
  const [expanded, setExpanded] = useState(false);
  const [currentShaderId, setCurrentShaderId] = useState(0);
  const [isTestCycling, setIsTestCycling] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  const goToState = useDemoStore((s) => s.goToState);
  const currentDemoState = useDemoStore((s) => s.currentState);
  const setFromAppState = useVibeController((s) => s.setFromAppState);
  const setColorTheme = useVibeController((s) => s.setColorTheme);
  const setComplexity = useVibeController((s) => s.setComplexity);
  const colorTheme = useVibeController((s) => s.colorTheme);
  const complexity = useVibeController((s) => s.complexity);
  const activeParty = useVibeController((s) => s.activeParty);
  const activeMode = useVibeController((s) => s.activeMode);

  // Vibe Test Cycle - auto-advance through all themes
  useEffect(() => {
    if (!isTestCycling) return;

    const currentVibe = VIBE_TEST_CYCLE[cycleIndex];

    // Set color theme
    setColorTheme(currentVibe.theme);

    // Set complexity based on theme
    const complexities = ['SMOOTHIE', 'FLOW', 'OCEAN', 'STORM', 'PAISLEY'] as const;
    setComplexity(complexities[Math.min(cycleIndex, 4)]);

    // Set shader from theme group
    const shaderGroup = VIBE_SHADER_GROUPS[currentVibe.theme];
    const shaderId = shaderGroup[cycleIndex % shaderGroup.length];
    const shader = SHADER_PRESETS.find(s => s.id === shaderId);
    if (shader && vibeMatrixRef?.current) {
      vibeMatrixRef.current.setShader(shader.source);
      setCurrentShaderId(shaderId);
    }

    // Auto-advance every 3 seconds
    const timer = setTimeout(() => {
      setCycleIndex((prev) => (prev + 1) % VIBE_TEST_CYCLE.length);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isTestCycling, cycleIndex, setColorTheme, setComplexity, vibeMatrixRef]);

  // Stop cycle when panel closes
  useEffect(() => {
    if (!expanded) setIsTestCycling(false);
  }, [expanded]);

  const toggleTestCycle = useCallback(() => {
    if (isTestCycling) {
      setIsTestCycling(false);
    } else {
      setCycleIndex(0);
      setIsTestCycling(true);
    }
  }, [isTestCycling]);

  // Switch shader preset
  const switchShader = (shader: ShaderEntry) => {
    if (vibeMatrixRef?.current) {
      vibeMatrixRef.current.setShader(shader.source);
      setCurrentShaderId(shader.id);
    }
  };

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

      {/* VIBE TEST MODE - Big button at top */}
      <TouchableOpacity
        style={[
          styles.testCycleButton,
          isTestCycling && styles.testCycleButtonActive,
        ]}
        onPress={toggleTestCycle}
      >
        <Text style={styles.testCycleButtonText}>
          {isTestCycling ? '⏹ STOP TEST' : '▶️ VIBE TEST MODE'}
        </Text>
        {isTestCycling && (
          <Text style={styles.testCycleInfo}>
            {VIBE_TEST_CYCLE[cycleIndex].emoji} {VIBE_TEST_CYCLE[cycleIndex].label}: {VIBE_TEST_CYCLE[cycleIndex].example}
          </Text>
        )}
      </TouchableOpacity>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Color Theme Buttons (Quick Access) */}
        <Text style={styles.sectionTitle}>COLOR THEMES (Sentiment)</Text>
        <View style={styles.buttonRow}>
          {VIBE_TEST_CYCLE.map((item, idx) => (
            <TouchableOpacity
              key={item.theme}
              style={[
                styles.themeButton,
                { borderColor: item.color },
                colorTheme === item.theme && { backgroundColor: item.color + '40' },
              ]}
              onPress={() => {
                setColorTheme(item.theme);
                const shaderGroup = VIBE_SHADER_GROUPS[item.theme];
                const shader = SHADER_PRESETS.find(s => s.id === shaderGroup[0]);
                if (shader && vibeMatrixRef?.current) {
                  vibeMatrixRef.current.setShader(shader.source);
                  setCurrentShaderId(shaderGroup[0]);
                }
              }}
            >
              <Text style={styles.themeEmoji}>{item.emoji}</Text>
              <Text style={[styles.themeLabel, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

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

        {/* SHADER PRESETS - The actual background textures/effects */}
        <Text style={styles.sectionTitle}>SHADER PRESETS (Textures) - ID: {currentShaderId}</Text>
        <View style={styles.buttonRow}>
          {SHADER_PRESETS.map((shader) => {
            const isActive = currentShaderId === shader.id;
            // Color based on shader type
            const color = shader.id === 0 ? '#10B981' : // Domain Warp = green
                          shader.id <= 3 ? '#3B82F6' :  // Aurora/Spirals = blue
                          shader.id <= 7 ? '#F59E0B' :  // Fire/Marble = orange
                          shader.id <= 11 ? '#E11D48' : // Metaballs/Bloom = red
                          '#8B5CF6';                     // Others = purple
            return (
              <TouchableOpacity
                key={shader.id}
                style={[
                  styles.shaderButton,
                  { borderColor: color },
                  isActive && { backgroundColor: color + '40' },
                ]}
                onPress={() => switchShader(shader)}
              >
                <Text style={[styles.shaderButtonText, { color }]}>
                  {shader.id}
                </Text>
                <Text style={[styles.shaderName, { color: color + 'AA' }]} numberOfLines={1}>
                  {shader.name.replace(/_/g, ' ').slice(0, 10)}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  shaderButton: {
    width: 55,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  shaderButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shaderName: {
    fontSize: 7,
    marginTop: 2,
  },
  testCycleButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  testCycleButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10B981',
  },
  testCycleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testCycleInfo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  themeButton: {
    width: 52,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  themeEmoji: {
    fontSize: 18,
  },
  themeLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default VibeDebugOverlay;
