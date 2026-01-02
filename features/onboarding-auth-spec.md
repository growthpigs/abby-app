# FEATURE SPEC: Authentication System (AWS Cognito)

**What:** User registration, authentication, and session management via AWS Cognito
**Who:** New users creating ABBY accounts and returning users logging in
**Why:** Establishes user identity and enables secure API access
**Status:** 🚀 Implemented

> **Architecture Decision (2026-01-02):** Using AWS Cognito email/password authentication via client backend. This replaced the original phone/social login plan.

---

## Current Implementation

### AWS Cognito Configuration

```typescript
// From CognitoConfig.ts
const poolData = {
  UserPoolId: 'us-east-1_l3JxaWpl5',
  ClientId: '2ljj7mif1k7jjc2ajiq676fhm1',
};
```

**Region:** us-east-1

### Key Files

| File | Purpose |
|------|---------|
| `src/services/AuthService.ts` | Main auth operations (signup, verify, login, logout) |
| `src/services/CognitoConfig.ts` | Cognito SDK configuration |
| `src/services/TokenManager.ts` | Secure token storage |
| `src/store/useOnboardingStore.ts` | Onboarding state management |

### Screens

| Screen | Path | Purpose |
|--------|------|---------|
| EmailScreen | `src/components/screens/EmailScreen.tsx` | Email input for signup |
| EmailVerificationScreen | `src/components/screens/EmailVerificationScreen.tsx` | 6-digit code verification |
| PasswordScreen | `src/components/screens/PasswordScreen.tsx` | Password creation |
| LoginScreen | `src/components/screens/LoginScreen.tsx` | Existing user login |
| SignInScreen | `src/components/screens/SignInScreen.tsx` | Sign in/up selection |
| NameScreen | `src/components/screens/NameScreen.tsx` | Name input |

---

## Authentication Flow

### New User Signup

```
EmailScreen → NameScreen → PasswordScreen → EmailVerificationScreen → Login
```

1. **Email Entry** - User enters email address
2. **Name Entry** - User enters full name
3. **Password Creation** - User creates password (Cognito requirements)
4. **Cognito Signup** - `AuthService.signup(email, password, name)`
5. **Email Verification** - 6-digit code sent to email
6. **Verify Code** - `AuthService.verify(username, code)`
7. **Auto Login** - `AuthService.login(email, password)`
8. **Token Storage** - Tokens stored via TokenManager

### Returning User Login

```
LoginScreen → Home
```

1. **Credentials Entry** - User enters email and password
2. **Cognito Login** - `AuthService.login(email, password)`
3. **Token Storage** - Tokens stored via TokenManager

---

## API Reference

### AuthService Methods

```typescript
import { AuthService } from '@/services/AuthService';

// Sign up new user
const result = await AuthService.signup(email, password, name);
// Returns: { userSub, username, codeDeliveryDetails }

// Verify email with 6-digit code
await AuthService.verify(username, code);

// Resend verification code
await AuthService.resendVerificationCode(username);

// Log in existing user
const tokens = await AuthService.login(email, password);
// Returns: { accessToken, idToken, refreshToken, expiresIn, tokenType }

// Refresh access token
const newTokens = await AuthService.refreshToken();

// Log out
await AuthService.logout();

// Check auth status
const isAuth = await AuthService.isAuthenticated();

// Get current token
const token = await AuthService.getAccessToken();
```

### Error Codes

| Cognito Code | User Message |
|--------------|--------------|
| UsernameExistsException | This email is already registered |
| InvalidPasswordException | Password does not meet requirements |
| UserNotConfirmedException | Please verify your email first |
| NotAuthorizedException | Incorrect email or password |
| CodeMismatchException | Invalid verification code |
| ExpiredCodeException | Verification code expired. Request a new one. |
| LimitExceededException | Too many attempts. Please wait and try again. |
| UserNotFoundException | No account found with this email |

---

## User Stories

**US-001: Account Creation**
As a potential user, I want to create an account so that I can access the app securely.

Acceptance Criteria:
- [x] User can enter email address
- [x] User can enter full name
- [x] User can create password
- [x] 6-digit verification code sent to email
- [x] User can verify email with code
- [x] User can resend verification code
- [x] Error messages are clear and helpful
- [x] Tokens stored securely

**US-002: Returning User Login**
As a returning user, I want to log in quickly.

Acceptance Criteria:
- [x] User can enter email and password
- [x] Login authenticates with Cognito
- [x] Session persists across app restarts
- [x] Failed login shows clear error

---

## Token Management

### Storage

Tokens are stored securely via `TokenManager.ts`:

```typescript
import { TokenManager } from '@/services/TokenManager';

await TokenManager.setToken(accessToken);
await TokenManager.setRefreshToken(refreshToken);
const token = await TokenManager.getToken();
await TokenManager.clearTokens();
```

### Token Lifecycle

- **Access Token**: 1 hour expiration
- **Refresh Token**: 30 days expiration
- **Auto Refresh**: Call `AuthService.refreshToken()` before expiration

---

## Password Requirements

Cognito enforces password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Test Account

```
Email:    rodericandrews+4@gmail.com
Password: TestPass123!
Status:   Verified, Login works
```

---

## Security

- All tokens stored using secure storage (not AsyncStorage)
- Console logs gated with `__DEV__`
- Error messages sanitized (no internal details exposed)
- Cognito SDK handles encryption

---

## Onboarding Store

```typescript
import { useOnboardingStore } from '@/store/useOnboardingStore';

const {
  email,
  name,
  username,  // Generated by Cognito (same as email)
  setEmail,
  setName,
  setUsername,
  reset,
} = useOnboardingStore();
```

---

## Implementation Status

### Completed ✅

- [x] Email/password signup flow
- [x] Email verification with 6-digit code
- [x] Login flow
- [x] Token storage and refresh
- [x] Error handling and user-friendly messages
- [x] All screens implemented
- [x] Onboarding store

### Not Implemented (Original Spec)

These were in the original spec but not implemented:

- ❌ Phone number authentication (replaced with email)
- ❌ Apple Sign-In (not needed for MVP)
- ❌ Google Sign-In (not needed for MVP)
- ❌ Facebook Login (not needed for MVP)
- ❌ Biometric authentication (V2 feature)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-02 | **MAJOR:** Rewrote spec to match actual implementation (Cognito email/password) | Chi |
| 2026-01-02 | Documented all auth screens and service methods | Chi |
| 2024-12-20 | Initial SpecKit specification (phone/social auth) | Chi |

---

*Document created: December 20, 2024*
*Last updated: January 2, 2026*
