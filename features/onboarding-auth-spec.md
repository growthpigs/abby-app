# FEATURE SPEC: Onboarding & Authentication System

**What:** Complete user registration, authentication, and basic profile setup flow
**Who:** New users creating ABBY accounts and returning users logging in
**Why:** Establishes user identity, captures essential demographics, and enables data persistence across sessions
**Status:** 📝 Needs Implementation

---

## User Stories

**US-001: Account Creation**
As a potential user, I want to create an account using phone/email/social login so that I can access the app securely.

Acceptance Criteria:
- [ ] User can enter phone number with proper formatting and validation
- [ ] User can continue with Apple Sign-In for streamlined authentication
- [ ] User can continue with Google or Facebook for social login
- [ ] Phone verification with 6-digit SMS code works reliably
- [ ] User can change phone number during verification process
- [ ] Account creation saves basic auth info securely to AsyncStorage
- [ ] Failed verification attempts are handled gracefully with clear error messages
- [ ] Rate limiting prevents abuse of SMS verification system

**US-002: Basic Profile Setup**
As a new user, I want to provide my basic information so that Abby can begin to understand who I am.

Acceptance Criteria:
- [ ] User enters full legal name (private) and display name (public) with validation
- [ ] User enters date of birth with date picker and calculates age automatically
- [ ] User sets preferred age range with dual-slider component
- [ ] User selects sexual identity from comprehensive, inclusive list
- [ ] User selects who they're looking for with multiple selection support
- [ ] User selects ethnicity (theirs and preferences) with "no preference" option
- [ ] User selects relationship type (serious/casual/unsure) and smoking preferences
- [ ] Profile data is validated before saving and shows meaningful errors
- [ ] User can navigate back/forward through profile setup without losing data
- [ ] Progress is automatically saved and can be resumed if user exits

**US-011: Secure Session Management**
As a user, I want my login session to persist appropriately so that I don't have to re-authenticate unnecessarily.

Acceptance Criteria:
- [ ] Authentication tokens are stored securely using Expo SecureStore
- [ ] Session automatically refreshes before token expiration
- [ ] User stays logged in across app restarts (persistent auth)
- [ ] Biometric authentication can be enabled for quick re-entry
- [ ] Session logout clears all local user data completely
- [ ] Failed authentication attempts are limited and provide clear feedback

---

## Functional Requirements

What this feature DOES:
- [ ] Provides multiple authentication methods (phone, Apple, Google, Facebook)
- [ ] Implements secure SMS verification flow with 6-digit codes
- [ ] Captures comprehensive user demographic data during onboarding
- [ ] Validates all user inputs with appropriate error messaging
- [ ] Stores authentication tokens securely using device keychain
- [ ] Manages session lifecycle including automatic refresh and logout
- [ ] Persists user profile data locally for offline access
- [ ] Provides smooth navigation flow with progress tracking
- [ ] Integrates with glass interface components for consistent UX
- [ ] Supports resuming incomplete onboarding processes

What this feature does NOT do:
- ❌ Handle backend user verification or identity confirmation (V2 feature)
- ❌ Implement photo upload or profile pictures (V2 feature)
- ❌ Provide social features or profile browsing (core differentiator)
- ❌ Handle matching algorithms or compatibility scoring (interview system handles this)
- ❌ Process payments or subscription management (V2 feature)

---

## Data Model

Entities involved:
- **User** - Core user profile and demographic information
- **AppState** - Authentication state and current user session
- **InterviewSession** - Linked to user for interview progress tracking

New fields needed:
| Entity | Field | Type | Description |
|--------|-------|------|-------------|
| User | authProvider | enum | phone / apple / google / facebook |
| User | phoneVerified | boolean | If phone number has been verified |
| User | profileComplete | boolean | If basic profile setup is finished |
| User | lastLoginAt | DateTime | Last successful authentication |
| AppState | authState | enum | unauthenticated / authenticating / authenticated |
| AppState | onboardingStep | enum | auth / profile_basic / profile_extended / complete |
| AppState | accessToken | string | JWT access token for API calls |
| AppState | refreshToken | string | Token for refreshing access |
| AppState | tokenExpiresAt | DateTime | When current token expires |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /auth/phone/send | POST | Send SMS verification code to phone |
| /auth/phone/verify | POST | Verify SMS code and authenticate user |
| /auth/social | POST | Authenticate via Apple/Google/Facebook |
| /auth/refresh | POST | Refresh expired access token |
| /user/profile | GET | Retrieve current user profile |
| /user/profile | PUT | Update/complete user profile |
| /app/config | GET | Get app configuration for validation rules |

*Note: For MVP, all endpoints are mocked locally with AsyncStorage persistence.*

---

## UI Components

