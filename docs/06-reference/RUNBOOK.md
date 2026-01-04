# ABBY Runbook

> **Client:** Manuel Negreiro
> **Project:** ABBY (The Anti-Dating App)
> Operational procedures and troubleshooting for the ABBY iOS app

---

## 🔴 CRITICAL: Worktree Verification (RUN FIRST)

**Before ANY work, verify you're in the correct worktree:**

```bash
# Must show "client-api-integration"
git branch --show-current

# Must show "/abby-client-api"
git rev-parse --show-toplevel | grep -o "abby-client-api" && echo "✅ CORRECT" || echo "❌ WRONG WORKTREE!"

# Quick verification
pwd | grep -q "abby-client-api" && echo "✅ Correct" || echo "❌ Go to /abby-client-api"
```

| Worktree | Branch | Voice Service | Purpose |
|----------|--------|---------------|---------|
| `/abby` | `main` | AbbyAgent.ts (ElevenLabs) | ❌ LEGACY |
| `/abby-client-api` | `client-api-integration` | AbbyRealtimeService.ts (OpenAI) | ✅ ACTIVE |

**NEVER copy files from `/abby` to `/abby-client-api` - the service imports are different!**

**If you're in `/abby`, STOP and run:**
```bash
cd /Users/rodericandrews/_PAI/projects/abby-client-api
```

---

## Verification Commands

Run these after ANY changes to auth, API, or environment:

### App Builds and Runs
```bash
# Kill stale Metro, rebuild from correct worktree
pkill -f "expo\|metro" 2>/dev/null
cd /Users/rodericandrews/_PAI/projects/abby-client-api
npx expo run:ios

# Expected log: "[App] No existing auth, showing login"
# NOT: "[AbbyAgent] Starting session with agent" (wrong worktree!)
```

### TypeScript Compiles
```bash
cd /Users/rodericandrews/_PAI/projects/abby-client-api
npx tsc --noEmit 2>&1 | head -20
# Should show no errors for new screens
```

### Client API is Reachable
```bash
curl -s https://dev.api.myaimatchmaker.ai/docs | head -c 100
# Should return HTML, not 404 or connection error
```

### Cognito Config Valid
```bash
# AWS Cognito values (for reference, not secrets)
echo "User Pool ID: us-east-1_l3JxaWpl5"
echo "Client ID: 2ljj7mif1k7jjc2ajiq676fhm1"
```

### Cognito Debugging (2026-01-01 Learning)

**Key Insight:** If the same error (`InvalidParameterException`) occurs for ALL parameter variations, the issue is likely the CREDENTIALS, not the parameters.

```bash
# WRONG - only proves file exists (File Existence Fallacy)
cat src/services/CognitoConfig.ts | grep UserPoolId  # "Found it! ✅"

# RIGHT - proves credentials WORK at runtime
# Ask Nathan to verify in AWS Console:
# 1. Pool ID exists and is correct
# 2. Client ID belongs to that pool
# 3. Pool has correct attributes configured (email, name)
```

**When console logs aren't visible (device testing):**

Add `Alert.alert()` in App.tsx to display params on screen:
```typescript
import { Alert } from 'react-native';

// In handlePasswordComplete or signup handler:
if (__DEV__) {
  Alert.alert(
    'DEBUG: Signup Params',
    `Email: ${email}\nName: "${name}"\nPassword length: ${password?.length}`,
    [{ text: 'OK' }]
  );
}
```

**Tested Parameter Combinations (all returned InvalidParameterException):**
1. email + given_name + family_name
2. email + given_name only
3. email only (minimal)
4. email + 'name' attribute
5. Generated username vs email as username

**Conclusion:** When all variations fail with same generic error, stop testing parameters and verify the Pool ID / Client ID are correct with the backend owner.

### Security Hardening Verification (2026-01-02)

**After any security-related code changes, run these to verify fixes:**

