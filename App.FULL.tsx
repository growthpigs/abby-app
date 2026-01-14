/**
 * ABBY - Full App with Auth Flow
 *
 * Entry point with complete authentication flow:
 * LOGIN → PHONE → VERIFICATION → EMAIL → EMAIL_VERIFICATION → (Main App)
 *
 * Uses VibeMatrix shader background with glass overlay screens.
 * State machine controls screen transitions.
 */

// DIAGNOSTIC: Log initialization chain for debugging
if (__DEV__) {
  console.log('[App] ===== INITIALIZATION DIAGNOSTICS =====');
  console.log('[App] 1. Starting App.tsx import chain');
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';

if (__DEV__) console.log('[App] ✓ 1.1 Imported React and React Native');

import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

if (__DEV__) console.log('[App] ✓ 1.2 Imported SafeAreaProvider and StatusBar');
import {
  useFonts,
  Merriweather_300Light,
  Merriweather_400Regular,
  Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

if (__DEV__) console.log('[App] ✓ 1.3 Importing component layers...');
import { VibeMatrixAnimated, VibeMatrixAnimatedRef } from './src/components/layers/VibeMatrixAnimated';
if (__DEV__) console.log('[App]   - ✓ VibeMatrixAnimated imported');
import { AbbyOrb } from './src/components/layers/AbbyOrb';
if (__DEV__) console.log('[App]   - ✓ AbbyOrb imported');
import { ErrorBoundary } from './src/components/ErrorBoundary';
if (__DEV__) console.log('[App]   - ✓ ErrorBoundary imported');

// Conditional ElevenLabsProvider - only load if native modules available
if (__DEV__) console.log('[App] ✓ 1.4 Attempting ElevenLabsProvider require...');
let ElevenLabsProvider: React.ComponentType<{ children: React.ReactNode }> | null = null;
try {
  const elevenlabs = require('@elevenlabs/react-native');
  ElevenLabsProvider = elevenlabs.ElevenLabsProvider;
  if (__DEV__) console.log('[App]   - ✓ ElevenLabsProvider loaded successfully');
} catch (e) {
  if (__DEV__) {
    console.warn('[App]   - ⚠ ElevenLabsProvider not available - voice features disabled');
    console.warn('[App]   - Error:', (e as Error).message);
  }
}

if (__DEV__) console.log('[App] ✓ 1.5 Importing Zustand stores...');
import { useSettingsStore } from './src/store/useSettingsStore';
if (__DEV__) console.log('[App]   - ✓ useSettingsStore imported');
import { useDemoStore, useDemoState, DemoState } from './src/store/useDemoStore';
if (__DEV__) console.log('[App]   - ✓ useDemoStore imported');
import { useOnboardingStore } from './src/store/useOnboardingStore';
if (__DEV__) console.log('[App]   - ✓ useOnboardingStore imported');
import { AuthService } from './src/services/AuthService';
import { TokenManager } from './src/services/TokenManager';
import { secureFetchJSON } from './src/utils/secureFetch';
if (__DEV__) console.log('[App]   - ✓ AuthService, TokenManager, secureFetch imported');
import { OrbMode } from './src/types/orb';
import { VibeColorTheme, VibeComplexity } from './src/types/vibe';
import { useVibeController } from './src/store/useVibeController';
if (__DEV__) console.log('[App] ✓ 1.6 All core imports successful');

// Auth screens
import { LoginScreen } from './src/components/screens/LoginScreen';
import { EmailScreen } from './src/components/screens/EmailScreen';
import { EmailVerificationScreen } from './src/components/screens/EmailVerificationScreen';

// Onboarding screens
import { PermissionsScreen } from './src/components/screens/PermissionsScreen';
import { NameScreen } from './src/components/screens/NameScreen';
import { DOBScreen } from './src/components/screens/DOBScreen';
import { BasicsGenderScreen } from './src/components/screens/BasicsGenderScreen';
import { BasicsPreferencesScreen } from './src/components/screens/BasicsPreferencesScreen';
import { EthnicityScreen } from './src/components/screens/EthnicityScreen';
import { EthnicityPreferenceScreen } from './src/components/screens/EthnicityPreferenceScreen';
import { BasicsRelationshipScreen } from './src/components/screens/BasicsRelationshipScreen';
import { SmokingScreen } from './src/components/screens/SmokingScreen';
import { BasicsLocationScreen } from './src/components/screens/BasicsLocationScreen';

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
  | 'NAME'
  | 'DOB'
  | 'PERMISSIONS'
  | 'BASICS_GENDER'
  | 'BASICS_PREFERENCES'
  | 'ETHNICITY'
  | 'ETHNICITY_PREFERENCE'
  | 'BASICS_RELATIONSHIP'
  | 'SMOKING'
  | 'BASICS_LOCATION'
  | 'AUTHENTICATED';

// Screen ordering for secret navigation (matches client spec order)
const AUTH_ORDER: AuthState[] = [
  'LOGIN',
  'PHONE',
  'VERIFICATION',
  'EMAIL',
  'EMAIL_VERIFICATION',
  'NAME',               // Screen 4
  'DOB',                // Screen 5
  'PERMISSIONS',
  'BASICS_GENDER',      // Screen 6
  'BASICS_PREFERENCES', // Screen 7
  'ETHNICITY',          // Screen 8
  'ETHNICITY_PREFERENCE', // Screen 9
  'BASICS_RELATIONSHIP', // Screen 10
  'SMOKING',            // Screen 11
  'BASICS_LOCATION',
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

// ===========================================
// VIBE MAPPINGS FOR SCREEN TRANSITIONS
// ===========================================

// Auth/Onboarding screen vibes - TRUE RAINBOW: Purple → Blue → Green → Yellow
// Complexity increases throughout: SMOOTHIE → FLOW → OCEAN → STORM
const AUTH_VIBES: Partial<Record<AuthState, { theme: VibeColorTheme; complexity: VibeComplexity }>> = {
  // === PURPLE PHASE (Deep violet - start) ===
  LOGIN: { theme: 'DEEP', complexity: 'SMOOTHIE' },        // 1. Purple, calm
  NAME: { theme: 'DEEP', complexity: 'FLOW' },             // 2. Purple, flowing
  EMAIL: { theme: 'DEEP', complexity: 'FLOW' },            // 3. Purple, flowing

  // === BLUE PHASE (Trust blue - building) ===
  EMAIL_VERIFICATION: { theme: 'TRUST', complexity: 'OCEAN' }, // 4. Blue, active
  DOB: { theme: 'TRUST', complexity: 'OCEAN' },            // 5. Blue, active
  PERMISSIONS: { theme: 'TRUST', complexity: 'OCEAN' },    // 6. Blue, active

  // === GREEN PHASE (Growth green - progressing) ===
  BASICS_GENDER: { theme: 'GROWTH', complexity: 'OCEAN' }, // 7. Green, active
  BASICS_PREFERENCES: { theme: 'GROWTH', complexity: 'OCEAN' }, // 8. Green, active
  ETHNICITY: { theme: 'GROWTH', complexity: 'STORM' },     // 9. Green, energetic
  ETHNICITY_PREFERENCE: { theme: 'GROWTH', complexity: 'STORM' }, // 10. Green, energetic

  // === YELLOW/ORANGE PHASE (Caution amber - finale) ===
  BASICS_RELATIONSHIP: { theme: 'CAUTION', complexity: 'STORM' }, // 11. Orange, energetic
  SMOKING: { theme: 'CAUTION', complexity: 'STORM' },      // 12. Orange, energetic
  BASICS_LOCATION: { theme: 'CAUTION', complexity: 'STORM' }, // 13. Orange, peak energy
};

// Demo screen vibes
const DEMO_VIBES: Record<DemoState, { theme: VibeColorTheme; complexity: VibeComplexity }> = {
  COACH_INTRO: { theme: 'GROWTH', complexity: 'SMOOTHIE' }, // Green - coaching start
  INTERVIEW: { theme: 'TRUST', complexity: 'FLOW' },        // Blue - questions
  SEARCHING: { theme: 'CAUTION', complexity: 'OCEAN' },     // Orange - processing
  MATCH: { theme: 'PASSION', complexity: 'STORM' },         // Red - excitement!
  PAYMENT: { theme: 'GROWTH', complexity: 'FLOW' },         // Green - value
  REVEAL: { theme: 'PASSION', complexity: 'STORM' },        // Red - big moment
  COACH: { theme: 'GROWTH', complexity: 'SMOOTHIE' },       // Green - coaching
};

// Fallback metrics for when native module hasn't initialized yet
const fallbackMetrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 59, right: 0, bottom: 34, left: 0 }, // iPhone 14 Pro defaults
};

function AppContent() {
  if (__DEV__) console.log('[AppContent] ✓ 2.1 Rendering AppContent component');

  // Auth state
  const [authState, setAuthState] = useState<AuthState>('LOADING');

  // Form data (persisted across screens)
  const [phoneData, setPhoneData] = useState({ countryCode: '', phoneNumber: '' });
  const [emailData, setEmailData] = useState('');

  if (__DEV__) console.log('[AppContent] ✓ 2.2 Auth state initialized');

  // Demo state from store
  if (__DEV__) console.log('[AppContent] ✓ 2.3 Calling useDemoState hook...');
  const demoState = useDemoState();
  if (__DEV__) console.log('[AppContent]   - demoState:', demoState);

  if (__DEV__) console.log('[AppContent] ✓ 2.4 Accessing useDemoStore methods...');
  const advance = useDemoStore((state) => state.advance);
  const goToState = useDemoStore((state) => state.goToState);
  const reset = useDemoStore((state) => state.reset);
  if (__DEV__) console.log('[AppContent]   - ✓ useDemoStore methods accessible');

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
  if (__DEV__) console.log('[AppContent] ✓ 2.5 Creating VibeMatrixAnimated ref...');
  const vibeRef = useRef<VibeMatrixAnimatedRef>(null);
  if (__DEV__) console.log('[AppContent]   - vibeRef created');

  // Settings
  if (__DEV__) console.log('[AppContent] ✓ 2.6 Accessing useSettingsStore...');
  const settingsLoaded = useSettingsStore((state) => state.isLoaded);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  if (__DEV__) console.log('[AppContent]   - settingsLoaded:', settingsLoaded);

  // Load fonts
  if (__DEV__) console.log('[AppContent] ✓ 2.7 Loading fonts with useFonts...');
  const [fontsLoaded] = useFonts({
    Merriweather_300Light,
    Merriweather_400Regular,
    Merriweather_700Bold,
    JetBrainsMono_400Regular,
  });
  if (__DEV__) console.log('[AppContent]   - fontsLoaded:', fontsLoaded);

  // Load settings on mount
  useEffect(() => {
    if (__DEV__) console.log('[AppContent] ✓ 2.8 useEffect: Loading settings...');
    loadSettings();
  }, [loadSettings]);

  // Initialize: check for existing session, then go to login or authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (fontsLoaded && settingsLoaded && authState === 'LOADING') {
        try {
          // Check if user has valid session (token exists and not expired)
          const isAuth = await AuthService.isAuthenticated();
          if (isAuth) {
            if (__DEV__) console.log('[App] Existing session found, restoring authenticated state');
            setAuthState('AUTHENTICATED');
            reset(); // Reset demo state for fresh start
            vibeRef.current?.setVibe('TRUST');
          } else {
            if (__DEV__) console.log('[App] No valid session, going to login');
            setAuthState('LOGIN');
            vibeRef.current?.setVibe('DEEP');
          }
        } catch (error) {
          // Auth check failed - default to login
          if (__DEV__) console.log('[App] Auth check failed, going to login:', error);
          setAuthState('LOGIN');
          vibeRef.current?.setVibe('DEEP');
        }
      }
    };
    checkAuth();
  }, [fontsLoaded, settingsLoaded, authState, reset]);

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('[App] Auth state changed to:', authState);
  }, [authState]);

  // Apply vibe on auth state change
  useEffect(() => {
    if (authState === 'LOADING' || authState === 'AUTHENTICATED') return;

    const vibe = AUTH_VIBES[authState];
    if (vibe) {
      console.log('[App] Setting vibe for', authState, '→', vibe.theme, vibe.complexity);
      vibeRef.current?.setVibeAndComplexity(vibe.theme, vibe.complexity);
    }
  }, [authState]);

  // Apply vibe on demo state change
  useEffect(() => {
    if (authState !== 'AUTHENTICATED') return;

    const vibe = DEMO_VIBES[demoState];
    if (vibe) {
      console.log('[App] Setting demo vibe for', demoState, '→', vibe.theme, vibe.complexity);
      vibeRef.current?.setVibeAndComplexity(vibe.theme, vibe.complexity);
    }
  }, [demoState, authState]);

  // CRITICAL FIX: Bridge between Zustand store and VibeMatrixAnimated ref
  // This ensures animation responds when screens call setColorTheme()
  const currentTheme = useVibeController(state => state.colorTheme);
  useEffect(() => {
    if (authState === 'AUTHENTICATED' && vibeRef.current) {
      console.log('[App] 🎨 Store→Ref bridge: colorTheme changed to', currentTheme, '- triggering animation');
      vibeRef.current.setVibe(currentTheme);
    }
  }, [currentTheme, authState]);

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
    // Email verified, go to name screen (client spec Screen 4)
    setAuthState('NAME');
  };

  // ONBOARDING FLOW HANDLERS
  const setFirstName = useOnboardingStore((state) => state.setFirstName);
  const setFamilyName = useOnboardingStore((state) => state.setFamilyName);
  const setNickname = useOnboardingStore((state) => state.setNickname);
  const setDateOfBirth = useOnboardingStore((state) => state.setDateOfBirth);
  const setAgeRange = useOnboardingStore((state) => state.setAgeRange);
  const setGender = useOnboardingStore((state) => state.setGender);
  const setDatingPreference = useOnboardingStore((state) => state.setDatingPreference);
  const setEthnicity = useOnboardingStore((state) => state.setEthnicity);
  const setEthnicityPreferences = useOnboardingStore((state) => state.setEthnicityPreferences);
  const setRelationshipType = useOnboardingStore((state) => state.setRelationshipType);
  const setSmokingMe = useOnboardingStore((state) => state.setSmokingMe);
  const setSmokingPartner = useOnboardingStore((state) => state.setSmokingPartner);
  const setLocation = useOnboardingStore((state) => state.setLocation);
  const markOnboardingComplete = useOnboardingStore((state) => state.markComplete);

  // Screen 4: Name
  const handleNameComplete = (firstName: string, familyName: string) => {
    setFirstName(firstName);
    setFamilyName(familyName);
    setNickname(firstName);
    setAuthState('DOB');
  };

  // Screen 5: DOB
  const handleDOBComplete = (
    dob: { month: number; day: number; year: number },
    ageRange: { min: number; max: number }
  ) => {
    setDateOfBirth(new Date(dob.year, dob.month - 1, dob.day));
    setAgeRange(ageRange.min, ageRange.max);
    setAuthState('PERMISSIONS');
  };

  const handlePermissionsComplete = () => {
    setAuthState('BASICS_GENDER');
  };

  // Screen 6: Gender
  const handleGenderComplete = (gender: string) => {
    setGender(gender);
    setAuthState('BASICS_PREFERENCES');
  };

  // Screen 7: Preferences
  const handlePreferencesComplete = (preference: string) => {
    setDatingPreference(preference);
    setAuthState('ETHNICITY');
  };

  // Screen 8: Ethnicity
  const handleEthnicityComplete = (ethnicity: string) => {
    setEthnicity(ethnicity);
    setAuthState('ETHNICITY_PREFERENCE');
  };

  // Screen 9: Ethnicity Preference
  const handleEthnicityPreferenceComplete = (ethnicities: string[]) => {
    setEthnicityPreferences(ethnicities);
    setAuthState('BASICS_RELATIONSHIP');
  };

  // Screen 10: Relationship
  const handleRelationshipComplete = (relationshipType: string) => {
    setRelationshipType(relationshipType);
    setAuthState('SMOKING');
  };

  // Screen 11: Smoking
  const handleSmokingComplete = (smokingMe: string, smokingPartner: string) => {
    setSmokingMe(smokingMe);
    setSmokingPartner(smokingPartner);
    setAuthState('BASICS_LOCATION');
  };

  const handleLocationComplete = async (location: { type: 'gps' | 'zip'; value: string | { lat: number; lng: number } }) => {
    setLocation(location);
    markOnboardingComplete();
    useOnboardingStore.getState().clearStorage(); // Clean up persisted data after completion

    // Submit profile to backend (with user feedback on failure)
    try {
      const profilePayload = useOnboardingStore.getState().getProfilePayload();
      const token = await TokenManager.getToken();

      if (token && Object.keys(profilePayload).length > 0) {
        const API_BASE = 'https://dev.api.myaimatchmaker.ai';
        await secureFetchJSON(`${API_BASE}/v1/profile/public`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(profilePayload),
        });
        if (__DEV__) {
          console.log('[App] Profile submitted successfully');
        }
      }
    } catch (error) {
      // Show error to user - don't silently fail
      Alert.alert(
        'Profile Save Issue',
        'Your profile couldn\'t be saved to the server. You can update it later in Settings.',
        [{ text: 'Continue', style: 'default' }]
      );
      if (__DEV__) {
        console.warn('[App] Profile submission failed:', error);
      }
    }

    // All onboarding complete - go to main app
    setAuthState('AUTHENTICATED');
    reset(); // Reset demo state
    vibeRef.current?.setVibe('TRUST');
  };

  // DEMO FLOW - just passes through to screens
  const handleBackgroundChange = useCallback((index: number) => {
    // Background changes handled by InterviewScreen internally
  }, []);

  // Dynamic vibe changes from screens (e.g., CoachScreen changing themes)
  const handleVibeChange = useCallback((theme: VibeColorTheme, complexity: VibeComplexity) => {
    vibeRef.current?.setVibeAndComplexity(theme, complexity);
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

      // NOTE: PhoneNumberScreen and VerificationCodeScreen removed during merge
      // Jumping directly to EMAIL screen for now
      case 'PHONE':
      case 'VERIFICATION':

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

      case 'NAME':
        return (
          <NameScreen
            onNext={handleNameComplete}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
          />
        );

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

      case 'ETHNICITY_PREFERENCE':
        return (
          <EthnicityPreferenceScreen
            onNext={handleEthnicityPreferenceComplete}
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

  // Render demo screens
  const renderDemoScreen = () => {
    switch (demoState) {
      case 'COACH_INTRO':
        return <CoachIntroScreen onBackgroundChange={handleBackgroundChange} onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
      case 'INTERVIEW':
        return <InterviewScreen onBackgroundChange={handleBackgroundChange} onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
      case 'SEARCHING':
        return <SearchingScreen onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
      case 'MATCH':
        return <MatchScreen onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
      case 'PAYMENT':
        return <PaymentScreen onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
      case 'REVEAL':
        return <RevealScreen onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
      case 'COACH':
        return <CoachScreen onBackgroundChange={handleBackgroundChange} onVibeChange={handleVibeChange} onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
      default:
        return <CoachIntroScreen onBackgroundChange={handleBackgroundChange} onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
    }
  };

  // Loading state
  if (!fontsLoaded || !settingsLoaded || authState === 'LOADING') {
    if (__DEV__) {
      console.log('[AppContent] ⏳ Still loading: fontsLoaded=', fontsLoaded, 'settingsLoaded=', settingsLoaded, 'authState=', authState);
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (__DEV__) console.log('[AppContent] ✓ 3.1 Rendering full app layout');

  // Log component mount
  if (__DEV__) console.log('[AppContent] ✓ 3.2 Container View rendering');
  if (__DEV__) console.log('[AppContent] ✓ 3.3 VibeMatrixAnimated layer will render');
  if (__DEV__) console.log('[AppContent] ✓ 3.4 Checking AbbyOrb condition: authState=', authState);
  if (__DEV__ && authState === 'AUTHENTICATED') console.log('[AppContent]   - ✓ Will render AbbyOrb with mode:', orbMode);
  if (__DEV__) console.log('[AppContent] ✓ 3.5 UI layer will render with authState=', authState);

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
  if (__DEV__) console.log('[App] ✓ 4.1 App wrapper component rendering');

  // Wrap with ElevenLabsProvider if available (native build)
  if (__DEV__) console.log('[App] ✓ 4.2 Creating AppContent...');
  const content = <AppContent />;

  if (__DEV__) console.log('[App] ✓ 4.3 Wrapping with ElevenLabsProvider (if available)...');
  const wrappedContent = ElevenLabsProvider ? (
    (() => {
      if (__DEV__) console.log('[App]   - ✓ ElevenLabsProvider available, wrapping');
      return <ElevenLabsProvider>{content}</ElevenLabsProvider>;
    })()
  ) : (() => {
    if (__DEV__) console.log('[App]   - ℹ ElevenLabsProvider not available, using raw content');
    return content;
  })();

  if (__DEV__) console.log('[App] ✓ 4.4 Creating SafeAreaProvider wrapper...');
  if (__DEV__) console.log('[App] ✓ 4.5 Creating ErrorBoundary wrapper...');

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics ?? fallbackMetrics}>
      <ErrorBoundary>
        {wrappedContent}
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
