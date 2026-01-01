# FEATURE SPEC: AWS Cognito Authentication

**What:** Email/password authentication via AWS Cognito
**Who:** New users signing up, returning users logging in
**Why:** Establishes user identity with client's backend infrastructure
**Status:** ✅ COMPLETE (Frontend) | ❌ BLOCKED (Backend Lambda)

---

## 🔴 CURRENT STATUS (2026-01-01)

**Frontend Implementation:** ✅ Complete and tested
**Backend Integration:** ❌ Blocked by PostConfirmation Lambda

### What Works
- ✅ Real Cognito signup with amazon-cognito-identity-js
- ✅ Email verification codes delivered and accepted
- ✅ Login returns valid JWT tokens (Access + ID)
- ✅ Tokens stored securely in SecureStore
- ✅ Error handling with user-friendly messages

### Backend Blocker
```
UnexpectedLambdaException: PostConfirmation invocation failed due to error AccessDeniedException
```
- Lambda that creates user in PostgreSQL lacks IAM permissions
- API calls return 500 because user doesn't exist in backend DB
- **Nathan must fix Lambda IAM role**

### Test Account
```
Email:    rodericandrews+4@gmail.com
Password: TestPass123!
UserSub:  f4b854d8-30d1-7062-c933-ea7071a64b64
```

---

## Cognito Configuration

| Setting | Value |
|---------|-------|
| User Pool ID | `us-east-1_l3JxaWpl5` |
| Client ID | `2ljj7mif1k7jjc2ajiq676fhm1` |
| Region | `us-east-1` |
| Auth Method | Email/Password |

**Password Requirements (email/password only):**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

---

## User Stories

**US-AUTH-001: User Registration**
As a new user, I want to create an account with email and password so that I can access ABBY.

Acceptance Criteria:
- [ ] User enters email address with validation
- [ ] User enters password meeting Cognito requirements
- [ ] User enters first and last name
- [ ] SignUp call creates unverified Cognito user
- [ ] 6-digit verification code sent to email
- [ ] Clear error messages for validation failures

**US-AUTH-002: Email Verification**
As a new user, I want to verify my email so that I can complete registration.

Acceptance Criteria:
- [ ] User enters 6-digit code from email
- [ ] ConfirmSignUp validates code with Cognito
- [ ] User can request new code if expired
- [ ] Clear error for invalid/expired codes
- [ ] After verification, user can login

**US-AUTH-003: User Login**
As a returning user, I want to log in with email and password so that I can access my account.

Acceptance Criteria:
- [ ] User enters email and password
- [ ] InitiateAuth returns JWT tokens
- [ ] Tokens stored securely (iOS Keychain via SecureStore)
- [ ] User stays logged in across app restarts
- [ ] Clear error for incorrect credentials

**US-AUTH-004: Token Management**
As an authenticated user, I want my session to persist so that I don't have to re-login constantly.

Acceptance Criteria:
- [ ] Access token stored securely
- [ ] Refresh token stored securely
- [ ] Token auto-refresh before expiration (1hr access, 30d refresh)
- [ ] 401 responses trigger token refresh
- [ ] Failed refresh triggers logout

**US-AUTH-005: Logout**
As a user, I want to log out so that I can secure my account.

Acceptance Criteria:
- [ ] Cognito signOut called
- [ ] Local tokens cleared
- [ ] User returned to login screen
- [ ] All user state reset

---

## Functional Requirements

What this feature DOES:
- [x] Provides email/password registration via Cognito
- [x] Implements 6-digit email verification flow
- [x] Stores JWT tokens securely using Expo SecureStore
- [x] Manages token refresh lifecycle
- [x] Validates password against Cognito requirements
- [x] Handles Cognito error codes with user-friendly messages

What this feature does NOT do:
- ❌ Phone/SMS authentication (not in client scope)
- ❌ Social login (Apple/Google/Facebook) - future enhancement
- ❌ Biometric authentication - future enhancement
- ❌ Password reset flow - future enhancement

---

## API Flow (Cognito SDK)