```bash
# 1. TypeScript compiles clean (catches type errors from changes)
npx tsc --noEmit 2>&1 | head -20
# Expected: No output (clean)

# 2. All tests pass (catches regressions)
npm test
# Expected: 399 tests passing

# 3. Search for security fixes applied
grep -l "maxLength" src/components/screens/*.tsx | wc -l
# Expected: 6+ files (EmailScreen, NameScreen, PasswordScreen, etc.)

# 4. Verify console logs are gated
grep -rn "console\." src/ | grep -v "__DEV__" | grep -v "node_modules" | head -20
# Expected: No ungated console statements

# 5. Verify onboarding persistence integrated
grep "loadOnboarding\|saveOnboarding" App.tsx
# Expected: Multiple matches for load/save calls
```

**Security Fixes Applied (2026-01-02):**
| Fix | Files | Purpose |
|-----|-------|---------|
| maxLength on TextInputs | 6 screens | Prevent buffer overflow |
| `__DEV__` guards | 5 files | No logs in production |
| Onboarding persistence | App.tsx, useOnboardingStore.ts | Crash recovery |

### Glass UI Typography Fix (2026-01-02)

**Issue:** Text looks heavy with ugly shadows on glass/blur backgrounds.
**Root Cause:** `Typography.tsx` has built-in `textShadow` designed for shader backgrounds.

```bash
# Find shadow definitions in Typography
grep -n "textShadow" src/components/ui/Typography.tsx
# Output: textShadowColor: 'rgba(0, 0, 0, 0.5)', offset: {0,2}, radius: 4

# Override in component styles:
textShadowColor: 'transparent',
```

**Font Size Guidelines for Glass:**
| Context | Shader BG | Glass BG |
|---------|-----------|----------|
| Detail name | 28px | 22px |
| Section title | 22px | 18px |
| Card title | 18px | 16px |
| Body text | 16px | 15px |

---

### API Field Mapping Verification (2026-01-02)

**CRITICAL:** Verify API response fields match code expectations BEFORE claiming integration works.

```bash
# 1. Check Swagger docs for field names (snake_case vs camelCase)
open https://dev.api.myaimatchmaker.ai/docs#/

# 2. Verify MatchCandidate API schema (with auth token)
TOKEN="<from_login>"
curl -s https://dev.api.myaimatchmaker.ai/v1/matches/candidates \
  -H "Authorization: Bearer $TOKEN" | jq '.candidates[0] | keys'
# Expected: ["user_id", "display_name", "compatibility_score", "photos", ...]

# 3. Verify code has transformer for snake_case → camelCase
grep -A10 "transformCandidate" src/components/screens/MatchesScreen.tsx
# Should show: id: raw.user_id, name: raw.display_name, etc.

# 4. Check RawMatchCandidate interface matches API
grep -A10 "interface RawMatchCandidate" src/components/screens/MatchesScreen.tsx
# Fields should be: user_id, display_name, compatibility_score (snake_case)

# 5. Check internal MatchCandidate interface
grep -A10 "interface MatchCandidate" src/components/screens/MatchesScreen.tsx
# Fields should be: id, name, compatibilityScore (camelCase)
```

**Static vs Runtime Verification:**
| What to Check | Static (❌ Insufficient) | Runtime (✅ Correct) |
|---------------|--------------------------|----------------------|
| Interface exists | `grep "interface"` | curl API, compare fields |
| Fetch present | `grep "secureFetch"` | Verify response parsing |
| Types compile | `npx tsc --noEmit` | App displays real data |

---

### API Integration Verification (2026-01-02)

**Run these to verify full API integration is working:**

