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
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Merriweather_300Light,
  Merriweather_400Regular,
  Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';
import { AnimatedVibeLayer } from './src/components/layers/AnimatedVibeLayer';
import { useDemoState } from './src/store/useDemoStore';
import { useVibeController } from './src/store/useVibeController';
import { useAbbyAgent, VOICE_AVAILABLE } from './src/services/AbbyAgent';
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

// Conditional ElevenLabsProvider - only load if native modules available
let ElevenLabsProvider: React.ComponentType<{ children: React.ReactNode }> | null = null;
try {
  const elevenlabs = require('@elevenlabs/react-native');
  ElevenLabsProvider = elevenlabs.ElevenLabsProvider;
} catch (e) {
  if (__DEV__) {
    console.warn('[App] ElevenLabsProvider not available - voice features disabled');
  }
}

// Inner component that uses voice (must be inside ElevenLabsProvider)
function DemoScreen() {
  const [backgroundIndex, setBackgroundIndex] = useState(1);
  const [abbyText, setAbbyText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const currentState = useDemoState();

  // Settings
  const settingsLoaded = useSettingsStore((state) => state.isLoaded);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  // Load Merriweather font
  const [fontsLoaded] = useFonts({
    Merriweather_300Light,
    Merriweather_400Regular,
    Merriweather_700Bold,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Initialize AbbyAgent for voice (enabled in COACH_INTRO and COACH modes)
  const { startConversation, endConversation, isSpeaking, status } = useAbbyAgent({
    enabled: currentState === 'COACH_INTRO' || currentState === 'COACH',  // Uses Fal.ai TTS for INTERVIEW
    onAbbyResponse: (text) => {
      if (__DEV__) console.log('[Demo] Abby says:', text);
      setAbbyText(text);
    },
    onUserTranscript: (text) => {
      if (__DEV__) console.log('[Demo] User said:', text);
    },
    onConnect: () => {
      setVoiceStatus('Connected');
    },
    onDisconnect: () => {
      setVoiceStatus('Disconnected');
    },
    onError: (error) => {
      setVoiceStatus(`Error: ${error.message}`);
    },
  });

  // Initialize vibe state on mount
  useEffect(() => {
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

  // Render the appropriate screen based on state
  const renderScreen = () => {
    switch (currentState) {
      case 'COACH_INTRO':
        return <CoachIntroScreen onBackgroundChange={handleBackgroundChange} />;
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
        return <CoachIntroScreen onBackgroundChange={handleBackgroundChange} />;
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
      <StatusBar style="light" />

      {/* L0 + L1: Background shader + G1 Orb */}
      <AnimatedVibeLayer
        backgroundIndex={backgroundIndex}
        showDebug={false}
      />

      {/* L2: UI Layer (Glass Interface) */}
      <SafeAreaView style={styles.uiLayer} pointerEvents="box-none">
        {renderScreen()}
      </SafeAreaView>

      {/* Voice status indicator (dev only) */}
      {__DEV__ && voiceStatus ? (
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

// Main Demo App - conditionally wraps with ElevenLabsProvider
export default function AppDemo() {
  // Only wrap with ElevenLabsProvider if native modules are available
  if (ElevenLabsProvider) {
    return (
      <ElevenLabsProvider>
        <DemoScreen />
      </ElevenLabsProvider>
    );
  }

  // Fallback without provider (UI dev mode)
  return <DemoScreen />;
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
