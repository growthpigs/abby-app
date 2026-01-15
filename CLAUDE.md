# ABBY - Project Instructions for Claude Code

> **The Anti-Dating App** | iOS React Native (Expo)

---

## 🔴 HOTSPOT MODE - PHYSICAL DEVICE BUILDS (READ FIRST!)

**When Roderic is using iPhone hotspot (no WiFi):**

The phone IS the network router - it CANNOT connect back to Metro bundler on Mac!

**Error you'll see:** `No script URL provided. Make sure the packager is running`

**SOLUTION - Create standalone build with embedded JS:**
```bash
# Option 1: EAS Build (cloud - takes ~15min)
eas build --platform ios --profile preview

# Option 2: Local archive build (faster, requires Xcode setup)
npx expo run:ios --device --configuration Release
```

**Why dev builds fail on hotspot:**
- Dev builds expect: Phone → Connect to Mac:8081 → Get JS bundle
- On hotspot: Phone = Router → Can't connect to itself as client

**When WiFi returns:** Use normal `npx expo run:ios --device` for faster iteration.

---

## 🚀 QUICK START (Copy-Paste Ready)

```bash
# Navigate to project
cd /Users/rodericandrews/_PAI/projects/abby-client-api

# Switch to demo branch
git checkout test-jan2-animation

# Build and run on iOS
npx expo run:ios
```

**Full Path:** `/Users/rodericandrews/_PAI/projects/abby-client-api` (note: ends with `-api`)

---

## ⚠️ VIBEMATRIX ANIMATION - STATUS (2026-01-13)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ANIMATION NOW WORKING ON: client-api-integration (with fixes applied)       │
│                                                                              │
│  ✅ Animation runs (not static anymore)                                       │
│  ⚠️  Speed slower than original                                               │
│  ⚠️  Directional bias toward top-left                                         │
│                                                                              │
│  BUILD: npx expo run:ios                                                      │
│  DEBUG: Tap 🎨 → SHADER PRESETS → switch textures (0-18)                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Fixes Applied (2026-01-13)