| Component | Purpose | Location |
|-----------|---------|----------|
| AuthMethodScreen | Choose auth method (phone/social) | `src/components/screens/auth/AuthMethodScreen.tsx` ❌ |
| PhoneInputScreen | Enter and verify phone number | `src/components/screens/auth/PhoneInputScreen.tsx` ❌ |
| SocialAuthScreen | Handle social login flows | `src/components/screens/auth/SocialAuthScreen.tsx` ❌ |
| ProfileBasicScreen | Essential demographic info | `src/components/screens/onboarding/ProfileBasicScreen.tsx` ❌ |
| ProfileExtendedScreen | Additional preferences | `src/components/screens/onboarding/ProfileExtendedScreen.tsx` ❌ |
| ProgressIndicator | Show onboarding progress | `src/components/ui/ProgressIndicator.tsx` ❌ |
| GenderPicker | Inclusive gender selection | `src/components/ui/GenderPicker.tsx` ❌ |
| AgePicker | Age and date of birth input | `src/components/ui/AgePicker.tsx` ❌ |
| EthnicityPicker | Ethnicity selection with preferences | `src/components/ui/EthnicityPicker.tsx` ❌ |

---

## Implementation Tasks

### Setup
- [ ] TASK-001: Configure Expo AuthSession for social authentication
- [ ] TASK-002: Set up AsyncStorage schemas for user data persistence
- [ ] TASK-003: Create secure token storage using Expo SecureStore
- [ ] TASK-004: Implement form validation utilities and error handling

### Authentication Flow
- [ ] TASK-005: Create AuthMethodScreen with social and phone options
- [ ] TASK-006: Implement phone number input with international formatting
- [ ] TASK-007: Build SMS verification UI with resend capability
- [ ] TASK-008: Integrate Apple Sign-In with proper error handling
- [ ] TASK-009: Integrate Google Sign-In with credential management
- [ ] TASK-010: Integrate Facebook Login with privacy compliance
- [ ] TASK-011: Implement automatic token refresh background service

### Profile Setup Flow
- [ ] TASK-012: Create ProfileBasicScreen with essential fields
- [ ] TASK-013: Build comprehensive gender selection component
- [ ] TASK-014: Implement age picker with DOB validation
- [ ] TASK-015: Create ethnicity selection with preference options
- [ ] TASK-016: Build relationship type and lifestyle preference selectors
- [ ] TASK-017: Implement profile validation and progress saving
- [ ] TASK-018: Create navigation flow with back/forward buttons

### State Management
- [ ] TASK-019: Integrate authentication state with Zustand store
- [ ] TASK-020: Implement persistent login across app restarts
- [ ] TASK-021: Create logout functionality with data clearing
- [ ] TASK-022: Handle authentication errors and retry logic

### Glass Interface Integration
- [ ] TASK-023: Style all auth screens with glass components
- [ ] TASK-024: Implement proper blur effects over VibeMatrix background
- [ ] TASK-025: Create smooth transitions between onboarding screens
- [ ] TASK-026: Add haptic feedback for all interactive elements

### Polish & Testing
- [ ] TASK-027: Implement comprehensive input validation
- [ ] TASK-028: Add loading states and error recovery
- [ ] TASK-029: Test authentication flows on physical device
- [ ] TASK-030: Ensure accessibility compliance for all forms

---

## Architecture: Integration Points

### Glass Sandwich Layer Integration
```
Layer 3 (Z:30) - SemanticOverlay    │ Form labels, error messages
Layer 2 (Z:20) - GlassInterface     │ Auth/onboarding screens
Layer 1 (Z:10) - AbbyOrb            │ Hidden during auth, appears after
Layer 0 (Z:0)  - VibeMatrix         │ TRUST vibe during onboarding
```

### State Machine Integration
```
AppState.hubState Flow:
SPLASH → ONBOARDING → MEETING_ABBY

AppState.onboardingStep Flow:
auth → profile_basic → profile_extended → complete
```

### Zustand Store Integration
```typescript
interface AuthState {
  user: User | null;
  authState: 'unauthenticated' | 'authenticating' | 'authenticated';
  onboardingStep: 'auth' | 'profile_basic' | 'profile_extended' | 'complete';
  login: (method: AuthMethod) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}
```

---

## Authentication Specifications

### Phone Authentication Flow
1. **Phone Input**: User enters phone number with country code picker
2. **Formatting**: Auto-format to E.164 standard (+1234567890)
3. **SMS Request**: Send 6-digit code with 5-minute expiration
4. **Verification**: User enters code with auto-advance and paste support
5. **Token Generation**: Return JWT access + refresh tokens
6. **Persistence**: Store tokens in SecureStore for future sessions

### Social Authentication Flows
```typescript
// Apple Sign-In
const appleAuthConfig = {
  requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
  nonce: generateNonce(),
  state: generateState()
};

// Google Sign-In
const googleAuthConfig = {
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
  scopes: ['profile', 'email'],
  additionalScopes: []
};

// Facebook Login
const facebookAuthConfig = {
  permissions: ['public_profile', 'email'],
  type: 'popup' // For web testing
};
```

### Token Management
- **Access Token**: 24-hour expiration, used for API authentication
- **Refresh Token**: 30-day expiration, used to renew access tokens
- **Auto-refresh**: Background service refreshes tokens 5 minutes before expiration
- **Secure Storage**: All tokens stored using Expo SecureStore with biometric protection

---

## Profile Setup Specifications