```bash
# 1. Check API is reachable (should return JSON, not error)
curl -s https://dev.api.myaimatchmaker.ai/
# Expected: {"message":"Missing Authentication Token"}

# 2. Check /v1 endpoints respond (401 = good, 500 = backend broken)
curl -s https://dev.api.myaimatchmaker.ai/v1/me
# Expected: {"message":"Unauthorized"} (needs auth)
# BAD: {"message":"Internal server error"} (backend Lambda broken)

# 3. Check voice availability
curl -s https://dev.api.myaimatchmaker.ai/v1/abby/realtime/available
# Expected: 401 or 200 with availability status

# 4. Check TTS endpoint exists
curl -s -X POST https://dev.api.myaimatchmaker.ai/v1/abby/tts
# Expected: 401 (exists but needs auth)

# 5. Check questions endpoint
curl -s https://dev.api.myaimatchmaker.ai/v1/questions/categories
# Expected: 401 (exists but needs auth)
```

**With Authentication (requires valid token):**
```bash
# Get token from app login or use test account
TOKEN="<access_token_from_login>"

# Test authenticated endpoint
curl -s https://dev.api.myaimatchmaker.ai/v1/me \
  -H "Authorization: Bearer $TOKEN"
# Expected: User profile JSON
# BAD: 500 = PostConfirmation Lambda failed, user not in DB
```

**If 500 errors with valid token:**
The issue is NOT frontend. Backend team must:
1. Check PostConfirmation Lambda CloudWatch logs
2. Fix IAM permissions for database writes
3. Verify user record exists in PostgreSQL

---

### Fragile Code Detection (2026-01-02)

**Run these BEFORE any PR or major changes to catch regression-prone code:**

```bash
# 1. Find duplicated constants (potential fragility)
grep -rn "0.35.*0.55.*0.75" src/ --include="*.ts" --include="*.tsx"
# Expected: Only layout.ts and files that import from it

# 2. Find magic numbers in modulo operations
grep -rn "% [0-9]" src/ --include="*.ts" --include="*.tsx"
# Expected: Should use named constants like TOTAL_SHADERS

# 3. Find parseInt without radix (octal parsing bug)
grep -rn "parseInt([^,)]*)" src/ --include="*.ts" --include="*.tsx" | grep -v ", 10)"
# Expected: Empty (all parseInt should have radix 10)

# 4. Find cross-store calls inside set() (circular update risk)
grep -B5 -A5 "getState()" src/store/*.ts | grep -A5 "set("
# Review for setTimeout wrapper around cross-store calls

# 5. Type check all changes
npx tsc --noEmit 2>&1 | head -30
# Expected: No errors

# 6. Run all tests
npm test
# Expected: 399 tests passing
```

**Centralized Constants (SINGLE SOURCE OF TRUTH):**

| Constant | Location | Used By |
|----------|----------|---------|
| SHEET_SNAP_POINTS | `src/constants/layout.ts` | CoachIntroScreen, CoachScreen, useDraggableSheet |
| SHEET_DEFAULT_SNAP | `src/constants/layout.ts` | Same |
| TOTAL_SHADERS | `src/constants/backgroundMap.ts` | InterviewScreen |

**If you add new shared values:** Add to `src/constants/` and document here.

---

### Major Cleanup Verification (2026-01-02)

**Run these AFTER removing redundant files to verify nothing broke:**

```bash
# 1. TypeScript compiles (catches broken imports)
npx tsc --noEmit 2>&1 | head -20
# Expected: No errors (0 output lines)

# 2. All tests pass (404 tests at time of cleanup)
npm test
# Expected: Test Suites: 11 passed, Tests: 399 passed

# 3. iOS build succeeds
npx expo run:ios
# Expected: "Build Succeeded" + app launches on simulator

# 4. Verify removed files are actually gone
ls App.agent.tsx App.demo.tsx 2>/dev/null && echo "❌ Still exists!" || echo "✅ Cleaned"
ls src/components/layers/LiquidGlass.tsx 2>/dev/null && echo "❌ Still exists!" || echo "✅ Cleaned"
ls src/components/layers/VibeMatrix.tsx 2>/dev/null && echo "❌ Still exists!" || echo "✅ Cleaned"
```

**Cleanup Session (2026-01-02) - Files Removed (20 total):**

