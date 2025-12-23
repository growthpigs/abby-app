# ABBY - Project Instructions for Claude Code

> **The Anti-Dating App** | iOS React Native (Expo)

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

- ElevenLabs agent (already built)
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

## Recent Session Work (2024-12-23)

### Fixed

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Text not flowing (only 1 sentence visible) | `DEFAULT_SNAP` changed from 0.55 to 0.25 | Reverted to 0.55 (55% modal height) |
| No shader transitions during interview | `BACKGROUND_SEQUENCE` started at 5 (same as COACH_INTRO) | Changed to `[1,2,3,4,5,6,7,8,9,10]` |
| No progress indicator | Missing UI element | Added "X/10" in JetBrains Mono 12pt uppercase |
| Mute button inconsistent | CoachIntroScreen had 44x44, CoachScreen had 28x28 | Unified to 28x28 |

### Key Parameters (Don't Change!)

```typescript
// CoachIntroScreen.tsx & CoachScreen.tsx
const SNAP_POINTS = [0.35, 0.55, 0.75, 0.9];
const DEFAULT_SNAP = 0.55;  // 55% - enough room for conversation
```

### Tests

- 211 tests in 6 test suites
- Run with: `npm test`

---

## Notes

- Backend is mocked locally (Android backend is separate)
- All question logic uses local JSON graph
- TestFlight for client demos
- Low Power Mode: Replace shaders with static images when battery < 20%
