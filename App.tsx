/**
 * ABBY - Full App with Auth Flow
 *
 * Entry point with complete authentication flow:
 * LOGIN → PHONE → VERIFICATION → EMAIL → EMAIL_VERIFICATION → (Main App)
 *
 * Uses VibeMatrix shader background with glass overlay screens.
 * State machine controls screen transitions.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Merriweather_300Light,
  Merriweather_400Regular,
  Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

import { VibeMatrixAnimated, VibeMatrixAnimatedRef } from './src/components/layers/VibeMatrixAnimated';
import { AbbyOrb } from './src/components/layers/AbbyOrb';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useDemoStore, useDemoState, DemoState } from './src/store/useDemoStore';
import { OrbMode } from './src/types/orb';
import { useVibeController } from './src/store/useVibeController';

// Auth screens
import { LoginScreen } from './src/components/screens/LoginScreen';
import { PhoneNumberScreen } from './src/components/screens/PhoneNumberScreen';
import { VerificationCodeScreen } from './src/components/screens/VerificationCodeScreen';
import { EmailScreen } from './src/components/screens/EmailScreen';
import { EmailVerificationScreen } from './src/components/screens/EmailVerificationScreen';

// Main app screens
import {
  CoachIntroScreen,
  InterviewScreen,
  SearchingScreen,
  MatchScreen,
  PaymentScreen,
  RevealScreen,
  CoachScreen,
} from './src/components/screens';

// Auth flow states
type AuthState =
  | 'LOADING'
  | 'LOGIN'
  | 'PHONE'
  | 'VERIFICATION'
  | 'EMAIL'
  | 'EMAIL_VERIFICATION'
  | 'AUTHENTICATED';

// Screen ordering for secret navigation
const AUTH_ORDER: AuthState[] = [
  'LOGIN',
  'PHONE',
  'VERIFICATION',
  'EMAIL',
  'EMAIL_VERIFICATION',
  'AUTHENTICATED',
];

const DEMO_ORDER: DemoState[] = [
  'COACH_INTRO',
  'INTERVIEW',
  'SEARCHING',
  'MATCH',
  'PAYMENT',
  'REVEAL',
  'COACH',
];

// Fallback metrics for when native module hasn't initialized yet
const fallbackMetrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 59, right: 0, bottom: 34, left: 0 }, // iPhone 14 Pro defaults
};

function AppContent() {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>('LOADING');

  // Form data (persisted across screens)
  const [phoneData, setPhoneData] = useState({ countryCode: '', phoneNumber: '' });
  const [emailData, setEmailData] = useState('');

  // Demo state from store
  const demoState = useDemoState();
  const advance = useDemoStore((state) => state.advance);
  const goToState = useDemoStore((state) => state.goToState);
  const reset = useDemoStore((state) => state.reset);

  // Orb mode based on current screen - center when Abby is speaking, docked when user is focused
  const getOrbMode = (): OrbMode => {
    // Orb only shows in demo screens (after auth)
    if (authState !== 'AUTHENTICATED') return 'docked';

    // Determine mode based on screen
    switch (demoState) {
      case 'COACH_INTRO':
      case 'INTERVIEW':
      case 'SEARCHING':
      case 'REVEAL':
      case 'COACH':
        return 'center'; // Abby is center stage
      case 'MATCH':
      case 'PAYMENT':
        return 'docked'; // User is focused on content
      default:
        return 'center';
    }
  };
  const orbMode = getOrbMode();

  // Vibe controller ref
  const vibeRef = useRef<VibeMatrixAnimatedRef>(null);

  // Settings
  const settingsLoaded = useSettingsStore((state) => state.isLoaded);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Merriweather_300Light,
    Merriweather_400Regular,
    Merriweather_700Bold,
    JetBrainsMono_400Regular,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Initialize: go to login after loading
  useEffect(() => {
    if (fontsLoaded && settingsLoaded && authState === 'LOADING') {
      setAuthState('LOGIN');
      // Set initial vibe for login (DEEP purple)
      vibeRef.current?.setVibe('DEEP');
    }
  }, [fontsLoaded, settingsLoaded, authState]);

  // SECRET NAVIGATION HANDLERS
  // Back: go to previous screen
  const handleSecretBack = useCallback(() => {
    if (authState !== 'AUTHENTICATED') {
      // Navigate backwards in auth flow
      const currentIndex = AUTH_ORDER.indexOf(authState);
      if (currentIndex > 0) {
        const prevState = AUTH_ORDER[currentIndex - 1];
        if (prevState !== 'LOADING') {
          setAuthState(prevState);
        }
      }
    } else {
      // Navigate backwards in demo flow
      const currentIndex = DEMO_ORDER.indexOf(demoState);
      if (currentIndex > 0) {
        goToState(DEMO_ORDER[currentIndex - 1]);
      } else {
        // Go back to auth flow
        setAuthState('EMAIL_VERIFICATION');
      }
    }
  }, [authState, demoState, goToState]);

  // Forward: go to next screen
  const handleSecretForward = useCallback(() => {
    if (authState !== 'AUTHENTICATED') {
      // Navigate forward in auth flow
      const currentIndex = AUTH_ORDER.indexOf(authState);
      if (currentIndex < AUTH_ORDER.length - 1) {
        const nextState = AUTH_ORDER[currentIndex + 1];
        setAuthState(nextState);
        if (nextState === 'AUTHENTICATED') {
          // Initialize demo state
          reset();
          vibeRef.current?.setVibe('TRUST');
        }
      }
    } else {
      // Navigate forward in demo flow
      advance();
    }
  }, [authState, advance, reset]);

  // AUTH FLOW HANDLERS
  const handleCreateAccount = () => {
    setAuthState('PHONE');
  };

  const handleSignIn = () => {
    // For now, same flow as create account
    setAuthState('PHONE');
  };

  const handlePhoneNext = (countryCode: string, phoneNumber: string) => {
    setPhoneData({ countryCode, phoneNumber });
    setAuthState('VERIFICATION');
  };

  const handleVerificationComplete = (code: string) => {
    // Code verified, go to email
    setAuthState('EMAIL');
  };

  const handleEmailNext = (email: string) => {
    setEmailData(email);
    setAuthState('EMAIL_VERIFICATION');
  };

  const handleEmailVerificationComplete = (code: string) => {
    // Email verified, go to main app
    setAuthState('AUTHENTICATED');
    reset(); // Reset demo state
    vibeRef.current?.setVibe('TRUST');
  };

  // DEMO FLOW - just passes through to screens
  const handleBackgroundChange = useCallback((index: number) => {
    // Background changes handled by InterviewScreen internally
  }, []);

  // Render auth screens
  const renderAuthScreen = () => {
    switch (authState) {
      case 'LOGIN':
        return (
          <LoginScreen
            onCreateAccount={handleCreateAccount}
            onSignIn={handleSignIn}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'PHONE':
        return (
          <PhoneNumberScreen
            onNext={handlePhoneNext}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'VERIFICATION':
        return (
          <VerificationCodeScreen
            phoneNumber={`${phoneData.countryCode} ${phoneData.phoneNumber}`}
            onNext={handleVerificationComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'EMAIL':
        return (
          <EmailScreen
            onNext={handleEmailNext}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'EMAIL_VERIFICATION':
        return (
          <EmailVerificationScreen
            email={emailData}
            onNext={handleEmailVerificationComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      default:
        return null;
    }
  };

  // Render demo screens
  const renderDemoScreen = () => {
    switch (demoState) {
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

  // Loading state
  if (!fontsLoaded || !settingsLoaded || authState === 'LOADING') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Layer 0: Animated shader background */}
      <VibeMatrixAnimated
        ref={vibeRef}
        initialTheme="DEEP"
        initialComplexity="FLOW"
      />

      {/* Layer 1: Abby Orb (only in demo mode) */}
      {authState === 'AUTHENTICATED' && (
        <AbbyOrb mode={orbMode} />
      )}

      {/* Layer 2: UI (auth or demo screens) */}
      <View style={styles.uiLayer}>
        {authState !== 'AUTHENTICATED' ? renderAuthScreen() : renderDemoScreen()}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics ?? fallbackMetrics}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SafeAreaProvider>
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
