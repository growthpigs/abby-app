# ABBY - Active Tasks

**Last Updated:** 2026-01-07
**Status:** Auth Flow Implementation Complete - Awaiting API Integration

---

## Current Sprint: Authentication & Onboarding Flow

### ✅ COMPLETED (Uncommitted)
1. **Complete Auth State Machine** - LOGIN → PHONE → VERIFICATION → EMAIL → EMAIL_VERIFICATION → NAME → DOB → ONBOARDING → MAIN APP
2. **Auth Screens**:
   - LoginScreen (Create Account / Sign In)
   - PhoneNumberScreen (Country code + phone number)
   - VerificationCodeScreen (SMS verification)
   - EmailScreen (Email entry)
   - EmailVerificationScreen (Email verification code)
3. **UI Components**:
   - CodeInput (4-digit verification code input with haptic feedback)
   - GlassInput (reusable form input with glass effect)
   - FormScreen (base screen layout for glass overlay)
4. **Services**:
   - AuthService.ts (API client - stubbed, awaiting real API)
   - TokenManager.ts (JWT token management)
5. **State Management**:
   - useOnboardingStore (Zustand - tracks all form data across screens)
   - useSettingsStore (app-level settings)
   - useDemoStore (demo flow navigation)
   - useVibeController (background vibe changes)
6. **Secret Navigation** (for testing):
   - Bottom-left corner: Go to previous screen
   - Bottom-right corner: Go to next screen
   - Allows quick jumping through entire flow

---

## 🚨 BLOCKING ISSUES

### 1. API Integration - CRITICAL BLOCKER
- **Status**: BLOCKED waiting on Nathan's credentials
- **Issue**: `AuthService.ts` has real API calls commented out, using mock responses
- **Root Cause**: Test credentials (engineer2 / DevPass2025@) don't exist in Nathan's Cognito pool
- **What We Need**:
  - Either valid test account in Cognito pool
  - OR admin credentials to create test account
  - OR Nathan tests the auth flow himself
- **Email Sent**: ✅ Jan 7 - waiting for response from Nathan (nathan.negreiro@gmail.com)

### 2. Missing Question Schema File
- **File**: `docs/data/questions-schema.ts`
- **Issue**: Tests expect this file; InterviewScreen needs it for question flow
- **Impact**: Interview screen can't load questions without this schema
- **Resolution**: Create the file with 150 data points or use existing questions.json as basis

---

## 📋 IMMEDIATE NEXT STEPS (In Priority Order)

### OPTION 1: Commit Current Work First ⭐ (Recommended)
This auth flow is complete and functional. Before proceeding:
```bash
git add -A
git commit -m "feat(auth): complete auth flow with phone/email verification

- Add full auth state machine (LOGIN → EMAIL_VERIFICATION → ONBOARDING)
- Create Auth screens: LoginScreen, PhoneNumberScreen, VerificationCodeScreen, EmailScreen, EmailVerificationScreen
- Create UI components: CodeInput, GlassInput, FormScreen
- Implement AuthService (stubbed) and TokenManager (JWT management)
- Add useOnboardingStore for form data persistence
- Implement secret navigation (bottom corners) for testing all screens
- All screens integrated into App.tsx routing
- Tests passing (except pre-existing questions-schema.ts issue)
"
```

### OPTION 2: Create Missing Question Schema
The interview-flow.test.ts expects `docs/data/questions-schema.ts` with:
- ALL_DATA_POINTS array (150 questions)
- DataPoint interface
- VibeShift type definition

We can:
1. Extract from existing `src/data/questions.json`
2. Or create minimal schema to unblock tests

### OPTION 3: Wait for Nathan's Response
Pending his reply with valid Cognito credentials to uncomment the real API calls in AuthService.ts

---

## 🔗 KEY BLOCKERS TO RESOLVE

| Blocker | Owner | Status | Impact | Next Action |
|---------|-------|--------|--------|------------|
| API Credentials | Nathan | Waiting | Can't test real auth | Email sent, awaiting response |
| Question Schema | Chi | Not started | Can't test interview | Create file from questions.json |
| Uncommitted Work | Chi | Ready | None | Commit after review |

---

## Architecture Notes

**Auth Flow State Machine** (in App.tsx):
- Managed via `authState` useState
- Transitions controlled by screen handlers
- SECRET NAVIGATION for testing (44x44 corners - back/forward)
- All form data persists in Zustand stores across screen transitions

**Error Handling**:
- AuthService.ts notes API blockers: POST /auth/signup returns 401 (should be public)
- See `docs/06-reference/API-TEST-RESULTS.md` for full API analysis

**Next Session Context**:
- If Nathan responds: Uncomment real API calls and test auth flow
- If not: Create question schema to unblock interview testing
- Commit this work regardless (it's complete and tested)

