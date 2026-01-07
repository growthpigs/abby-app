# ABBY - Project Instructions for Claude Code

> **The Anti-Dating App** | iOS React Native (Expo)

---

## 🚪 MANDATORY: READ GLOBAL PAI SYSTEM FIRST

**Before doing anything on this project:**

Read `/Users/rodericandrews/.claude/CLAUDE.md` completely.

This file contains:
- The mandatory startup sequence (mem0, chi-gateway MCPs, local docs)
- Tool selection priorities (which tools to use, when)
- The entire PAI infrastructure that makes this system work

**Do not proceed with project work until you understand the global system.**

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

# 2. Confirm correct branch
git branch --show-current  # Should show: client-api-integration

# 3. Confirm NOT in /abby (the legacy worktree)
# If pwd shows /abby without -client-api, STOP and cd to correct location
```

**Service Files (CRITICAL - do NOT copy from /abby):**
- ✅ Use: `AbbyRealtimeService.ts` (OpenAI Realtime API via client backend)
- ❌ NOT: `AbbyAgent.ts` (legacy worktree only)

---

## ✅ CORRECT WORKTREE - YOU ARE IN THE RIGHT PLACE

**This is `/abby-client-api` (client-api-integration branch) - ACTIVE DEVELOPMENT.**

| Worktree | Branch | Services |
|----------|--------|----------|
| `/abby` | `main` | ❌ LEGACY - ElevenLabs (AbbyAgent.ts) |
| `/abby-client-api` (HERE) | `client-api-integration` | ✅ ACTIVE - OpenAI (AbbyRealtimeService.ts) |

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

### Voice: OpenAI Realtime API (NOT ElevenLabs!)

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

- ✅ **AWS Cognito** - User authentication (ready, tested with real signup/login)
- ✅ **Client API** - Backend at `https://dev.api.myaimatchmaker.ai` (ready for integration)
- ✅ **OpenAI Realtime API** - Voice conversation (via client backend)
- 🟡 **Supabase** - User data persistence (V2 - mocked for MVP, real integration via API)

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

## Recent Session Work (2026-01-07)

### Authentication Decision Made ✅

**ARCHITECTURAL DECISION:** Rod's iOS app will use **ID tokens** instead of access tokens.

- ✅ Verified Cognito pools match: Both use `us-east-1_l3JxaWpl5`
- ✅ Verified client IDs match: Both use `2ljj7mif1k7jjc2ajiq676fhm1`
- ✅ Tested Swagger API authentication with real account
- ✅ Created account: `rodericandrews@gmail.com` (verified with code 256453)
- ✅ Documented decision in `ADR-001-COGNITO-TOKEN-STRATEGY.md`
- ✅ Updated RUNBOOK.md with ID token authentication flow

**Why ID tokens?** Nathan's backend API explicitly expects ID tokens (Swagger docs: "Use IdToken as the Bearer token"). This pragmatic decision avoids backend changes and gets the system working immediately.

**Breakdown:**
- Duration: ~2 hours
- Files Created: 1 (ADR-001)
- Files Updated: 2 (RUNBOOK.md, CLAUDE.md)
- Risk Level: Low (can refactor to access tokens in ~2 hours if needed later)

See `docs/05-planning/ADR-001-COGNITO-TOKEN-STRATEGY.md` for full technical details and risk assessment.

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

### Tests

- 399 tests in 11 test suites
- Run with: `npm test`

### Session Artifacts

- Created: `docs/05-planning/ADR-001-COGNITO-TOKEN-STRATEGY.md` (architectural decision record)
- Updated: `docs/06-reference/RUNBOOK.md` (authentication flow documentation)
- Updated: `CLAUDE.md` (this file - project status)

---

## Notes

- **Backend:** Client's Nathan Negreiro is building `dev.api.myaimatchmaker.ai` API
- **Authentication:** AWS Cognito with ID token pattern (documented in ADR)
- **Voice:** OpenAI Realtime API via client's backend (NOT ElevenLabs)
- **Matching Engine:** Backend-driven (we send answers, get candidates back)
- **TestFlight:** Used for client demos
- **Battery Optimization:** Low Power Mode - replace shaders with static images when battery < 20%
- **Token Lifetime:** ID tokens expire faster than access tokens (watch for refresh logic)