| Category | Files Removed | Files Kept |
|----------|---------------|------------|
| App Variants | 8 (agent, demo, dev, liquid, orb, simple, transition-test, vibe-test) | App.tsx |
| LiquidGlass | 9 (LiquidGlass.tsx, 2-3, 5-10) | LiquidGlass4.tsx (used by AbbyOrb) |
| VibeMatrix | 4 (VibeMatrix, Simple, Animated layer, Parametric) | VibeMatrixAnimated.tsx |

**Critical Fix Applied:**
```typescript
// VibeMatrixAnimated.tsx - Fixed broken import
// BEFORE: import { VIBE_MATRIX_SHADER } from '../../shaders/vibeMatrix';
// AFTER:
import { getShaderById } from '../../shaders/factory/registryV2';
const VIBE_MATRIX_SHADER = getShaderById(0).source;
```

**ElevenLabsProvider Removal:**
- App.tsx no longer has conditional ElevenLabsProvider import/wrapper
- Voice handled by AbbyRealtimeService (client's OpenAI Realtime API)

---

## Project Info

### Google Drive Folders

| Folder | ID |
|--------|-----|
| Root (ABBY) | `1xKaC62ap5_gN2ZJo0MMiSfIin933Y-TH` |
| Client Intake | `1cm5pNEaLcDXRjAnaMzgmW7wubojT9CzM` |
| 00-OVERVIEW | `1Nm4gz5AQ30eayxRjMSWoM_lDIUiu47yU` |
| 01-INTAKE | `1Ss3z6NZy6QeMHa-KhmCr-XX8A_8ltF1v` |
| 02-PROPOSALS | `1FYd8FFOMMsXBRvxbwNyKQnyb8yQlX8Ez` |
| 03-SPECS | `1BUECvMqtlCBT9NfBg5pBPTWe3dSoW7pg` |
| 04-WORK | `1e9V8Seo1T7Lk7ZAXKDFMtnc2XojN8AOa` |
| 05-REPORTS | `1nHX_xjtcq7y2jBprgavmIIEyevG4dHAd` |
| 06-DELIVERED | `1JnB6HCp0rswJeSYBN12M3hBi9Vk-VCg6` |
| _INTERNAL | `1BPbvl0RENoQyvVldx8QU33E0AJ4M6cW4` |

### Key Contacts

| Role | Name | Responsibility |
|------|------|----------------|
| Client / Decision Maker | Manuel Negreiro | Approvals, direction |
| Client Contact | Brent | Communication |
| Frontend + Integration | Diiiploy | App development |
| Backend / AWS | Nathan | Heavy infrastructure, APIs, S3 |

### Third-Party Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| AWS Cognito | Authentication | ✅ Working (frontend) |
| OpenAI Realtime | Voice conversation | 🟡 Demo mode (API needs testing) |
| Client API | Backend (dev.api.myaimatchmaker.ai) | 🟡 401 on /v1/* (needs auth), /docs broken |
| Sentry | Error tracking | To configure |

### Current State (2026-01-02)

**Branch:** `client-api-integration` in `/abby-client-api` worktree

**Auth Flow:**
- SIGNUP: Login → Name → Email → Password → Email Verification → Main App
- SIGNIN: Login → Email → Password → Main App

**What's Working:**
- ✅ LoginScreen displays with VibeMatrix shader background
- ✅ Auth flow UI navigates between screens
- ✅ **Real Cognito signup** with amazon-cognito-identity-js SDK
- ✅ **Email verification** - codes delivered, verification works
- ✅ **Login** - returns valid JWT tokens (Access + ID)
- ✅ Metro bundle compiles (3277+ modules)
- ✅ iOS build succeeds on simulator
- ✅ **Security layer** - secureFetch with timeouts, input validation
- ✅ **399 tests passing** (11 test suites)
- ✅ Console logs gated with `__DEV__`

**API Status (2026-01-02):**
| Endpoint | Status |
|----------|--------|
| `/docs` | 500 (still broken) |
| `/` root | 200 (needs auth) |
| `/v1/*` | 401 (working, needs auth) |

**Voice (AbbyRealtimeService):**
- ✅ Service implemented with demo fallback
- 🟡 Runs in demo mode (API availability check fails)
- Next: Test real session creation when API is responsive

**Test Account:**
```
Email:    rodericandrews+4@gmail.com
Password: TestPass123!
Status:   Verified ✅, Login works ✅
```

**Recent Work (2026-01-02):**
- **Major cleanup**: Removed 20 redundant files (App variants, LiquidGlass, VibeMatrix)
- Fixed shader import in VibeMatrixAnimated.tsx (getShaderById from registryV2)
- Removed ElevenLabsProvider (voice now uses client's OpenAI Realtime API)
- Autonomous improvement session: security, tests, code quality
- Added `secureFetch.ts` with timeouts and error sanitization
- Added input validation utilities
- Test coverage: 246 → 399 tests (11 suites)
- All console statements gated with `__DEV__`
- Updated stale documentation (INDEX, specs)

**Next Steps:**
1. Test voice session creation with authenticated token
2. Implement WebSocket/WebRTC for real-time audio
3. Extract audio amplitude for orb animation

### Performance Targets

| Metric | Target |
|--------|--------|
| App Launch | < 3 seconds |
| Frame Rate | 60fps sustained |
| Voice Latency | < 500ms response start |
| Memory Usage | < 200MB normal operation |
| Battery Impact | < 10%/10min active use |

---

## Development Startup

### TL;DR - Two Options

```bash
# Option 1: Single command (builds + runs + starts Metro)
npx expo run:ios

# Option 2: Separate Metro (faster for rebuilds)
npm start              # Terminal 1 - Metro bundler
npx expo run:ios       # Terminal 2 - Build & run app
```

### Port: 8081

Metro runs on `http://localhost:8081`. If you see "Could not connect to development server":

```bash
# Kill stale processes
pkill -f metro
pkill -f "expo start"
lsof -ti:8081 | xargs kill -9  # Nuclear option

# Then restart
npm start
```

### Why Dev Build (not Expo Go)?

**Skia shaders require native compilation.** Expo Go doesn't include `@shopify/react-native-skia`.

| Command | Mode | Skia | Use |
|---------|------|------|-----|
| `npx expo run:ios` | Dev Build | ✅ | **Always use this** |
| `npm start` | Metro only | - | Must run app separately |
| `expo start` | Expo Go | ❌ | Never for ABBY |

**Error:** White screen or Skia crash → You ran `expo start` instead of `expo run:ios`

---

## Common Issues & Fixes

### 1. "react-native-reanimated is not installed"

**Symptom:** App crashes on launch with reanimated error

**Root Cause:** CocoaPods not installed after npm install

**Fix:**
```bash
cd ios && pod install && cd ..
npm run ios
```

---

### 2. WorkletsError Version Mismatch

**Symptom:** `WorkletsError: [Reanimated] The JavaScript and native parts of Worklets are incompatible`

**Root Cause:** JS version (0.7.x) doesn't match native (0.5.x)

**Fix:**
```bash
npm install react-native-worklets@0.5.1 --legacy-peer-deps
cd ios && pod install && cd ..
rm -rf ~/Library/Developer/Xcode/DerivedData/Abby-*
npm run ios
```

---

### 3. "No script URL provided"

**Symptom:** Metro bundler crashed, app shows "No script URL" error

**Root Cause:** Metro process died or cache corrupted

**Fix:**
```bash
pkill -f "expo"
pkill -f "metro"
rm -rf node_modules/.cache/metro
npx expo start --clear --ios
```

---

### 4. Voice Demo Mode (OpenAI Realtime API)

**Current Status:** Voice runs in demo mode - API availability check fails.

**AbbyRealtimeService behavior:**
1. Checks `/v1/abby/realtime/available`
2. If unavailable → enters demo mode with simulated responses
3. If available → creates session via `/v1/abby/realtime/session`

**To test real API:**
```bash
# Get token first (login via app or use test account)
curl -X GET https://dev.api.myaimatchmaker.ai/v1/abby/realtime/available \
  -H "Authorization: Bearer <token>"
```

**Demo mode indicators:**
- `[AbbyRealtime] 🎭 Starting demo mode` in logs
- `isDemoMode: true` in useAbbyAgent hook
- Simulated typing delays (1.5-3 seconds)

---

### 4b. Legacy: ElevenLabs Issues (ONLY /abby worktree)

> **Note:** These issues only apply to the LEGACY `/abby` worktree (main branch).
> The active `/abby-client-api` worktree uses OpenAI Realtime API, not ElevenLabs.

**Historical reference only.** If you're seeing ElevenLabs errors, you're in the wrong worktree.

---

### 5. Xcode Database Locked

**Symptom:** `error: unable to attach DB: error: accessing build database ... database is locked`

**Fix:**
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/Abby-*
npm run ios
```

---

### 6. Skia Header Build Errors

**Symptom:** `'RNSkiaModule.h' file not found` or similar Skia errors

**Fix:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod cache clean --all
pod install
cd ..
npm run ios
```

---

## Dependency Version Matrix

These versions are tested and work together:

| Package | Version | Notes |
|---------|---------|-------|
| expo | ~54.0.30 | Must be 54.x |
| @shopify/react-native-skia | ^1.x | Shader rendering |
| amazon-cognito-identity-js | ^6.x | Cognito auth |
| react-native-reanimated | ^3.x | Animations |
| zustand | ^4.x | State management |

---

## Voice Session Lifecycle (OpenAI Realtime)

```
┌─────────────────────────────────────────────────────────┐
│              AbbyRealtimeService Flow                    │
├─────────────────────────────────────────────────────────┤
│  1. startConversation() called                          │
│  2. checkAvailability() → GET /abby/realtime/available  │
│  3. If unavailable → startDemoMode()                    │
│  4. If available:                                       │
│     - Get token from TokenManager                       │
│     - POST /abby/realtime/session                       │
│     - TODO: Establish WebSocket/WebRTC                  │
│  5. onConnect fires → conversation active               │
│  ...conversation happens...                             │
│  6. endConversation() called                            │
│  7. POST /abby/session/{id}/end                        │
│  8. Cleanup state                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Setup

### Required Configuration

No `.env.local` needed for client-api-integration. All config is in:
- `src/services/CognitoConfig.ts` - Cognito credentials
- `src/services/AbbyRealtimeService.ts` - API base URL

### API Base URL

```typescript
const API_BASE_URL = 'https://dev.api.myaimatchmaker.ai/v1';
```

---

## Git Workflow

```bash
# Standard commit
git add .
git commit -m "fix: description"
git push origin main

# Update staging
git push origin main:staging

# Update production
git push origin main:production
```

---

## Useful Commands

```bash
# Clean everything
rm -rf node_modules ios/Pods ios/build
npm install
cd ios && pod install && cd ..

# Check for outdated packages
npx expo install --check

# Run tests
npm test

# TypeScript check
npx tsc --noEmit
```

---

## Demo Flow Known Issues (2024-12-23 Audit)

### CRITICAL - Blocks Demo Completion

| # | Issue | File:Line | Status |
|---|-------|-----------|--------|
| 1 | ~~COACH state unreachable~~ | `RevealScreen.tsx:57` | ✅ FIXED - Added "Meet Your Coach" button |
| 2 | ~~Shader progression broken~~ | `InterviewScreen.tsx` | ❌ FALSE POSITIVE - useEffect at line 111-115 calls onBackgroundChange correctly |
| 3 | ~~Vibe state desync~~ | `SearchingScreen.tsx:66` | ❌ FALSE POSITIVE - MATCH_FOUND is valid AppState, intentional visual anticipation |

### HIGH - UX Issues

| # | Issue | File:Line | Status |
|---|-------|-----------|--------|
| 4 | ~~endConversation() may hang~~ | `CoachIntroScreen.tsx:173` | ✅ FIXED - Added 2s timeout race |

### MEDIUM - Visual Inconsistency

| # | Issue | File:Line | Fix |
|---|-------|-----------|-----|
| 5 | Mute icon size: CoachIntroScreen=18px, CoachScreen=11px | Both screens | Unify to 11px |
| 6 | RevealScreen missing `onBackgroundChange` prop | `RevealScreen.tsx` | Add prop |
| 7 | Two parallel vibe stores | `useVibeStore.ts` | Remove unused |

### LOW - Code Cleanup

| # | Issue | File:Line | Fix |
|---|-------|-----------|-----|
| 8 | OnboardingScreen is dead code | `OnboardingScreen.tsx` | Delete |
| 9 | SettingsScreen is dead code | `SettingsScreen.tsx` | Delete |
| 10 | INTERVIEW_DEEP/SPICY unused | `useVibeController.ts` | Delete or use |

---

## Demo State Machine

**Flow (FIXED 2024-12-23):**
```
COACH_INTRO → INTERVIEW → SEARCHING → MATCH → PAYMENT → REVEAL → COACH ✅
```

User can now tap "Meet Your Coach" on RevealScreen to advance to COACH state.
"Start Over (Demo)" still available as secondary action to reset.

**Key Files:**
- `useDemoStore.ts` - STATE_ORDER array (line 91-99)
- `App.demo.tsx` - renderScreen() switch (line 133-151)
- Each screen calls `advance()` or `reset()`

---

## Key Parameters (DON'T CHANGE)

```typescript
// Modal height - shows conversation
const DEFAULT_SNAP = 0.55;  // 55%

// Shader sequence for interview
const BACKGROUND_SEQUENCE = [1,2,3,4,5,6,7,8,9,10];

// State order
const STATE_ORDER = ['COACH_INTRO','INTERVIEW','SEARCHING','MATCH','PAYMENT','REVEAL','COACH'];
```

---

## Menu Screens Demo Mode (2026-01-02)

Menu screens accessible from hamburger menu now have demo mode fallbacks:

| Screen | Demo Behavior | Data |
|--------|---------------|------|
| **ProfileScreen** | Uses local onboarding store | User's own data from onboarding |
| **PhotosScreen** | Shows 3 Unsplash photos | DEMO_PHOTOS constant |
| **MatchesScreen** | Shows 3 demo matches | DEMO_MATCHES constant (Sarah, Emma, Jessica) |
| **SettingsScreen** | Works fully offline | Local AsyncStorage |

**Trigger:** When `TokenManager.getToken()` returns null (no auth token).

**Code Locations:**
- `PhotosScreen.tsx:73-78` - Demo mode fallback
- `MatchesScreen.tsx:78-83` - Demo mode fallback

**Testing:** Navigate via hamburger menu when in demo mode (secret nav to skip auth).

---

## Screen Audit (2026-01-02)

**Total Screens:** 26 files
**Accessible:** 26 screens
**Orphaned:** 0 (PhoneNumberScreen, VerificationCodeScreen, LoadingScreen removed)

| Category | Screens | Count |
|----------|---------|-------|
| Auth Flow | Login, SignIn, Name, Email, Password, EmailVerification | 6 |
| Onboarding | DOB, Permissions, BasicsGender, BasicsPreferences, Ethnicity, EthnicityPreference, BasicsRelationship, Smoking, BasicsLocation | 9 |
| Demo Flow | CoachIntro, Interview, Searching, Match, Payment, Reveal, Coach | 7 |
| **Menu** | **Profile, Photos, Matches, Settings** | **4** |

**ProfileScreen wired up:** Added to hamburger menu via `onProfilePress` callback.

---

*Last Updated: 2026-01-04*
