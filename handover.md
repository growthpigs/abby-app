# Developer Handover Document

> **Project:** ABBY - The Anti-Dating App
> **Date:** 2026-01-15
> **Recipient:** Geraldo (Backend/WebRTC Developer)

---

## What's Complete

| Feature | Status | Notes |
|---------|--------|-------|
| VibeMatrix (animated shaders) | ✅ | 750-state visual system working |
| Authentication (Cognito) | ✅ | Login, signup, token refresh |
| Onboarding flow | ✅ | 28 screens, all hooked to API |
| Interview questions | ✅ | Dynamic vibe shifts per question |
| UI/Glass design system | ✅ | All components styled |
| Test suite | ✅ | 485 tests passing |

---

## What Geraldo Needs to Implement

### WebRTC Voice Integration (OpenAI Realtime API)

The backend uses OpenAI's Realtime API for voice conversations. The current frontend is wired for HTTP polling but the backend expects **WebRTC connections**.

#### Backend Architecture (Nathan's Implementation)

```
1. POST /v1/abby/realtime/session
   → Returns: { session_id, client_secret }

2. Use client_secret to connect DIRECTLY to OpenAI Realtime API via WebRTC
   → NOT through Nathan's backend

3. POST /v1/abby/realtime/{id}/message
   → This is for INJECTING text into an active WebRTC session
   → NOT for HTTP-based chat
```

#### What Needs to Change

**Current frontend** (`src/services/AbbyRealtimeService.ts`):
- Sends HTTP requests expecting text responses
- Returns mock/fallback responses when backend returns 500

**What's needed:**
1. **RTCPeerConnection** to OpenAI Realtime API using `client_secret`
2. **Audio track handling** for voice input/output
3. **Data channel** for receiving transcripts/messages
4. **Integration with existing hooks:**
   - `useAbbyRealtime()` - manages session state
   - `useAbbyVoice()` - handles voice UI

#### Key Files to Modify

| File | Purpose | Notes |
|------|---------|-------|
| `src/services/AbbyRealtimeService.ts` | Session management | Add WebRTC connection logic |
| `src/hooks/useAbbyRealtime.ts` | React hook for UI | Update to handle WebRTC events |
| `src/hooks/useAbbyVoice.ts` | Voice UI state | Connect to audio tracks |

#### API Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/abby/realtime/session` | POST | Create session, get client_secret |
| `/v1/abby/realtime/{id}/message` | POST | Inject text into WebRTC session |
| `/v1/abby/session/{id}/end` | POST | End session |
| `/v1/abby/realtime/available` | GET | Check API availability |

**API Docs:** https://dev.api.myaimatchmaker.ai/docs#/

---

## Architecture Overview

### Visual Layer Stack ("Glass Sandwich")

```
Layer 3 (Z:30) - SemanticOverlay    │ Accessibility targets
Layer 2 (Z:20) - GlassInterface     │ BlurView + all UI
Layer 1 (Z:10) - AbbyOrb            │ Reactive 3D orb
Layer 0 (Z:0)  - VibeMatrix         │ GLSL shader background
```

All layers render simultaneously. Transitions morph shader uniforms, not React components.

### State Management

| Store | Purpose |
|-------|---------|
| `useVibeController` | Visual state (colors, complexity, textures) |
| `useOnboardingStore` | User progress, answers |
| `useAuthStore` | Cognito tokens, user session |

### Shader System

The VibeMatrix renders 750 possible visual states:
- **6 color themes:** TRUST, DEEP, PASSION, GROWTH, CAUTION, ALERT
- **5 complexity levels:** SMOOTHIE, FLOW, OCEAN, STORM, PAISLEY
- **19 shader textures:** Emotion-grouped effects

Factory pattern: `src/shaders/factory/createVibeShader.ts`

---

## Environment Setup

```bash
# Required for keyboard to work in iOS simulator
EXPO_PUBLIC_VOICE_ENABLED=false

# Backend API
EXPO_PUBLIC_API_BASE_URL=https://dev.api.myaimatchmaker.ai
```

---

## UI Design System (2026-01-15 Update)

### Match Flow Screens - PASSION Palette

The match flow screens (Photos, Matches, Match, Reveal, Payment) now use a consistent PASSION-themed design. **See `docs/DESIGN-SYSTEM.md` for full documentation.**

| Pattern | Style | DO NOT CHANGE |
|---------|-------|---------------|
| Glass cards | `rgba(255, 255, 255, 0.15)`, no border | `rgba(255, 255, 255, 0.5)` looks wrong |
| Caption labels | WHITE (#FFFFFF), JetBrains Mono | NOT gray |
| Compatibility badges | PASSION pink (`#E11D48`), pink tint | NOT green |
| Loading spinners | PASSION pink (#E11D48) | NOT blue |
| Pass/Like buttons | Pass=glass, Like=pink filled | NOT red/green bordered |

**Reference screen:** `CertificationScreen.tsx` - use this as the gold standard for glass styling.

---

## Known Issues / Technical Debt

See `docs/TECH-DEBT.md` for full list. Key items:

| Issue | Severity | Notes |
|-------|----------|-------|
| WebRTC not implemented | **BLOCKER** | This handover's focus |
| Token refresh mutex edge case | HIGH | Rare race condition |
| No circuit breaker on retries | MEDIUM | 7s retry delay |

---

## Running the App

```bash
# Clone
git clone git@github.com:growthpigs/abby-app.git

# Install
npm install

# Run iOS (dev build required for Skia)
npx expo run:ios

# Run tests
npm test
```

---

## Contacts

| Role | Person | Notes |
|------|--------|-------|
| Backend API | Nathan Negreiro | Built Cognito + OpenAI integration |
| Project Lead | Brent | Approves scope changes |
| Frontend Lead | Chi (AI) | Built this codebase |

---

## TL;DR for Geraldo

1. **Voice doesn't work yet** - backend expects WebRTC, frontend sends HTTP
2. **You need to implement:** RTCPeerConnection to OpenAI using `client_secret`
3. **Start in:** `src/services/AbbyRealtimeService.ts:createSession()`
4. **API docs:** https://dev.api.myaimatchmaker.ai/docs#/
5. **Everything else works** - auth, UI, shaders, tests all passing
