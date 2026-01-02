# Tech Debt Register

> **Status:** Deferred until post-MVP validation
> **Last Updated:** 2024-12-24
> **Decision:** Ship MVP first, refactor after client validates concept

---

## Deferred Refactoring (V2)

### Priority 1: Quick Wins (~125 lines saved)

| Item | Files | Effort | Notes |
|------|-------|--------|-------|
| Extract `<DraggableHeader />` | CoachIntroScreen, CoachScreen | 1hr | Identical JSX in both |
| Extract `<StatusRow />` | CoachIntroScreen, CoachScreen | 1hr | Status dot + text + mute button |
| Apply `useDraggableSheet` to CoachIntroScreen | CoachIntroScreen | 30min | Hook already exists, screen uses inline PanResponder |
| Extract `useScrollToTop` hook | CoachScreen → shared | 30min | Better timeout cleanup pattern |

### Priority 2: Medium Refactoring (~75 lines saved)

| Item | Files | Effort | Notes |
|------|-------|--------|-------|
| Extract `<MessageList />` | CoachIntroScreen, CoachScreen | 2hr | Scroll + reverse + render |
| Extract `useConversationInit` hook | Both screens | 1hr | Identical useEffect for agent startup |

### Priority 3: Larger Refactoring (~200+ lines saved)

| Item | Files | Effort | Notes |
|------|-------|--------|-------|
| Consolidate stylesheets | Both screens | 3hr | 95% style duplication |
| Extract `useAbbyAgentSetup` factory | AbbyAgent + screens | 4hr | Screen-specific callbacks |

---

## Test Coverage Gap

**Current:** 251 static validation tests (grep source files for patterns)
**Missing:** Runtime unit tests that execute React Native code

### To Add Post-MVP

1. `@testing-library/react-native` setup
2. Mock ElevenLabs SDK
3. Mock Zustand stores
4. Component render tests
5. Hook behavior tests

---

## Why Deferred?

1. **MVP Goal:** Validate concept with client, not perfect code
2. **Code Works:** Voice functional, all tests pass
3. **Risk:** Over-engineering before product-market fit
4. **Time:** Every hour on refactoring = hour not on demo features

**Revisit After:**
- Client approves MVP
- V2 scope is defined
- Payment/matching features need stable foundation

---

## Code Review Findings (2026-01-02)

> **Source:** Competitive code review by two autonomous agents
> **Fixed:** 1 Critical (cross-store race condition)
> **Remaining:** 22 issues logged below

### ✅ FIXED

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| CR-001 | Critical | Cross-store race condition (`setTimeout(0)` in useDemoStore) | Fixed via `storeSync.ts` subscription pattern |

### 🔴 Critical (Fix Before Production)

| ID | Severity | File | Issue | Risk |
|----|----------|------|-------|------|
| ~~CR-002~~ | ~~Critical~~ | `AuthService.ts:98-110` | ~~JWT parsing with `atob()` has no try/catch~~ | **FALSE POSITIVE** - already wrapped in try/catch (lines 99-109) |
| ~~CR-003~~ | ~~Critical~~ | `AuthService.ts:349-354` | ~~Token refresh mutex race condition~~ | **FALSE POSITIVE** - mutex pattern correct (tested with concurrent calls + failures) |

### 🟠 High (Fix Before V2)

| ID | Severity | File | Issue | Risk |
|----|----------|------|-------|------|
| CR-004 | High | `VibeMatrixAnimated.tsx:112` | Missing `width`, `height` in useDerivedValue deps | Screen rotation breaks shader resolution |
| CR-005 | High | `useDraggableSheet.ts:115-154` | PanResponder captures stale closures | Incorrect snap behavior after config change |
| CR-006 | High | `CoachScreen.tsx:146` | Empty useEffect dependency array | May use stale callbacks |
| CR-007 | High | `AbbyRealtimeService.ts:277-289` | Demo mode timer accumulation | Rapid typing causes message ordering issues |
| CR-008 | High | `InterviewScreen.tsx:68-69` | Early return renders blank screen | No error feedback for users |
| CR-009 | High | `TokenManager.ts:18` | Insecure fallback to AsyncStorage on web | Tokens exposed if deployed to web |

### 🟡 Medium (V2 Backlog)

| ID | Severity | File | Issue | Risk |
|----|----------|------|-------|------|
| CR-010 | Medium | `AuthService.ts:162-175` | Duplicate `if (__DEV__)` checks | Code clutter |
| CR-011 | Medium | `CoachIntroScreen.tsx:316` | Array reversed on every render | Unnecessary GC pressure |
| CR-012 | Medium | `AbbyTTSService.ts:43-49` | Singleton prevents testing/cleanup | Testing difficulty |
| CR-013 | Medium | `morphWrapper.ts:106-112` | Fragile regex for shader injection | Silent failures if format changes |
| CR-014 | Medium | `useOnboardingStore.ts:314-348` | Async save without await | Potential data loss on crash |
| CR-015 | Medium | `config.ts:43-55` | Cognito credentials hardcoded | Rotation requires code deploy |
| CR-016 | Medium | `InterviewScreen.tsx:125-149` | TTS not cancelled on rapid navigation | Audio overlap |
| CR-017 | Medium | Multiple files | 183 console.log calls | Bundle bloat |
| CR-018 | Medium | `secureFetch.ts:86-99` | Retries on offline without fast-fail | Poor UX on no connectivity |

### ⚪ Low (Nice to Have)

| ID | Severity | File | Issue | Risk |
|----|----------|------|-------|------|
| CR-019 | Low | `CoachIntroScreen.tsx:140-175` | Accessing `_value` internal property | May break on RN update |
| CR-020 | Low | `AbbyRealtimeService.ts:74-90` | Mixed class/hook paradigm | Unclear API boundaries |
| CR-021 | Low | `InterviewScreen.tsx:252` | Constant defined after component | Unconventional ordering |
| CR-022 | Low | `InterviewScreen.tsx:267-268` | Hardcoded `-34` for safe area | Device-specific |
| CR-023 | Low | `AbbyTTSService.ts:169-172` | `playAudioFromBase64` throws not implemented | Unexpected crash if API returns base64 |

### 📊 Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 3 | 1 fixed, **2 false positives** |
| High | 6 | All deferred |
| Medium | 9 | All deferred |
| Low | 5 | All deferred |
| **Total** | **23** | **20 real issues (3 false positives)** |
