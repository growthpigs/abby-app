# Tech Debt Register

> **Status:** Deferred until post-MVP validation
> **Last Updated:** 2026-01-13
> **Decision:** Ship MVP first, refactor after client validates concept

---

## Animation Technical Debt (2026-01-13)

### Critical Issues Fixed

| Issue | Fix | File |
|-------|-----|------|
| useDerivedValue dep array | Removed dependency array | VibeMatrixAnimated.tsx:102 |
| Canvas not re-rendering | Added mode="continuous" | VibeMatrixAnimated.tsx:134 |
| Animation too slow | Increased speed 3x | domainWarp.ts:36 |

### Remaining Animation Issues

| Issue | Impact | Priority |
|-------|--------|----------|
| Directional bias (top-left) | Visual quality | P2 |
| Speed still slower than original | Visual quality | P2 |
| Factory shaders ≠ handwritten | Missing original effects | P3 |

### Potential Solutions

1. **Increase speed further** - Try 5-10x multiplier in domainWarp.ts
2. **Fix directional bias** - Adjust offset vectors in domainWarp function
3. **Restore original shaders** - Use handwritten G1/G2/G4 instead of factory

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
2. Mock Voice SDK
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
