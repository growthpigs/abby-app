/**
 * ABBY - Full App with Auth Flow
 *
 * Entry point with complete authentication flow (Nathan's API):
 * LOGIN → NAME → EMAIL → PASSWORD → EMAIL_VERIFICATION → DOB → (Onboarding)
 *
 * Uses VibeMatrix shader background with glass overlay screens.
 * State machine controls screen transitions.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Merriweather_300Light,
  Merriweather_400Regular,
  Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
} from '@expo-google-fonts/barlow';

import { VibeMatrixAnimated, VibeMatrixAnimatedRef } from './src/components/layers/VibeMatrixAnimated';
import { getAllShaders } from './src/shaders/factory/registryV2';
import { ClockTest } from './src/components/dev/ClockTest';
import { AbbyOrb } from './src/components/layers/AbbyOrb';
import { GlassFloor } from './src/components/ui/GlassFloor';
import { HamburgerMenu } from './src/components/ui/HamburgerMenu';
import { ErrorBoundary } from './src/components/ErrorBoundary';

import { useSettingsStore } from './src/store/useSettingsStore';
import { AuthService } from './src/services/AuthService';
import { TokenManager } from './src/services/TokenManager';
import { secureFetchJSON } from './src/utils/secureFetch';
import { useDemoStore, useDemoState, DemoState } from './src/store/useDemoStore';
import { DEMO_MATCH } from './src/data/demo-match';
import { useOnboardingStore } from './src/store/useOnboardingStore';
import { OrbMode } from './src/types/orb';
import { VibeColorTheme, VibeComplexity } from './src/types/vibe';
import { useVibeController } from './src/store/useVibeController';
import { DEFAULT_VIBE } from './src/constants/vibeDefaults';
import { Z_INDEX } from './src/constants/layout';
import { CoachScreenRef } from './src/components/screens/CoachScreen';
import { CoachIntroScreenRef } from './src/components/screens/CoachIntroScreen';

// Auth screens (Nathan's API flow)
import { LoginScreen } from './src/components/screens/LoginScreen';
import { EmailScreen } from './src/components/screens/EmailScreen';
import { PasswordScreen } from './src/components/screens/PasswordScreen';
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
  SignInScreen,
  SettingsScreen,
  ProfileScreen,
  PhotosScreen,
  MatchesScreen,
  CertificationScreen,
} from './src/components/screens';

// Auth flow states (matches Nathan's API: Login → Name → Email → Password → Verify)
type AuthState =
  | 'LOADING'
  | 'LOGIN'
  | 'SIGNIN'           // Single-screen signin (email + password together)
  | 'NAME'
  | 'EMAIL'
  | 'PASSWORD'
  | 'EMAIL_VERIFICATION'
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

// Screen ordering for secret navigation (matches Nathan's API order)
const AUTH_ORDER: AuthState[] = [
  'LOGIN',
  'NAME',               // Collect name first (for Cognito signup)
  'EMAIL',              // Then email
  'PASSWORD',           // Then password
  'EMAIL_VERIFICATION', // Verify email with 6-digit code
  'DOB',                // Then profile info
  'PERMISSIONS',
  'BASICS_GENDER',
  'BASICS_PREFERENCES',
  'ETHNICITY',
  'ETHNICITY_PREFERENCE',
  'BASICS_RELATIONSHIP',
  'SMOKING',
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
  // COACH removed - demo ends at reveal. Post-reveal actions go to MatchesScreen.
];

// ===========================================
// VIBE MAPPINGS FOR SCREEN TRANSITIONS
// ===========================================

// Auth/Onboarding screen vibes - TRUE RAINBOW: Purple → Blue → Green → Yellow
// Complexity increases throughout: SMOOTHIE → FLOW → OCEAN → STORM
const AUTH_VIBES: Partial<Record<AuthState, { theme: VibeColorTheme; complexity: VibeComplexity }>> = {
  // === PURPLE PHASE (Deep violet - start) ===
  LOGIN: { theme: 'DEEP', complexity: 'SMOOTHIE' },        // 1. Purple, calm
  SIGNIN: { theme: 'DEEP', complexity: 'SMOOTHIE' },       // 1b. Purple, calm
  NAME: { theme: 'DEEP', complexity: 'FLOW' },             // 2. Purple, flowing
  EMAIL: { theme: 'DEEP', complexity: 'FLOW' },            // 3. Purple, flowing

  // === BLUE PHASE (Trust blue - building) ===
  PASSWORD: { theme: 'TRUST', complexity: 'FLOW' },        // 4. Blue, flowing
  EMAIL_VERIFICATION: { theme: 'TRUST', complexity: 'OCEAN' }, // 5. Blue, active
  DOB: { theme: 'TRUST', complexity: 'OCEAN' },            // 6. Blue, active
  PERMISSIONS: { theme: 'TRUST', complexity: 'OCEAN' },    // 7. Blue, active

  // === GREEN PHASE (Growth green - progressing) ===
  BASICS_GENDER: { theme: 'GROWTH', complexity: 'OCEAN' }, // 8. Green, active
  BASICS_PREFERENCES: { theme: 'GROWTH', complexity: 'OCEAN' }, // 9. Green, active
  ETHNICITY: { theme: 'GROWTH', complexity: 'STORM' },     // 10. Green, energetic
  ETHNICITY_PREFERENCE: { theme: 'GROWTH', complexity: 'STORM' }, // 11. Green, energetic

  // === YELLOW/ORANGE PHASE (Caution amber - finale) ===
  BASICS_RELATIONSHIP: { theme: 'CAUTION', complexity: 'STORM' }, // 12. Orange, energetic
  SMOKING: { theme: 'CAUTION', complexity: 'STORM' },      // 13. Orange, energetic
  BASICS_LOCATION: { theme: 'CAUTION', complexity: 'STORM' }, // 14. Orange, peak energy
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
  // Auth state
  const [authState, setAuthState] = useState<AuthState>('LOADING');
  const [isSignUp, setIsSignUp] = useState(true); // true = signup flow, false = signin flow

  // Form data (persisted across screens)
  const [emailData, setEmailData] = useState('');
  const [passwordData, setPasswordData] = useState('');
  const [usernameData, setUsernameData] = useState(''); // Cognito username (generated at signup)

  // Auth loading and error states
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Menu screen state (for hamburger menu navigation)
  const [menuScreen, setMenuScreen] = useState<'none' | 'profile' | 'photos' | 'settings' | 'matches' | 'certification'>('none');

  // Demo state from store
  const demoState = useDemoState();
  const advance = useDemoStore((state) => state.advance);
  const goToState = useDemoStore((state) => state.goToState);
  const reset = useDemoStore((state) => state.reset);
  const setMatchData = useDemoStore((state) => state.setMatchData);

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
  const vibeRef = useRef<VibeMatrixAnimatedRef | null>(null);

  // Screen refs for sheet expansion (from AbbyOrb tap)
  const coachScreenRef = useRef<CoachScreenRef | null>(null);
  const coachIntroScreenRef = useRef<CoachIntroScreenRef | null>(null);

  // Handle AbbyOrb tap - expand the current sheet
  const handleOrbTap = useCallback(() => {
    if (__DEV__) console.log('[App] AbbyOrb tapped');

    // Expand the appropriate screen's sheet based on current demo state
    switch (demoState) {
      case 'COACH_INTRO':
        coachIntroScreenRef.current?.expandSheet();
        break;
      case 'COACH':
        coachScreenRef.current?.expandSheet();
        break;
      // Other states don't need sheet expansion
    }
  }, [demoState]);

  // Settings
  const settingsLoaded = useSettingsStore((state) => state.isLoaded);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Merriweather_300Light,
    Merriweather_400Regular,
    Merriweather_700Bold,
    JetBrainsMono_400Regular,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
  });

  // Load settings on mount
  useEffect(() => {
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
            // Vibe set by DEMO_VIBES effect when demoState changes to COACH_INTRO
          } else {
            if (__DEV__) console.log('[App] No valid session, going to login');
            setAuthState('LOGIN');
            // Vibe set by AUTH_VIBES effect when authState changes to LOGIN
          }
        } catch (error) {
          // Auth check failed - default to login
          if (__DEV__) console.log('[App] Auth check failed, going to login:', error);
          setAuthState('LOGIN');
          // Vibe set by AUTH_VIBES effect when authState changes to LOGIN
        }
      }
    };
    checkAuth();
  }, [fontsLoaded, settingsLoaded, authState, reset]);

  // Apply vibe on auth state change
  // FIXED: Use store, not direct ref - prevents desync
  useEffect(() => {
    if (authState === 'LOADING' || authState === 'AUTHENTICATED') return;

    const vibe = AUTH_VIBES[authState];
    if (vibe) {
      if (__DEV__) console.log('[App] Setting vibe for', authState, '→', vibe.theme, vibe.complexity);
      useVibeController.getState().setFullVibe('ABBY', 'SPEAKING', vibe.theme, vibe.complexity, 'CALM');
    }
  }, [authState]);

  // Apply vibe on demo state change
  // FIXED: Use store, not direct ref - prevents desync
  useEffect(() => {
    if (authState !== 'AUTHENTICATED') return;

    const vibe = DEMO_VIBES[demoState];
    if (vibe) {
      console.log('[App] Setting vibe for', demoState, '→', vibe.theme, vibe.complexity);
      useVibeController.getState().setFullVibe('ABBY', 'SPEAKING', vibe.theme, vibe.complexity, 'CALM');
    }
  }, [authState, demoState]);

  // Subscribe to vibe controller for interview vibe_shift and debug overlay
  // CRITICAL: This bridge forwards store changes (e.g., InterviewScreen.setColorTheme)
  // to the shader ref. Without this, vibe_shift during questions won't animate!
  useEffect(() => {
    const unsubscribe = useVibeController.subscribe((state) => {
      // Forward vibe controller changes to shader ref
      vibeRef.current?.setVibeAndComplexity(state.colorTheme, state.complexity);
      if (__DEV__) {
        console.log('[VibeController] → Shader:', state.colorTheme, state.complexity);
      }
    });

    return unsubscribe;
  }, []);

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
          // Vibe set by DEMO_VIBES effect when demoState changes to COACH_INTRO
        }
      }
    } else {
      // Navigate forward in demo flow
      // Ensure matchData is set when entering MATCH state (for secret nav skip)
      if (demoState === 'SEARCHING' || demoState === 'INTERVIEW' || demoState === 'COACH_INTRO') {
        setMatchData(DEMO_MATCH);
      }
      advance();
    }
  }, [authState, demoState, advance, reset, setMatchData]);

  // AUTH FLOW HANDLERS
  const handleCreateAccount = () => {
    // Signup flow: Login → Name → Email → Password → Verify → Onboarding
    setIsSignUp(true);
    setAuthState('NAME');
  };

  const handleSignIn = () => {
    // Signin flow: Single screen with email + password → AUTHENTICATED
    setIsSignUp(false);
    setAuthState('SIGNIN');
  };

  const handleEmailNext = (email: string) => {
    setEmailData(email);
    setAuthState('PASSWORD');
  };

  const handlePasswordComplete = async (password: string) => {
    // Store password for login after verification
    setPasswordData(password);
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      // Call Cognito SignUp with both firstName and familyName
      const first = firstName || 'User';
      const family = familyName || 'User';

      if (__DEV__) console.log('[App] Signup params:', { email: emailData, firstName: first, familyName: family, passwordLength: password?.length });

      const signupResult = await AuthService.signup(emailData, password, first, family);

      // Store the generated username (needed for verify/login)
      setUsernameData(signupResult.username);

      if (__DEV__) console.log('[App] Signup successful, username:', signupResult.username);
      setAuthState('EMAIL_VERIFICATION');
    } catch (error: unknown) {
      // Show full error details in Alert for debugging
      const authError = error as { message?: string; code?: string };
      const errorMsg = authError?.message || (error instanceof Error ? error.message : 'Signup failed');
      const errorCode = authError?.code || 'Unknown';

      if (__DEV__) console.log('[App] Signup failed:', { code: errorCode, message: errorMsg });

      setAuthError(`${errorCode}: ${errorMsg}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Signin password handler - just login, no signup/verify flow
  const handleSignInPassword = async (password: string) => {
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      if (__DEV__) console.log('[App] Signing in with email:', emailData);

      // Login with email as username (Cognito allows this)
      await AuthService.login(emailData, password);

      if (__DEV__) console.log('[App] Sign-in successful');

      // Go directly to authenticated (skip onboarding for existing users)
      setAuthState('AUTHENTICATED');
      reset(); // Reset demo state
      // Vibe set by DEMO_VIBES effect when demoState changes to COACH_INTRO
    } catch (error: unknown) {
      const authError = error as { message?: string; code?: string };
      const errorMsg = authError?.message || (error instanceof Error ? error.message : 'Sign in failed');
      const errorCode = authError?.code || 'Unknown';

      if (__DEV__) console.log('[App] Sign in failed:', { code: errorCode, message: errorMsg });

      setAuthError(`${errorCode}: ${errorMsg}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleEmailVerificationComplete = async (code: string) => {
    setAuthError(null);
    setIsAuthLoading(true);

    // Safety check: ensure we have the username from signup
    if (!usernameData) {
      if (__DEV__) console.error('[App] No username stored - signup may have failed');
      setAuthError('Session expired. Please start over.');
      setIsAuthLoading(false);
      return;
    }

    try {
      // Verify with username (not email) - Cognito requires the actual username
      if (__DEV__) console.log('[App] Verifying with username:', usernameData, 'code:', code);
      await AuthService.verify(usernameData, code);

      // Auto-login after verification using username
      if (__DEV__) console.log('[App] Logging in after verification');
      await AuthService.login(usernameData, passwordData);

      if (__DEV__) console.log('[App] Auth complete, tokens stored');
      setAuthState('DOB');
    } catch (error: unknown) {
      if (__DEV__) console.error('[App] Verification/login error:', JSON.stringify(error, null, 2));
      // Handle AuthError object from mapCognitoError (not an Error instance)
      const authError = error as { message?: string; code?: string };
      const message = authError?.message || (error instanceof Error ? error.message : 'Verification failed');
      setAuthError(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // ONBOARDING FLOW HANDLERS
  const firstName = useOnboardingStore((state) => state.firstName);
  const familyName = useOnboardingStore((state) => state.familyName);
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
  const loadOnboarding = useOnboardingStore((state) => state.loadFromStorage);
  const saveOnboarding = useOnboardingStore((state) => state.saveToStorage);
  const clearOnboarding = useOnboardingStore((state) => state.clearStorage);
  const onboardingLoaded = useOnboardingStore((state) => state.isLoaded);

  // Load onboarding persistence on mount (for crash recovery)
  useEffect(() => {
    loadOnboarding();
  }, [loadOnboarding]);

  // Name screen (comes first in Nathan's API flow)
  const handleNameComplete = (firstName: string, familyName: string) => {
    setFirstName(firstName);
    setFamilyName(familyName);
    setNickname(firstName); // Default to first name for display
    saveOnboarding(); // Persist for crash recovery
    setAuthState('EMAIL');  // Name → Email → Password → Verify
  };

  // Screen 5: DOB
  const handleDOBComplete = (
    dob: { month: number; day: number; year: number },
    ageRange: { min: number; max: number }
  ) => {
    setDateOfBirth(new Date(dob.year, dob.month - 1, dob.day));
    setAgeRange(ageRange.min, ageRange.max);
    saveOnboarding(); // Persist for crash recovery
    setAuthState('PERMISSIONS');
  };

  const handlePermissionsComplete = () => {
    setAuthState('BASICS_GENDER');
  };

  // Screen 6: Gender
  const handleGenderComplete = (gender: string) => {
    setGender(gender);
    saveOnboarding(); // Persist for crash recovery
    setAuthState('BASICS_PREFERENCES');
  };

  // Screen 7: Preferences
  const handlePreferencesComplete = (preference: string) => {
    setDatingPreference(preference);
    saveOnboarding(); // Persist for crash recovery
    setAuthState('ETHNICITY');
  };

  // Screen 8: Ethnicity
  const handleEthnicityComplete = (ethnicity: string) => {
    setEthnicity(ethnicity);
    saveOnboarding(); // Persist for crash recovery
    setAuthState('ETHNICITY_PREFERENCE');
  };

  // Screen 9: Ethnicity Preference
  const handleEthnicityPreferenceComplete = (ethnicities: string[]) => {
    setEthnicityPreferences(ethnicities);
    saveOnboarding(); // Persist for crash recovery
    setAuthState('BASICS_RELATIONSHIP');
  };

  // Screen 10: Relationship
  const handleRelationshipComplete = (relationshipType: string) => {
    setRelationshipType(relationshipType);
    saveOnboarding(); // Persist for crash recovery
    setAuthState('SMOKING');
  };

  // Screen 11: Smoking
  const handleSmokingComplete = (smokingMe: string, smokingPartner: string) => {
    setSmokingMe(smokingMe);
    setSmokingPartner(smokingPartner);
    saveOnboarding(); // Persist for crash recovery
    setAuthState('BASICS_LOCATION');
  };

  const handleLocationComplete = async (location: { type: 'gps' | 'zip'; value: string | { lat: number; lng: number } }) => {
    setLocation(location);
    markOnboardingComplete();
    clearOnboarding(); // Clean up persisted data after completion

    // Submit profile to backend (with user feedback on failure)
    try {
      const profilePayload = useOnboardingStore.getState().getProfilePayload();
      const token = await TokenManager.getToken();

      if (__DEV__) {
        console.log('[App] Profile payload:', JSON.stringify(profilePayload, null, 2));
        console.log('[App] Token exists:', !!token);
      }

      if (token && Object.keys(profilePayload).length > 0) {
        const API_BASE = 'https://dev.api.myaimatchmaker.ai';

        if (__DEV__) {
          console.log('[App] Submitting profile to API:', Object.keys(profilePayload).join(', '));
        }

        const response = await secureFetchJSON(`${API_BASE}/v1/profile/public`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(profilePayload),
        });

        if (__DEV__) {
          console.log('[App] Profile saved successfully');
        }
      }
    } catch (error: unknown) {
      // Show error to user - don't silently fail
      const errMsg = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'Profile Save Issue',
        `Your profile couldn't be saved to the server. You can update it later in Settings.\n\nError: ${errMsg}`,
        [{ text: 'Continue', style: 'default' }]
      );
      if (__DEV__) {
        console.warn('[App] Profile submission failed:', error);
        // Log full error details
        if (error && typeof error === 'object') {
          console.warn('[App] Error details:', JSON.stringify(error, null, 2));
        }
      }
    }

    // Submit onboarding answers via POST /v1/answers (data not accepted by profile API)
    // This includes: dating preference, ethnicity, relationship type, smoking
    try {
      const answersResult = await useOnboardingStore.getState().submitOnboardingAnswers();

      if (__DEV__) {
        if (answersResult.success) {
          console.log('[App] All onboarding answers submitted successfully');
        } else {
          console.log('[App] Some answers failed:', answersResult.errors);
        }
      }
    } catch (error: unknown) {
      // Log but don't block - answers can be re-submitted later
      if (__DEV__) {
        console.warn('[App] Onboarding answers submission failed:', error);
      }
    }

    // All onboarding complete - go to main app
    setAuthState('AUTHENTICATED');
    reset(); // Reset demo state
    // Vibe set by DEMO_VIBES effect when demoState changes to COACH_INTRO
  };

  // DEMO FLOW - shader changes during interview/coach
  const handleBackgroundChange = useCallback((index: number) => {
    const shaders = getAllShaders();
    const shader = shaders.find(s => s.id === index) || shaders[0];
    vibeRef.current?.setShader(shader.source);
  }, []);

  // Dynamic vibe changes (for CoachScreen emotion-based transitions)
  // CRITICAL: Use store for single source of truth - subscription forwards to shader
  const handleVibeChange = useCallback((theme: VibeColorTheme, complexity: VibeComplexity) => {
    useVibeController.getState().setFullVibe('ABBY', 'SPEAKING', theme, complexity, 'CALM');
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

      case 'SIGNIN':
        return (
          <SignInScreen
            onSignIn={async (email: string, password: string) => {
              setAuthError(null);
              setIsAuthLoading(true);
              try {
                if (__DEV__) console.log('[App] Signing in with email:', email);
                await AuthService.login(email, password);
                if (__DEV__) console.log('[App] Sign-in successful');
                setAuthState('AUTHENTICATED');
                reset();
                // Vibe set by DEMO_VIBES effect when demoState changes to COACH_INTRO
              } catch (error: unknown) {
                const authErr = error as { message?: string; code?: string };
                const errorMsg = authErr?.message || (error instanceof Error ? error.message : 'Sign in failed');
                setAuthError(errorMsg);
              } finally {
                setIsAuthLoading(false);
              }
            }}
            onBack={() => setAuthState('LOGIN')}
            onForgotPassword={async () => {
              if (!emailData) {
                setAuthError('Please enter your email first');
                return;
              }
              try {
                setIsAuthLoading(true);
                await AuthService.forgotPassword(emailData);
                // Show success message - user needs to check email
                setAuthError(null);
                Alert.alert(
                  'Reset Code Sent',
                  `A password reset code has been sent to ${emailData}. Check your email and use the code to reset your password.`,
                  [{ text: 'OK' }]
                );
              } catch (error: unknown) {
                const authError = error as { message?: string; code?: string };
                setAuthError(authError?.message || 'Failed to send reset code');
              } finally {
                setIsAuthLoading(false);
              }
            }}
            isLoading={isAuthLoading}
            error={authError}
          />
        );

      case 'PASSWORD':
        return (
          <PasswordScreen
            mode={isSignUp ? 'signup' : 'signin'}
            email={emailData}
            onNext={isSignUp ? handlePasswordComplete : handleSignInPassword}
            onSecretBack={handleSecretBack}
            onSecretForward={handleSecretForward}
            isLoading={isAuthLoading}
            error={authError}
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
            isLoading={isAuthLoading}
            error={authError}
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
        return <CoachIntroScreen ref={coachIntroScreenRef} onBackgroundChange={handleBackgroundChange} onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
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
        return <CoachScreen ref={coachScreenRef} onBackgroundChange={handleBackgroundChange} onVibeChange={handleVibeChange} onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
      default:
        return <CoachIntroScreen ref={coachIntroScreenRef} onBackgroundChange={handleBackgroundChange} onSecretBack={handleSecretBack} onSecretForward={handleSecretForward} />;
    }
  };

  // Loading state
  if (!fontsLoaded || !settingsLoaded || !onboardingLoaded || authState === 'LOADING') {
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
      {/* DEV: Toggle to test if useClock works at all - set false to use VibeMatrixAnimated */}
      <View style={styles.vibeMatrixLayer}>
        {__DEV__ && false ? (
          <ClockTest />
        ) : (
          <VibeMatrixAnimated
            ref={vibeRef}
            initialTheme={DEFAULT_VIBE.theme}
            initialComplexity={DEFAULT_VIBE.complexity}
          />
        )}
      </View>

      {/* Layer 0.5: GlassFloor (auth/onboarding screens only) */}
      {(authState as AuthState) !== 'AUTHENTICATED' && (authState as AuthState) !== 'LOADING' && (
        <View style={styles.glassFloorLayer}>
          <GlassFloor />
        </View>
      )}

      {/* Layer 1: Abby Orb (only in demo mode) */}
      {authState === 'AUTHENTICATED' && (
        <View style={styles.orbLayer}>
          <AbbyOrb mode={orbMode} onTap={handleOrbTap} />
        </View>
      )}

      {/* Layer 2: UI (auth or demo screens) */}
      <View style={styles.uiLayer} pointerEvents="box-none">
        {authState !== 'AUTHENTICATED' ? renderAuthScreen() : renderDemoScreen()}
      </View>

      {/*
        MENU SCREENS - MUST render AFTER uiLayer for correct touch handling!
        React Native touch system respects RENDER ORDER, not just z-index.
        These screens have z-index 2000, uiLayer has z-index 20.
        But rendering after ensures touches hit these first.
      */}
      {menuScreen === 'settings' && (
        <SettingsScreen
          onClose={() => {
            if (__DEV__) console.log('[App] Settings closing');
            setMenuScreen('none');
          }}
        />
      )}

      {menuScreen === 'profile' && (
        <ProfileScreen
          onClose={() => {
            if (__DEV__) console.log('[App] Profile closing');
            setMenuScreen('none');
          }}
        />
      )}

      {menuScreen === 'matches' && (
        <MatchesScreen
          onClose={() => {
            if (__DEV__) console.log('[App] Matches closing');
            setMenuScreen('none');
          }}
        />
      )}

      {menuScreen === 'certification' && (
        <CertificationScreen
          onComplete={() => {
            if (__DEV__) console.log('[App] Certification complete');
            setMenuScreen('none');
          }}
          onBack={() => {
            if (__DEV__) console.log('[App] Certification back');
            setMenuScreen('none');
          }}
        />
      )}

      {menuScreen === 'photos' && (
        <PhotosScreen
          onClose={() => {
            if (__DEV__) console.log('[App] Photos closing');
            setMenuScreen('none');
          }}
          onAddPhoto={async () => {
            if (__DEV__) console.log('[App] Add photo pressed');

            try {
              // Request permission
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to your photos to upload.');
                return;
              }

              // Pick image
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (result.canceled) {
                if (__DEV__) console.log('[App] Image picker cancelled');
                return;
              }

              const image = result.assets[0];
              if (__DEV__) console.log('[App] Image selected:', image.uri);

              // Upload to API
              const token = await TokenManager.getToken();
              if (!token) {
                Alert.alert('Not Logged In', 'Please log in to upload photos.');
                return;
              }

              const API_BASE = 'https://dev.api.myaimatchmaker.ai';

              // Step 1: Get presigned upload URL from backend
              const filename = image.fileName || `photo_${Date.now()}.jpg`;
              const contentType = image.mimeType || 'image/jpeg';

              if (__DEV__) console.log('[App] Getting presigned URL for:', filename);

              // Backend uses snake_case field names
              const presignResponse = await fetch(`${API_BASE}/v1/photos/presign`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  file_name: filename,
                  content_type: contentType
                }),
              });

              if (!presignResponse.ok) {
                const errorText = await presignResponse.text();
                if (__DEV__) console.error('[App] Presign failed:', presignResponse.status, errorText);
                Alert.alert('Upload Failed', `Could not get upload URL: ${presignResponse.status}`);
                return;
              }

              const presignData = await presignResponse.json();
              // Backend returns snake_case: upload_url, file_key
              const uploadUrl = presignData.upload_url || presignData.uploadUrl;
              const fileKey = presignData.file_key || presignData.fileKey;
              if (__DEV__) console.log('[App] Got presigned URL, fileKey:', fileKey);

              // Defensive check: ensure we have required data from presign
              if (!uploadUrl || !fileKey) {
                if (__DEV__) console.error('[App] Presign response missing required fields:', { uploadUrl, fileKey });
                Alert.alert('Upload Failed', 'Invalid presign response from server');
                return;
              }

              // Step 2: Upload file directly to S3 using presigned URL
              const imageUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
              const imageBlob = await fetch(imageUri).then(r => r.blob());

              const s3Response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                  'Content-Type': contentType,
                },
                body: imageBlob,
              });

              if (!s3Response.ok) {
                if (__DEV__) console.error('[App] S3 upload failed:', s3Response.status);
                Alert.alert('Upload Failed', 'Could not upload to storage');
                return;
              }
              if (__DEV__) console.log('[App] S3 upload successful');

              // Step 3: Register photo with backend (snake_case per API docs)
              // API expects: photo_id (the S3 key), is_primary, order_index
              const registerResponse = await fetch(`${API_BASE}/v1/photos`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  photo_id: fileKey,      // S3 file key from presign
                  is_primary: false,
                  order_index: 0          // First photo slot
                }),
              });

              if (!registerResponse.ok) {
                const errorText = await registerResponse.text();
                if (__DEV__) console.error('[App] Register failed:', registerResponse.status, errorText);
                Alert.alert('Upload Failed', `Could not register photo: ${registerResponse.status}`);
                return;
              }

              if (__DEV__) console.log('[App] Photo registered successfully');
              Alert.alert('Success', 'Photo uploaded!');

              // Close and reopen to refresh
              setMenuScreen('none');
              setTimeout(() => setMenuScreen('photos'), 100);
            } catch (error) {
              if (__DEV__) console.error('[App] Photo upload error:', error);
              Alert.alert('Upload Error', 'Something went wrong uploading your photo.');
            }
          }}
        />
      )}

      {/* Hamburger Menu - MUST be rendered LAST for correct z-index */}
      {authState === 'AUTHENTICATED' && (
        <HamburgerMenu
          onProfilePress={() => {
            if (__DEV__) console.log('[App] 📱 Menu: PROFILE pressed');
            setMenuScreen('profile');
          }}
          onPhotosPress={() => {
            if (__DEV__) console.log('[App] 📷 Menu: PHOTOS pressed');
            setMenuScreen('photos');
          }}
          onMatchesPress={() => {
            if (__DEV__) console.log('[App] 💕 Menu: MATCHES pressed');
            setMenuScreen('matches');
          }}
          onSettingsPress={() => {
            if (__DEV__) console.log('[App] ⚙️ Menu: SETTINGS pressed');
            setMenuScreen('settings');
          }}
          onCertificationPress={() => {
            if (__DEV__) console.log('[App] 🛡️ Menu: CERTIFICATION pressed');
            setMenuScreen('certification');
          }}
          onLogoutPress={() => {
            if (__DEV__) console.log('[App] 🚪 LOGOUT: Starting clean logout...');

            // 1. Clear auth tokens
            AuthService.logout();

            // 2. Set auth state FIRST (before reset!) so DEMO_VIBES guard catches it
            setAuthState('LOGIN');
            setMenuScreen('none');

            // 3. NOW reset - DEMO_VIBES won't fire because authState is already LOGIN
            reset();  // Demo store → back to COACH_INTRO
            useVibeController.getState().reset();  // Vibe → DEEP/SMOOTHIE

            if (__DEV__) console.log('[App] 🚪 LOGOUT: Complete → LOGIN screen');
          }}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics ?? fallbackMetrics}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
  // Glass Sandwich Layer Structure (explicit z-index)
  vibeMatrixLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: Z_INDEX.VIBE_MATRIX,
  },
  glassFloorLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: Z_INDEX.GLASS_FLOOR,
  },
  orbLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: Z_INDEX.ABBY_ORB,
  },
  uiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: Z_INDEX.GLASS_INTERFACE,
  },
});