1. **useDerivedValue** - Removed dependency array (GitHub Issue #2640)
2. **Canvas mode** - Added `mode="continuous"` for 60fps
3. **Speed** - Increased 3x in domainWarp.ts

### Remaining Issues

- Animation slower than original handwritten shaders
- Drifts toward top-left corner
- May need to restore original G1/G2/G4 shaders for full quality

---

## 🚨 BUILD COMMAND (Dev Build, NOT Expo Go)

```bash
npx expo run:ios
```

**Why dev build?** Skia shaders require native compilation. Expo Go doesn't include `@shopify/react-native-skia`.

| Command | Mode | Skia | Use |
|---------|------|------|-----|
| `npx expo run:ios` | Dev Build | ✅ | **Always use this** |
| `expo start` | Expo Go | ❌ | Never for ABBY |

---

## 🚨 MANDATORY STARTUP CHECKLIST

**Before ANY work, verify these EVERY time:**

```bash
# 1. Confirm correct worktree (MUST be abby-client-api)
pwd  # Should show: /Users/rodericandrews/_PAI/projects/abby-client-api

# 2. For ANIMATION/DEMOS: use test-jan2-animation
git checkout test-jan2-animation

# 3. Confirm NOT in /abby (the legacy worktree)
# If pwd shows /abby without -client-api, STOP and cd to correct location
```

**Service Files (CRITICAL - do NOT copy from /abby):**
- ✅ Use: `AbbyRealtimeService.ts` (OpenAI Realtime API via client backend)
- ❌ NOT: `AbbyAgent.ts` (legacy worktree only)

---

## Branch Status

| Worktree | Branch | Animation | Auth | Keyboard | Use For |
|----------|--------|-----------|------|----------|---------|
| `/abby` | `main` | ❌ | ❌ | ❌ | LEGACY - don't use |
| `/abby-client-api` | `main` | ✅ | ✅ | ✅ | **PRODUCTION - all features working** |
| `/abby-client-api` | `test-jan2-animation` | ✅ | ✅ | ✅ | Testing/development |

---

## Client Backend API

**Base URL:** `https://dev.api.myaimatchmaker.ai`
**API Docs:** https://dev.api.myaimatchmaker.ai/docs#/

### Authentication: AWS Cognito

```
User Pool ID: us-east-1_l3JxaWpl5
Client ID:    2ljj7mif1k7jjc2ajiq676fhm1
Region:       us-east-1
```

**Flow:** SignUp → Email Verification → SignIn → Get Tokens

### Voice: OpenAI Realtime API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/abby/realtime/session` | POST | Create voice session |
| `/v1/abby/session/{id}/end` | POST | End voice session |
| `/v1/abby/realtime/available` | GET | Check API availability |

### Key Endpoints

- **Auth:** `/v1/auth/*` (Cognito)
- **Profile:** `/v1/me`, `/v1/profile/*`
- **Questions:** `/v1/questions/*`, `/v1/answers`
- **Matching:** `/v1/matches/*`
- **Photos:** `/v1/photos/*`

---

## Project Overview

ABBY is a high-end matchmaking app where users interact with an AI entity (Abby), not profiles. The interface is "living" - it breathes, morphs, and reacts like a biological organism.

**Core Metaphor**: "A glass pane floating over a living, bioluminescent ocean."

---

## Requirements (MVP - $5K, 7-14 days)

> Last updated: 2024-12-20 | Status: Approved

### Scope

| Category | MVP | V2 |
|----------|-----|-----|
| VibeMatrix (living shaders) | ✅ | - |
| Abby Persona + Voice | ✅ | - |
| Question Flow (text + voice) | ✅ | - |
| Glass Interface | ✅ | - |
| Basic Orb | ✅ | - |
| Certification/verification | ❌ | ✅ |
| Match flow (bio → payment → reveal) | ❌ | ✅ |
| Premium tiers (Gold/Platinum) | ❌ | ✅ |
| Coach mode | ❌ | ✅ |
| Stripe payments | ❌ | ✅ |

### Timeline

- **Hard Deadline:** 14 days
- **Internal Target:** 7 days
- **Approval:** Client via Brent (~24hr turnaround)

### Budget

- **MVP:** $5K
- **Scope:** Core experience (VibeMatrix + Abby + Questions)

### Success Criteria

1. User can have voice/text conversation with Abby through question flow
2. Living background responds to conversation state with smooth transitions
3. Feels organic and alive, not mechanical
4. Runs smoothly on iOS, maintains 60fps animations
5. Demonstrates core concept for client validation

### Dependencies

- OpenAI Realtime API (client backend integration)
- Existing codebase (shaders in progress)
- Supabase (V2 - mocked for MVP)

### Risks

- Battery optimization for shader performance
- Voice latency during conversation flow
- Question flow completeness (how many of 150 for MVP?)
- State persistence across app sessions

---

## Living Documents (Source of Truth)

| Document | Path | Purpose |
|----------|------|---------|
| PRD | `docs/PRD.md` | Product requirements, user stories, success metrics |
| FSD | `docs/FSD.md` | Technical spec, state machine, shader logic |
| Design System | `docs/DESIGN-SYSTEM.md` | Colors, typography, components, motion |
| Tech Debt | `docs/TECH-DEBT.md` | Fragile patterns, V2 refactoring queue |

### Feature Docs

| Feature | Path | Owner |
|---------|------|-------|
| VibeMatrix | `docs/features/vibematrix.md` | Chi - Background shaders |
| AbbyOrb | `docs/features/abbyorb.md` | CC1 - Orb + voice |

**Rule**: Update these documents as features evolve. One document per system. One file per feature - all work goes in that file.

### Documentation Protocol (PAI System)

1. **Living Documents Only** - Never create new files for existing features. Add to the existing file.
2. **Feature files live in `docs/features/`** - One file per feature (e.g., `vibematrix.md`, `abbyorb.md`)
3. **CLAUDE.md is the table of contents** - Link new docs here so future AIs can find them
4. **On `wrap up`** - Update feature docs with session work, log errors to patterns, update open tasks

---

## Architecture: The "Glass Sandwich"

```
Layer 3 (Z:30) - SemanticOverlay    │ Accessibility targets
Layer 2 (Z:20) - GlassInterface     │ BlurView + all UI
Layer 1 (Z:10) - AbbyOrb            │ Reactive 3D orb
Layer 0 (Z:0)  - VibeMatrix         │ GLSL shader background
```

**Critical**: All layers render simultaneously. No hard cuts. Transitions morph.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Expo SDK 50+ |
| Language | TypeScript |
| Graphics | `@shopify/react-native-skia` |
| Animation | `react-native-reanimated` v3 |
| Blur | `expo-blur` |
| State | `zustand` |
| Platform | iOS only (v1.0) |

---

## File Structure

```
src/
├── components/
│   ├── layers/
│   │   ├── VibeMatrix.tsx      # L0: Shader background
│   │   ├── AbbyOrb.tsx         # L1: The AI orb
│   │   └── GlassInterface.tsx  # L2: Blur container
│   ├── ui/
│   │   ├── GlassCard.tsx
│   │   ├── RichButton.tsx
│   │   └── Typography.tsx
│   └── screens/
│       ├── InterviewScreen.tsx
│       ├── SearchScreen.tsx
│       ├── MatchScreen.tsx
│       └── CoachScreen.tsx
├── store/
│   └── useAppStore.ts          # Zustand hub state
├── shaders/
│   └── vibeMatrix.glsl         # Domain warping shader
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   └── motion.ts
├── types/
│   └── index.ts
└── data/
    └── questions.json          # Mock question graph
```

---

## Hub State Machine

| State | Vibe | Renders |
|-------|------|---------|
| `INTERVIEW` | TRUST / DEEP | QuestionCard |
| `SEARCH` | CAUTION | LoaderText + StatusLog |
| `MATCH` | PASSION | MatchCard (Bio only) |
| `PAYMENT` | PASSION | PayGateModal |
| `REVEAL` | PASSION | PhotoCard |
| `COACH` | GROWTH | ChatInterface |
| `INTERVENTION` | ALERT | WarningModal |

---

## Critical Rules

1. **Never show white screens** - Always have VibeMatrix background
2. **Abby never hides** - She transforms (center ↔ docked)
3. **Motion is slow** - 800-1200ms transitions, heavy easing
4. **Colors morph** - Never cross-fade, always interpolate
5. **Text on Glass** - Content never touches background directly
6. **MORPH, NOT FADE** - All visual transitions are shader parameter changes, NOT React component swaps
   - Background changes = morphWrapper noise-based transition (stays alive)
   - Orb changes = continuous shader uniform animation (never unmounts)
   - NO `opacity` or `display` toggling between visual components
   - The visual layer ALWAYS renders; only uniforms change

---

## Vibe Color Quick Reference

```typescript
TRUST:    #3B82F6 (Blue)    // Onboarding
PASSION:  #E11D48 (Red)     // Match reveal
CAUTION:  #F59E0B (Orange)  // Searching
GROWTH:   #10B981 (Green)   // Coach mode
DEEP:     #4C1D95 (Violet)  // Deep questions
ALERT:    #374151 (Grey)    // Intervention
```

---

## Commands

```bash
# Development
npm start                    # Start Expo
npm run ios                  # iOS Simulator

# Build
npx expo prebuild --platform ios
npx eas build --platform ios --profile preview
```

---

## When Implementing Features

1. Check which **Hub State** this affects
2. Reference **FSD.md** for logic requirements
3. Reference **DESIGN-SYSTEM.md** for visual specs
4. Update the appropriate living document if specs change
5. Maintain the Glass Sandwich layer hierarchy

---

## Recent Session Work (2026-01-13)

### Keyboard Fix (CRITICAL)

| Issue | Root Cause | Fix | File |
|-------|------------|-----|------|
| **Keyboard not working** | Voice subsystem intercepting input | Set `EXPO_PUBLIC_VOICE_ENABLED=false` | `.env.development` |

### Animation Fixes Applied

| Issue | Root Cause | Fix | File |
|-------|------------|-----|------|
| Animation static | useDerivedValue dep array | Removed dependency array | VibeMatrixAnimated.tsx:102 |
| No 60fps render | Missing Canvas mode | Added `mode="continuous"` | VibeMatrixAnimated.tsx:134 |
| Animation too slow | Low speed multiplier | Increased 3x (0.05→0.15 min) | domainWarp.ts:36 |
| No shader switching | Debug overlay colors only | Added shader preset buttons (0-18) | VibeDebugOverlay.tsx |

### Environment Configuration Changes

```bash
# .env.development - PRODUCTION VALUES
EXPO_PUBLIC_USE_REAL_API=true                          # Use real backend
EXPO_PUBLIC_API_BASE_URL=https://dev.api.myaimatchmaker.ai
EXPO_PUBLIC_VOICE_ENABLED=false                        # CRITICAL: Must be false for keyboard!
```

### Bundle ID & Team

```json
// app.json
"bundleIdentifier": "com.chi.abby.localdev"
"appleTeamId": "V832DPFMMB"
```

### Debug Overlay Usage

1. Tap 🎨 button (bottom right)
2. Scroll down to **SHADER PRESETS (Textures)**
3. Tap numbered buttons (0-18) to switch shader effects
4. Each number is a completely different visual texture

### Key Parameters (Don't Change!)

```typescript
// CoachIntroScreen.tsx & CoachScreen.tsx
const SNAP_POINTS = [0.35, 0.55, 0.75, 0.9];
const DEFAULT_SNAP = 0.55;  // 55% - enough room for conversation

// Cognito Configuration (MUST MATCH Nathan's backend)
// Pool ID:  us-east-1_l3JxaWpl5
// Client:   2ljj7mif1k7jjc2ajiq676fhm1
// Token:    ID token (not access token) - documented in ADR-001
```

### ⚠️ CRITICAL: Voice Feature Flag (2026-01-13)

```bash
# In .env.development - MUST BE FALSE for keyboard input to work!
EXPO_PUBLIC_VOICE_ENABLED=false
```

**WHY:** When `EXPO_PUBLIC_VOICE_ENABLED=true`, the voice audio subsystem
initializes and intercepts keyboard input events in iOS Simulator. This causes:
- Hardware keyboard input to be blocked
- User cannot type in text fields
- Only paste works (Cmd+V)

**FIX:** Set `EXPO_PUBLIC_VOICE_ENABLED=false` in `.env.development`

**SYMPTOM:** If keyboard stops working in simulator, CHECK THIS FLAG FIRST.

### Tests

- 454 tests in 11 test suites
- Run with: `npm test`

---

## Notes

- **Backend:** Client's Nathan Negreiro is building `dev.api.myaimatchmaker.ai` API
- **Authentication:** AWS Cognito with ID token pattern (documented in ADR)
- **Voice:** OpenAI Realtime API via client's backend
- **Matching Engine:** Backend-driven (we send answers, get candidates back)
- **TestFlight:** Used for client demos
- **Battery Optimization:** Low Power Mode - replace shaders with static images when battery < 20%
- **Token Lifetime:** ID tokens expire faster than access tokens (watch for refresh logic)

---

## Recent Session Work (2026-01-15)

### TTS Audio Investigation & WebRTC Discovery

**Problem:** TTS audio not playing when Abby speaks. HTTP 500 errors on message endpoint.

**Investigation Results:**
- ✅ TTS Fix Plan implemented in `AbbyRealtimeService.ts` (uses `AbbyTTSService`)
- ✅ Frontend code is correct
- ❌ HTTP endpoints don't support direct text chat

**Root Cause:** Nathan's backend uses WebRTC architecture:
```
1. POST /v1/abby/realtime/session → get client_secret
2. Connect DIRECTLY to OpenAI Realtime API via WebRTC using client_secret
3. Messages flow through WebRTC data channels, NOT HTTP endpoints
```

**Resolution:** Geraldo (backend developer) taking over WebRTC integration. He just needs frontend files.

### Backend Architecture (CRITICAL)

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `POST /v1/abby/realtime/session` | Create session, get client_secret | ✅ Works |
| `POST /v1/abby/realtime/{id}/message` | INJECT text into WebRTC session | ⚠️ Not for HTTP chat |
| `POST /v1/abby/session/{id}/end` | End session | ✅ Works |
| WebRTC + client_secret | Direct OpenAI Realtime API | ⏳ Geraldo handling |

### Files Modified (2026-01-15)

| File | Change |
|------|--------|
| `AbbyRealtimeService.ts` | TTS integration via AbbyTTSService (lines 571-601) |
| `RUNBOOK.md` | Added hotspot network instructions |
| `.claude/active-tasks.md` | Updated blocker: Geraldo WebRTC |
| `.claude/GLOBAL-HANDOVER.md` | Session context update |

### Current Blocker

**Waiting on Geraldo** to complete:
- RTCPeerConnection to OpenAI Realtime API
- Data channel routing for messages/transcripts
- Integration with frontend hooks

**GitHub:** Code pushed to `growthpigs/abby-app` branch `test-jan2-animation`