### Basic Profile Fields
```typescript
interface BasicProfile {
  fullName: string;          // Validation: 2-50 chars, no numbers
  displayName: string;       // Validation: 2-30 chars, alphanumeric + spaces
  dateOfBirth: Date;         // Validation: 18-99 years old
  preferredAgeMin: number;   // Validation: 18-99, <= preferredAgeMax
  preferredAgeMax: number;   // Validation: 18-99, >= preferredAgeMin
  gender: Gender;            // Required selection from enum
  seekingGenders: Gender[];  // Multiple selection allowed
}
```

### Extended Profile Fields
```typescript
interface ExtendedProfile {
  ethnicity: Ethnicity;           // Single selection
  ethnicityPrefs: Ethnicity[];    // Multiple selection, optional
  relationshipType: RelationshipType; // serious / casual / unsure
  smokingPref: SmokingPref;       // never / sometimes / regularly / no_pref
}
```

### Form Validation Rules
| Field | Rule | Error Message |
|-------|------|---------------|
| fullName | 2-50 chars, letters/spaces only | "Please enter your full legal name" |
| displayName | 2-30 chars, unique | "Choose a display name (2-30 characters)" |
| dateOfBirth | Age 18-99 | "You must be 18+ to use ABBY" |
| preferredAgeMin | 18-99, <= max | "Minimum age must be at least 18" |
| preferredAgeMax | 18-99, >= min | "Maximum age cannot be less than minimum" |
| phoneNumber | E.164 format | "Please enter a valid phone number" |

---

## Accessibility Specifications

### Form Accessibility
- All form inputs have proper `accessibilityLabel` and `accessibilityHint`
- Error messages are announced by screen readers
- Focus management moves logically through form fields
- Touch targets meet minimum 44x44px requirement
- High contrast mode increases border visibility

### Social Auth Accessibility
```typescript
<AppleAuthentication.AppleAuthenticationButton
  accessibilityLabel="Sign in with Apple"
  accessibilityHint="Double tap to authenticate using your Apple ID"
  accessibilityRole="button"
/>
```

### Navigation Accessibility
- Skip links for users who want to complete profile quickly
- Clear progress indication for multi-step flow
- Back button properly labeled and functional
- Form validation errors clearly associated with fields

---

## Security Specifications

### Data Protection
1. **Sensitive Data**: fullName and phoneNumber never logged or sent to analytics
2. **Token Security**: All auth tokens encrypted at rest using device keychain
3. **Transmission**: HTTPS only for all network communications
4. **Local Storage**: User data encrypted using AES-256 before AsyncStorage
5. **Session Management**: Automatic logout after 30 days of inactivity

### Privacy Compliance
- Clear consent for data collection during onboarding
- Option to delete account and all data (V2)
- No tracking without explicit consent
- Social auth data minimization (only required scopes)

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| SMS code doesn't arrive | Show resend option after 60 seconds, alternative auth methods |
| Social auth cancelled | Return to auth method selection, no error state |
| Network failure during profile save | Save draft locally, retry when connected |
| User enters invalid age | Clear validation error, suggest correction |
| Phone number already registered | Offer to sign in instead, don't reveal account exists |
| Token refresh fails | Graceful logout, redirect to authentication |
| App backgrounded during auth | Maintain auth state, handle deep links properly |
| Biometric auth disabled | Fall back to passcode, maintain session |

---

## Testing Checklist

- [ ] Happy path works - Complete onboarding flow from start to finish
- [ ] Error states handled - All validation errors and network failures
- [ ] Loading states shown - Spinners during auth requests and profile saves
- [ ] Social auth tested - Apple, Google, Facebook flows on device
- [ ] Phone auth tested - SMS sending and verification on device
- [ ] Profile validation - All field combinations and edge cases
- [ ] Token management - Refresh, expiration, logout scenarios
- [ ] Accessibility tested - VoiceOver navigation and announcements
- [ ] Performance verified - Smooth transitions, 60fps maintained
- [ ] Security verified - No sensitive data in logs, encrypted storage

---

## Performance Specifications

### Loading Targets
- Auth method screen: <500ms first render
- Phone verification: <2s code delivery
- Social auth: <3s provider response
- Profile save: <1s local save, background sync
- Token refresh: <500ms background operation

### Memory Management
- Profile images (V2): Lazy load and cache management
- Form state: Clear unused data after completion
- Token storage: Minimal memory footprint
- Auth providers: Release resources after use

---

## Future Enhancements (V2)

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Biometric Authentication | Face ID / Touch ID for app entry | 1-2 weeks |
| Profile Photo Upload | Camera integration with image processing | 2-3 weeks |
| Account Verification | Identity verification for trust & safety | 3-4 weeks |
| Social Profile Import | Import basic info from social accounts | 1-2 weeks |
| Account Recovery | Email-based account recovery system | 1-2 weeks |
| Multi-factor Authentication | SMS + TOTP for enhanced security | 2-3 weeks |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2024-12-20 | Initial SpecKit specification created with comprehensive auth and profile flows | Chi |

---

*Document created: December 20, 2024*
*Last updated: December 20, 2024*