### Sign Up Flow
```
1. User fills: email, password, firstName, lastName
2. Call: userPool.signUp(email, password, attributes)
3. Cognito sends 6-digit code to email
4. User enters code
5. Call: cognitoUser.confirmRegistration(code)
6. Success → User can now login
```

### Login Flow
```
1. User enters: email, password
2. Call: cognitoUser.authenticateUser(authDetails)
3. On success: receive accessToken, idToken, refreshToken
4. Store tokens via TokenManager
5. Navigate to authenticated state
```

### Token Refresh Flow
```
1. API returns 401 OR token expires
2. Call: cognitoUser.refreshSession(refreshToken)
3. Receive new accessToken, idToken
4. Update stored tokens
5. Retry failed request
```

---

## Error Mapping

| Cognito Error | User Message |
|---------------|--------------|
| `UsernameExistsException` | "This email is already registered" |
| `InvalidPasswordException` | "Password doesn't meet requirements" |
| `UserNotConfirmedException` | "Please verify your email first" |
| `NotAuthorizedException` | "Incorrect email or password" |
| `CodeMismatchException` | "Invalid verification code" |
| `ExpiredCodeException` | "Verification code expired. Request a new one." |
| `LimitExceededException` | "Too many attempts. Please wait and try again." |
| `UserNotFoundException` | "No account found with this email" |

---

## Data Model

Entities involved:
- **TokenManager** - Secure token storage (SecureStore/AsyncStorage)
- **AuthService** - Cognito API operations

Fields stored:
| Storage Key | Value | Location |
|-------------|-------|----------|
| `abby_auth_token` | JWT access token | SecureStore |
| `abby_refresh_token` | Refresh token | SecureStore |

---

## UI Components (Already Built)

| Screen | Purpose | Status |
|--------|---------|--------|
| LoginScreen | Choose sign in or sign up | ✅ Built |
| NameScreen | Collect first/last name (signup) | ✅ Built |
| EmailScreen | Collect email address | ✅ Built |
| PasswordScreen | Collect password with validation | ✅ Built |
| VerificationCodeScreen | Enter 6-digit email code | ✅ Built |

---

## Implementation Tasks

### Setup
- [ ] TASK-001: Install `amazon-cognito-identity-js` package
- [ ] TASK-002: Create `CognitoConfig.ts` with pool configuration

### Core Authentication
- [ ] TASK-003: Implement `signup()` with real Cognito SignUp
- [ ] TASK-004: Implement `verify()` with ConfirmSignUp
- [ ] TASK-005: Implement `login()` with AuthenticateUser
- [ ] TASK-006: Implement `logout()` with SignOut + clear tokens
- [ ] TASK-007: Implement `refreshToken()` with RefreshSession

### Error Handling
- [ ] TASK-008: Create error mapping utility for Cognito errors
- [ ] TASK-009: Add user-friendly error display in screens

### Token Management
- [ ] TASK-010: Add auto-refresh interceptor for 401 responses
- [ ] TASK-011: Check token expiry on app launch

### Testing
- [ ] TASK-012: Test signup → verify → login flow
- [ ] TASK-013: Test token persistence across app restarts
- [ ] TASK-014: Test error scenarios (wrong password, expired code)

---

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add `amazon-cognito-identity-js` |
| `src/services/CognitoConfig.ts` | NEW - Pool configuration |
| `src/services/AuthService.ts` | Replace stubs with real Cognito calls |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Email already registered | Show error, suggest login |
| Verification code expired | Allow resend code |
| Wrong password 5 times | Show rate limit message |
| No internet connection | Show offline error |
| Token refresh fails | Logout user, return to login |

---

## Testing Checklist

- [ ] Sign up with new email works
- [ ] Verification code received and accepted
- [ ] Login with correct credentials works
- [ ] Login with wrong password shows error
- [ ] Token persists across app restart
- [ ] Logout clears all tokens
- [ ] Protected API calls include Bearer token

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `amazon-cognito-identity-js` | ^6.x | Cognito SDK |
| `expo-secure-store` | (existing) | Token storage |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-01 | Created spec - Cognito email/password auth |
