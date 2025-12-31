/**
 * App.demo.tsx - Demo Entry Point
 *
 * Full demo flow from coach intro to match reveal.
 * Uses AnimatedVibeLayer for visual state management.
 * Background shaders progress (soft → hard) as questions advance.
 * ElevenLabs voice integration for Abby conversation.
 *
 * States: COACH_INTRO → INTERVIEW → SEARCHING → MATCH → PAYMENT → REVEAL → COACH
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Text, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Merriweather_300Light,
  Merriweather_400Regular,
  Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { AnimatedVibeLayer } from './src/components/layers/AnimatedVibeLayer';
import { useDemoState, useDemoStore } from './src/store/useDemoStore';
import { useVibeController } from './src/store/useVibeController';
import { useAbbyAgent } from './src/services/AbbyRealtimeService';

const VOICE_AVAILABLE = true; // Client API always available via network
import {
  CoachIntroScreen,
  InterviewScreen,
  SearchingScreen,
  MatchScreen,
  PaymentScreen,
  RevealScreen,
  CoachScreen,
} from './src/components/screens';
import { useSettingsStore } from './src/store/useSettingsStore';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Client API integration - no provider needed

// Demo mode toggle - Coach (ElevenLabs) vs Interview (structured questions)
type DemoMode = 'coach' | 'interview';

// Inner component that uses voice (must be inside ElevenLabsProvider)
function DemoScreen() {
  const [backgroundIndex, setBackgroundIndex] = useState(1);
  const [abbyText, setAbbyText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [demoMode, setDemoMode] = useState<DemoMode>('interview'); // Default to interview for testing
  const currentState = useDemoState();

  // Settings
  const settingsLoaded = useSettingsStore((state) => state.isLoaded);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  // Load Merriweather font
  const [fontsLoaded] = useFonts({
    Merriweather_300Light,
    Merriweather_400Regular,
    Merriweather_700Bold,
    JetBrainsMono_400Regular,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Get advance function from store for state transitions
  const advance = useDemoStore((state) => state.advance);

  // Transition trigger phrases (Abby or user can say these to start interview)
  const TRANSITION_PHRASES = [
    "let's begin",
    "lets begin",
    "let us begin",
    "ready to start",
    "start the interview",
    "begin the interview",
    "rapid fire",
    "rapidfire",
    "one by one",
  ];

  // Check if text contains any transition phrase
  const shouldTransitionToInterview = useCallback((text: string): boolean => {
    const lower = text.toLowerCase();
    return TRANSITION_PHRASES.some(phrase => lower.includes(phrase));
  }, []);

  // Initialize AbbyAgent for voice (enabled in COACH_INTRO and COACH modes)
  const { startConversation, endConversation, isSpeaking, status } = useAbbyAgent({
    enabled: currentState === 'COACH_INTRO' || currentState === 'COACH',  // Uses Fal.ai TTS for INTERVIEW
    onAbbyResponse: (text) => {
      if (__DEV__) console.log('[Demo] Abby says:', text);
      setAbbyText(text);

      // AUTO-TRANSITION: When Abby says "let's begin" (or similar), advance to interview
      if (currentState === 'COACH_INTRO' && shouldTransitionToInterview(text)) {
        if (__DEV__) console.log('[Demo] 🚀 Transition triggered by Abby!');
        // Small delay to let Abby finish speaking before transitioning
        setTimeout(() => {
          endConversation();
          advance();
        }, 1500);
      }
    },
    onUserTranscript: (text) => {
      if (__DEV__) console.log('[Demo] User said:', text);

      // Also check user speech for transition phrases
      if (currentState === 'COACH_INTRO' && shouldTransitionToInterview(text)) {
        if (__DEV__) console.log('[Demo] 🚀 Transition triggered by user!');
        // Wait for Abby to respond, then transition
        setTimeout(() => {
          endConversation();
          advance();
        }, 3000);
      }
    },
    onConnect: () => {
      setVoiceStatus('Connected');
    },
    onDisconnect: () => {
      setVoiceStatus('Disconnected');
      // AUTO-ADVANCE: When ElevenLabs conversation ends (via End node in workflow),
      // automatically transition to interview if we're still in COACH_INTRO
      if (currentState === 'COACH_INTRO') {
        if (__DEV__) console.log('[Demo] 🚀 Conversation ended, advancing to interview');
        advance();
      }
    },
    onError: (error) => {
      setVoiceStatus(`Error: ${error.message}`);
    },
  });

  // Initialize demo state on mount - ensures clean slate
  useEffect(() => {
    // Reset demo store to initial state (prevents stale state from previous sessions)
    useDemoStore.getState().reset();

    // Initialize vibe state
    const vibeController = useVibeController.getState();
    vibeController.setFromAppState('COACH_INTRO');
    vibeController.setOrbEnergy('CALM');
  }, []);

  // Handle background changes from interview screen
  const handleBackgroundChange = useCallback((index: number) => {
    setBackgroundIndex(index);
  }, []);

  // Set background based on demo state
  // COACH_INTRO: BG5, Searching: BG8, Match/Payment/Reveal: BG5
  useEffect(() => {
    if (currentState === 'COACH_INTRO') {
      setBackgroundIndex(5); // Liquid Marble - calming for intro
    } else if (currentState === 'SEARCHING') {
      setBackgroundIndex(8); // Deep Ocean - mysterious searching
    } else if (currentState === 'MATCH' || currentState === 'PAYMENT' || currentState === 'REVEAL') {
      setBackgroundIndex(5); // Liquid Marble - beautiful for reveal
    } else if (currentState === 'COACH') {
      setBackgroundIndex(5); // Liquid Marble - calming for conversation
    }
    // INTERVIEW uses its own progression via handleBackgroundChange
  }, [currentState]);

  // Track if voice session has been started to prevent infinite loop
  const voiceStartedRef = useRef(false);

  // NOTE: ElevenLabs agent is DISABLED during INTERVIEW state
  // We use Fal.ai TTS (AbbyVoice) for scripted questions instead.
  // ElevenLabs agent will be used for COACH mode (free-form conversation).
  // See InterviewScreen.tsx for TTS implementation.

  // Handle mode toggle
  const handleModeToggle = (value: boolean) => {
    const newMode = value ? 'interview' : 'coach';
    setDemoMode(newMode);
    // Reset to appropriate state when switching modes
    useDemoStore.getState().reset();
    if (newMode === 'interview') {
      useDemoStore.getState().goToState('INTERVIEW');
    }
  };

  // Render the appropriate screen based on state and mode
  const renderScreen = () => {
    // When in coach mode, show coach screens
    if (demoMode === 'coach') {
      switch (currentState) {
        case 'COACH_INTRO':
          return <CoachIntroScreen onBackgroundChange={handleBackgroundChange} />;
        case 'COACH':
          return <CoachScreen onBackgroundChange={handleBackgroundChange} />;
        default:
          return <CoachIntroScreen onBackgroundChange={handleBackgroundChange} />;
      }
    }

    // Interview mode - full flow
    switch (currentState) {
      case 'COACH_INTRO':
        // In interview mode, skip coach intro and go straight to questions
        return <InterviewScreen onBackgroundChange={handleBackgroundChange} />;
      case 'INTERVIEW':
        return <InterviewScreen onBackgroundChange={handleBackgroundChange} />;
      case 'SEARCHING':
        return <SearchingScreen />;
      case 'MATCH':
        return <MatchScreen />;
      case 'PAYMENT':
        return <PaymentScreen />;
      case 'REVEAL':
        return <RevealScreen />;
      case 'COACH':
        return <CoachScreen onBackgroundChange={handleBackgroundChange} />;
      default:
        return <InterviewScreen onBackgroundChange={handleBackgroundChange} />;
    }
  };

  // Show loading while fonts or settings load
  if (!fontsLoaded || !settingsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* L0 + L1: Background shader + G1 Orb */}
      <AnimatedVibeLayer
        backgroundIndex={backgroundIndex}
        showDebug={false}
      />

      {/* Mode Toggle - iOS style wireframe */}
      <SafeAreaView style={styles.toggleContainer} pointerEvents="box-none">
        <View style={styles.toggleWrapper}>
          <Text style={[styles.toggleLabel, demoMode === 'coach' && styles.toggleLabelActive]}>
            Chat
          </Text>
          <Switch
            value={demoMode === 'interview'}
            onValueChange={handleModeToggle}
            trackColor={{ false: 'rgba(255,255,255,0.2)', true: 'rgba(255,255,255,0.2)' }}
            thumbColor="#fff"
            ios_backgroundColor="rgba(255,255,255,0.2)"
            style={styles.toggle}
          />
          <Text style={[styles.toggleLabel, demoMode === 'interview' && styles.toggleLabelActive]}>
            Interview
          </Text>
        </View>
      </SafeAreaView>

      {/* L2: UI Layer (Glass Interface) */}
      <SafeAreaView style={styles.uiLayer} pointerEvents="box-none">
        {renderScreen()}
      </SafeAreaView>

      {/* Voice status indicator (dev only, coach mode only) */}
      {__DEV__ && demoMode === 'coach' && voiceStatus ? (
        <View style={styles.voiceStatus}>
          <Text style={styles.voiceStatusText}>{voiceStatus}</Text>
          {abbyText ? (
            <Text style={styles.abbyText} numberOfLines={2}>{abbyText}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// Main Demo App
export default function AppDemo() {
  return (
    <ErrorBoundary>
      <DemoScreen />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  toggle: {
    marginHorizontal: 8,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  toggleLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toggleLabelActive: {
    color: '#fff',
  },
  uiLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  voiceStatus: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  voiceStatusText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '500',
  },
  abbyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});
