/**
 * Screen Components
 *
 * Auth Flow:
 * LOGIN → NAME → EMAIL → PASSWORD → VERIFICATION → (Authenticated)
 *
 * Onboarding Flow:
 * DOB → PERMISSIONS → GENDER → PREFERENCES → ETHNICITY → ETHNICITY_PREF → RELATIONSHIP → SMOKING → LOCATION
 *
 * Main App Flow:
 * COACH_INTRO → INTERVIEW → SEARCHING → MATCH → PAYMENT → REVEAL → COACH
 */

// Auth screens
export { LoginScreen } from './LoginScreen';
export { SignInScreen } from './SignInScreen';
export { NameScreen } from './NameScreen';
export { EmailScreen } from './EmailScreen';
export { PasswordScreen } from './PasswordScreen';
export { EmailVerificationScreen } from './EmailVerificationScreen';
export { LoadingScreen } from './LoadingScreen';

// Onboarding screens
export { DOBScreen } from './DOBScreen';
export { PermissionsScreen } from './PermissionsScreen';
export { BasicsGenderScreen } from './BasicsGenderScreen';
export { BasicsPreferencesScreen } from './BasicsPreferencesScreen';
export { EthnicityScreen } from './EthnicityScreen';
export { EthnicityPreferenceScreen } from './EthnicityPreferenceScreen';
export { BasicsRelationshipScreen } from './BasicsRelationshipScreen';
export { SmokingScreen } from './SmokingScreen';
export { BasicsLocationScreen } from './BasicsLocationScreen';

// Main app screens
export { CoachIntroScreen } from './CoachIntroScreen';
export { InterviewScreen } from './InterviewScreen';
export { SearchingScreen } from './SearchingScreen';
export { MatchScreen } from './MatchScreen';
export { PaymentScreen } from './PaymentScreen';
export { RevealScreen } from './RevealScreen';
export { CoachScreen } from './CoachScreen';

// Menu screens (accessible from hamburger menu: Profile, Photos, Matches, Settings)
export { SettingsScreen } from './SettingsScreen';
export { ProfileScreen } from './ProfileScreen';
export { PhotosScreen } from './PhotosScreen';
export { MatchesScreen } from './MatchesScreen';

// Certification (verification flow)
export { CertificationScreen } from './CertificationScreen';
