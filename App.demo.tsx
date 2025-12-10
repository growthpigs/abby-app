/**
 * App.demo.tsx - Demo Entry Point
 *
 * Full demo flow from onboarding to match reveal.
 * Uses AnimatedVibeLayer for visual state management.
 * Background shaders progress (soft → hard) as questions advance.
 * ElevenLabs voice integration for Abby conversation.
 *
 * States: ONBOARDING → INTERVIEW → SEARCHING → MATCH → PAYMENT → REVEAL
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Merriweather_300Light,
  Merriweather_400Regular,
  Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';
import { ElevenLabsProvider } from '@elevenlabs/react-native';
import { AnimatedVibeLayer } from './src/components/layers/AnimatedVibeLayer';
import { useDemoState } from './src/store/useDemoStore';
import { useVibeController } from './src/store/useVibeController';
import { useAbbyAgent } from './src/services/AbbyAgent';
import {
  OnboardingScreen,
  InterviewScreen,
  SearchingScreen,
  MatchScreen,
  PaymentScreen,
  RevealScreen,
} from './src/components/screens';

// Inner component that uses voice (must be inside ElevenLabsProvider)
function DemoScreen() {
  const [backgroundIndex, setBackgroundIndex] = useState(1);
  const [abbyText, setAbbyText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const currentState = useDemoState();

  // Load Merriweather font
  const [fontsLoaded] = useFonts({
    Merriweather_300Light,
    Merriweather_400Regular,
    Merriweather_700Bold,
  });

  // Initialize AbbyAgent for voice
  const { startConversation, endConversation, isSpeaking, status } = useAbbyAgent({
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
    vibeController.setFromAppState('ONBOARDING');
    vibeController.setOrbEnergy('CALM');
  }, []);

  // Handle background changes from interview screen
  const handleBackgroundChange = useCallback((index: number) => {
    setBackgroundIndex(index);
  }, []);

  // Start voice when entering interview state
  useEffect(() => {
    if (currentState === 'INTERVIEW') {
      setVoiceStatus('Connecting...');
      startConversation().catch((err) => {
        console.error('[Demo] Failed to start voice:', err);
        setVoiceStatus('Voice unavailable');
      });
    } else if (status === 'connected') {
      // Left INTERVIEW state, end conversation
      endConversation();
    }
  }, [currentState, startConversation, endConversation, status]);

  // Render the appropriate screen based on state
  const renderScreen = () => {
    switch (currentState) {
      case 'ONBOARDING':
        return <OnboardingScreen />;
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
      default:
        return <OnboardingScreen />;
    }
  };

  // Show loading while fonts load
  if (!fontsLoaded) {
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

// Main Demo App - wraps with ElevenLabsProvider
export default function AppDemo() {
  return (
    <ElevenLabsProvider>
      <DemoScreen />
    </ElevenLabsProvider>
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
