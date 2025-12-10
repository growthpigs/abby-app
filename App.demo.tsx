/**
 * App.demo.tsx - Demo Entry Point
 *
 * Full demo flow from onboarding to match reveal.
 * Uses AnimatedVibeLayer for visual state management.
 * Background shaders progress (soft → hard) as questions advance.
 *
 * States: ONBOARDING → INTERVIEW → SEARCHING → MATCH → PAYMENT → REVEAL
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator } from 'react-native';
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
import {
  OnboardingScreen,
  InterviewScreen,
  SearchingScreen,
  MatchScreen,
  PaymentScreen,
  RevealScreen,
} from './src/components/screens';

// Main Demo App - manages background index state
export default function AppDemo() {
  const [backgroundIndex, setBackgroundIndex] = useState(1);
  const currentState = useDemoState();

  // Load Merriweather font
  const [fontsLoaded] = useFonts({
    Merriweather_300Light,
    Merriweather_400Regular,
    Merriweather_700Bold,
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
    </View>
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
});
