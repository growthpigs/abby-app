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
  Pressable,
} from 'react-native';
import { useDemoStore, DemoState } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { AppState, VibeColorTheme } from '../../types/vibe';
import { getAllShaders, type ShaderEntry } from '../../shaders/factory/registryV2';
import { VIBE_SHADER_GROUPS } from '../../constants/vibeShaderMap';
import type { VibeMatrixAnimatedRef } from '../layers/VibeMatrixAnimated';
import { ALL_DATA_POINTS, type DataPoint } from '../../data/questions-schema';
import { analyzeQuestionSentiment } from '../../utils/questionSentiment';

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

// Color map for vibes
const VIBE_COLORS: Record<VibeColorTheme, string> = {
  TRUST: '#3B82F6',
  DEEP: '#8B5CF6',
  PASSION: '#E11D48',
  GROWTH: '#10B981',
  CAUTION: '#F59E0B',
  ALERT: '#6B7280',
};

export const VibeDebugOverlay: React.FC<VibeDebugOverlayProps> = ({ vibeMatrixRef }) => {
  const [expanded, setExpanded] = useState(false);
  const [currentShaderId, setCurrentShaderId] = useState(0);
  const [isTestCycling, setIsTestCycling] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);

  // Question Cycle Mode state
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

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

  // Question Cycle Mode - trigger vibe when question changes
  const triggerQuestionVibe = useCallback((question: DataPoint) => {
    // Get vibe from vibe_shift (manual) or sentiment analysis
    let theme: VibeColorTheme;
    let complexity: 'SMOOTHIE' | 'FLOW' | 'OCEAN' | 'STORM' | 'PAISLEY';

    if (question.vibe_shift) {
      // Use manual vibe_shift
      theme = question.vibe_shift;
      // Complexity based on priority
      complexity = question.priority === 'P0' ? 'STORM' :
                   question.priority === 'P1' ? 'OCEAN' :
                   question.priority === 'P2' ? 'FLOW' : 'SMOOTHIE';
    } else {
      // Use sentiment analysis
      const sentiment = analyzeQuestionSentiment(question.question);
      theme = sentiment.theme;
      complexity = sentiment.complexity;
    }

    // Set vibe
    setColorTheme(theme);
    setComplexity(complexity);

    // Set shader from theme group
    const shaderGroup = VIBE_SHADER_GROUPS[theme];
    const shaderId = shaderGroup[questionIndex % shaderGroup.length];
    const shader = SHADER_PRESETS.find(s => s.id === shaderId);
    if (shader && vibeMatrixRef?.current) {
      vibeMatrixRef.current.setShader(shader.source);
      setCurrentShaderId(shaderId);
    }
  }, [questionIndex, setColorTheme, setComplexity, vibeMatrixRef]);

  // Navigate to previous question
  const handlePrevQuestion = useCallback(() => {
    setQuestionIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : ALL_DATA_POINTS.length - 1;
      const question = ALL_DATA_POINTS[newIndex];
      setTimeout(() => triggerQuestionVibe(question), 0);
      return newIndex;
    });
  }, [triggerQuestionVibe]);

  // Navigate to next question
  const handleNextQuestion = useCallback(() => {
    setQuestionIndex((prev) => {
      const newIndex = prev < ALL_DATA_POINTS.length - 1 ? prev + 1 : 0;
      const question = ALL_DATA_POINTS[newIndex];
      setTimeout(() => triggerQuestionVibe(question), 0);
      return newIndex;
    });
  }, [triggerQuestionVibe]);

  // Start question mode and trigger first question
  const startQuestionMode = useCallback(() => {
    setIsQuestionMode(true);
    setExpanded(false); // Hide the debug panel
    const question = ALL_DATA_POINTS[questionIndex];
    triggerQuestionVibe(question);
  }, [questionIndex, triggerQuestionVibe]);

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

  // Question Cycle Mode - Full screen overlay for video recording
  if (isQuestionMode) {
    const currentQuestion = ALL_DATA_POINTS[questionIndex];
    const vibeTheme = currentQuestion.vibe_shift || analyzeQuestionSentiment(currentQuestion.question).theme;
    const vibeColor = VIBE_COLORS[vibeTheme];

    return (
      <View style={styles.questionModeContainer}>
        {/* Question counter and vibe indicator */}
        <View style={styles.questionHeader}>
          <View style={[styles.vibeIndicator, { backgroundColor: vibeColor }]} />
          <Text style={styles.questionCounter}>
            Q{questionIndex + 1} / {ALL_DATA_POINTS.length}
          </Text>
          <Text style={[styles.vibeLabel, { color: vibeColor }]}>{vibeTheme}</Text>
        </View>

        {/* Category badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{currentQuestion.category.replace(/_/g, ' ').toUpperCase()}</Text>
          <Text style={styles.priorityText}>Priority: {currentQuestion.priority}</Text>
        </View>

        {/* Question text - LARGE for video */}
        <View style={styles.questionTextContainer}>
          <Text style={styles.questionText}>"{currentQuestion.question}"</Text>
        </View>

        {/* Navigation buttons - BIG and obvious for video */}
        <View style={styles.questionNavRow}>
          <Pressable style={styles.navButton} onPress={handlePrevQuestion}>
            <Text style={styles.navButtonText}>◀ PREV</Text>
          </Pressable>

          <Pressable
            style={styles.exitButton}
            onPress={() => setIsQuestionMode(false)}
          >
            <Text style={styles.exitButtonText}>✕</Text>
          </Pressable>

          <Pressable style={styles.navButton} onPress={handleNextQuestion}>
            <Text style={styles.navButtonText}>NEXT ▶</Text>
          </Pressable>
        </View>

        {/* Hidden corner triggers for tap-based navigation */}
        <Pressable
          style={styles.cornerTriggerLeft}
          onPress={handlePrevQuestion}
        />
        <Pressable
          style={styles.cornerTriggerRight}
          onPress={handleNextQuestion}
        />
      </View>
    );
  }

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

      {/* QUESTION CYCLE MODE - Main feature for video proof */}
      <TouchableOpacity
        style={styles.questionModeButton}
        onPress={startQuestionMode}
      >
        <Text style={styles.questionModeButtonText}>📝 QUESTION CYCLE ({ALL_DATA_POINTS.length})</Text>
        <Text style={styles.questionModeButtonSub}>Tap to cycle through ALL questions + vibes</Text>
      </TouchableOpacity>

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

  // Question Cycle Mode styles
  questionModeButton: {
    backgroundColor: 'rgba(225, 29, 72, 0.2)',
    borderWidth: 2,
    borderColor: '#E11D48',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  questionModeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionModeButtonSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
  },

  // Full-screen Question Mode overlay
  questionModeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 10000,
    padding: 20,
    justifyContent: 'space-between',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  vibeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  questionCounter: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  vibeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  categoryText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  priorityText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  questionTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  questionText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 42,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  questionNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 20,
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 24,
  },

  // Hidden corner triggers for tap navigation
  cornerTriggerLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 150,
    // backgroundColor: 'rgba(255,0,0,0.2)', // Uncomment to debug
  },
  cornerTriggerRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 150,
    // backgroundColor: 'rgba(0,255,0,0.2)', // Uncomment to debug
  },
});

export default VibeDebugOverlay;
