/**
 * ABBY - Full App with Cognito Auth Flow
 *
 * Authentication flow matching the client API (dev.api.myaimatchmaker.ai):
 *
 * SIGNUP: Login → Name → Email → Password → Email Verification → Onboarding → Main App
 * SIGNIN: Login → Email → Password → Main App
 *
 * Onboarding: DOB → Permissions → Gender → Preferences → Ethnicity → EthnicityPref → Relationship → Smoking → Location
 *
 * Uses VibeMatrix shader background with glass overlay screens.
 * Integrates with AuthService for Cognito authentication.
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
import { OrbMode } from './src/types/orb';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useDemoStore, useDemoState, DemoState } from './src/store/useDemoStore';

// Auth screens
import { LoginScreen } from './src/components/screens/LoginScreen';
import { NameScreen } from './src/components/screens/NameScreen';
import { EmailScreen } from './src/components/screens/EmailScreen';
import { PasswordScreen } from './src/components/screens/PasswordScreen';
import { EmailVerificationScreen } from './src/components/screens/EmailVerificationScreen';

// Onboarding screens
import { DOBScreen } from './src/components/screens/DOBScreen';
import { PermissionsScreen } from './src/components/screens/PermissionsScreen';
import { BasicsGenderScreen } from './src/components/screens/BasicsGenderScreen';
import { BasicsPreferencesScreen } from './src/components/screens/BasicsPreferencesScreen';
import { EthnicityScreen } from './src/components/screens/EthnicityScreen';
import { EthnicityPreferenceScreen } from './src/components/screens/EthnicityPreferenceScreen';
import { BasicsRelationshipScreen } from './src/components/screens/BasicsRelationshipScreen';
import { SmokingScreen } from './src/components/screens/SmokingScreen';
import { BasicsLocationScreen } from './src/components/screens/BasicsLocationScreen';

// Onboarding store
import { useOnboardingStore } from './src/store/useOnboardingStore';

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

// Auth service
import { AuthService } from './src/services/AuthService';

// =============================================================================
// TYPES
// =============================================================================

type AuthMode = 'signup' | 'signin';

type AuthState =
  | 'LOADING'            // Checking existing auth
  | 'LOGIN'              // Entry screen
  | 'NAME'               // Signup: enter name
  | 'EMAIL'              // Enter email
  | 'PASSWORD'           // Enter/create password
  | 'VERIFICATION'       // Verify email code
  // Onboarding states
  | 'DOB'                // Date of birth
  | 'PERMISSIONS'        // iOS permissions
  | 'BASICS_GENDER'      // Gender selection
  | 'BASICS_PREFERENCES' // Gender preferences
  | 'ETHNICITY'          // Ethnicity selection
  | 'ETHNICITY_PREF'     // Ethnicity preferences
  | 'BASICS_RELATIONSHIP'// Relationship type
  | 'SMOKING'            // Smoking habits
  | 'BASICS_LOCATION'    // Location
  | 'AUTHENTICATED';     // Logged in

// Screen ordering for secret navigation
const SIGNUP_ORDER: AuthState[] = [
  'LOGIN',
  'NAME',
  'EMAIL',
  'PASSWORD',
  'VERIFICATION',
  // Onboarding
  'DOB',
  'PERMISSIONS',
  'BASICS_GENDER',
  'BASICS_PREFERENCES',
  'ETHNICITY',
  'ETHNICITY_PREF',
  'BASICS_RELATIONSHIP',
  'SMOKING',
  'BASICS_LOCATION',
  'AUTHENTICATED',
];

const SIGNIN_ORDER: AuthState[] = [
  'LOGIN',
  'EMAIL',
  'PASSWORD',
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

// Fallback metrics for when native module hasn't initialized
const fallbackMetrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 59, right: 0, bottom: 34, left: 0 },
};

// =============================================================================
// APP CONTENT
// =============================================================================

function AppContent() {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>('LOADING');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');

  // Form data (undefined = not yet entered, allows default placeholders)
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [userPassword, setUserPassword] = useState<string | undefined>(undefined);

  // Loading/error states
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  // Check existing authentication on startup
  useEffect(() => {
    const checkAuth = async () => {
      if (!fontsLoaded || !settingsLoaded) return;

      try {
        const isAuth = await AuthService.isAuthenticated();
        if (isAuth) {
          if (__DEV__) console.log('[App] User already authenticated');
          setAuthState('AUTHENTICATED');
          reset();
          vibeRef.current?.setVibe('TRUST');
        } else {
          if (__DEV__) console.log('[App] No existing auth, showing login');
          setAuthState('LOGIN');
          vibeRef.current?.setVibe('DEEP');
        }
      } catch (error) {
        if (__DEV__) console.error('[App] Auth check failed:', error);
        setAuthState('LOGIN');
        vibeRef.current?.setVibe('DEEP');
      }
    };

    checkAuth();
  }, [fontsLoaded, settingsLoaded, reset]);

  // Get current auth order based on mode
  const getAuthOrder = useCallback(() => {
    return authMode === 'signup' ? SIGNUP_ORDER : SIGNIN_ORDER;
  }, [authMode]);

  // SECRET NAVIGATION HANDLERS
  const handleSecretBack = useCallback(() => {
    setAuthError(null);

    if (authState !== 'AUTHENTICATED') {
      const order = getAuthOrder();
      const currentIndex = order.indexOf(authState);
      if (currentIndex > 0) {
        const prevState = order[currentIndex - 1];
        if (prevState !== 'LOADING') {
          setAuthState(prevState);
        }
      }
    } else {
      const currentIndex = DEMO_ORDER.indexOf(demoState);
      if (currentIndex > 0) {
        goToState(DEMO_ORDER[currentIndex - 1]);
      } else {
        // Return to login (logout)
        AuthService.logout();
        setAuthState('LOGIN');
        setAuthMode('signup');
        setUserName(undefined);
        setUserEmail(undefined);
        setUserPassword(undefined);
        vibeRef.current?.setVibe('DEEP');
      }
    }
  }, [authState, authMode, demoState, goToState, getAuthOrder]);

  const handleSecretForward = useCallback(() => {
    setAuthError(null);

    if (authState !== 'AUTHENTICATED') {
      const order = getAuthOrder();
      const currentIndex = order.indexOf(authState);
      if (currentIndex < order.length - 1) {
        const nextState = order[currentIndex + 1];
        setAuthState(nextState);
        if (nextState === 'AUTHENTICATED') {
          reset();
          vibeRef.current?.setVibe('TRUST');
        }
      }
    } else {
      advance();
    }
  }, [authState, authMode, advance, reset, getAuthOrder]);

  // AUTH FLOW HANDLERS
  const handleCreateAccount = () => {
    setAuthMode('signup');
    setAuthError(null);
    setAuthState('NAME');
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setAuthError(null);
    setAuthState('EMAIL');
  };

  const handleNameNext = (name: string) => {
    setUserName(name);
    setAuthState('EMAIL');
  };

  const handleEmailNext = (email: string) => {
    setUserEmail(email);
    setAuthState('PASSWORD');
  };

  const handlePasswordNext = async (password: string) => {
    setUserPassword(password);
    setAuthError(null);
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        // Signup flow
        if (__DEV__) console.log('[App] Starting signup...');
        await AuthService.signup(
          userEmail!,
          password,
          userName!
        );
        setAuthState('VERIFICATION');
      } else {
        // Signin flow
        if (__DEV__) console.log('[App] Starting signin...');
        await AuthService.login(userEmail!, password);
        setAuthState('AUTHENTICATED');
        reset();
        vibeRef.current?.setVibe('TRUST');
      }
    } catch (error) {
      if (__DEV__) console.error('[App] Auth error:', error);
      // AuthService throws { code, message } objects, not Error instances
      const authError = error as { code?: string; message?: string };
      setAuthError(
        authError?.message || 'Authentication failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationNext = async (code: string) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      if (__DEV__) console.log('[App] Verifying email...');
      await AuthService.verify(userEmail!, code);

      // After verification, log in automatically
      if (__DEV__) console.log('[App] Verification success, logging in...');
      await AuthService.login(userEmail!, userPassword!);

      // Go to onboarding instead of directly to authenticated
      setAuthState('DOB');
      vibeRef.current?.setVibe('TRUST');
    } catch (error) {
      if (__DEV__) console.error('[App] Verification error:', error);
      // AuthService throws { code, message } objects, not Error instances
      const authError = error as { code?: string; message?: string };
      setAuthError(
        authError?.message || 'Verification failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ONBOARDING HANDLERS
  const handleDOBComplete = () => setAuthState('PERMISSIONS');
  const handlePermissionsComplete = () => setAuthState('BASICS_GENDER');
  const handleGenderComplete = () => setAuthState('BASICS_PREFERENCES');
  const handlePreferencesComplete = () => setAuthState('ETHNICITY');
  const handleEthnicityComplete = () => setAuthState('ETHNICITY_PREF');
  const handleEthnicityPrefComplete = () => setAuthState('BASICS_RELATIONSHIP');
  const handleRelationshipComplete = () => setAuthState('SMOKING');
  const handleSmokingComplete = () => setAuthState('BASICS_LOCATION');
  const handleLocationComplete = () => {
    setAuthState('AUTHENTICATED');
    reset();
  };

  // DEMO FLOW - background change handler
  const handleBackgroundChange = useCallback((index: number) => {
    // Background changes handled by screens internally
  }, []);

  // RENDER AUTH SCREENS
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

      case 'NAME':
        return (
          <NameScreen
            onNext={handleNameNext}
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

      case 'PASSWORD':
        return (
          <PasswordScreen
            mode={authMode}
            email={userEmail ?? ''}
            onNext={handlePasswordNext}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
            isLoading={isLoading}
            error={authError}
          />
        );

      case 'VERIFICATION':
        return (
          <EmailVerificationScreen
            email={userEmail}
            onNext={handleVerificationNext}
            onResend={() => AuthService.resendVerificationCode(userEmail!)}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
            isLoading={isLoading}
            error={authError}
          />
        );

      // Onboarding screens
      case 'DOB':
        return (
          <DOBScreen
            onNext={handleDOBComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'PERMISSIONS':
        return (
          <PermissionsScreen
            onNext={handlePermissionsComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'BASICS_GENDER':
        return (
          <BasicsGenderScreen
            onNext={handleGenderComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'BASICS_PREFERENCES':
        return (
          <BasicsPreferencesScreen
            onNext={handlePreferencesComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'ETHNICITY':
        return (
          <EthnicityScreen
            onNext={handleEthnicityComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'ETHNICITY_PREF':
        return (
          <EthnicityPreferenceScreen
            onNext={handleEthnicityPrefComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'BASICS_RELATIONSHIP':
        return (
          <BasicsRelationshipScreen
            onNext={handleRelationshipComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'SMOKING':
        return (
          <SmokingScreen
            onNext={handleSmokingComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      case 'BASICS_LOCATION':
        return (
          <BasicsLocationScreen
            onNext={handleLocationComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

      default:
        return null;
    }
  };

  // RENDER DEMO SCREENS
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

  // LOADING STATE
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

// =============================================================================
// MAIN APP
// =============================================================================

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
    zIndex: 20, // Layer 2 - above AbbyOrb (layer 1), below SemanticOverlay (layer 3)
  },
});
