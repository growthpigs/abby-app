# ABBY Active Tasks

**Last Updated:** 2026-01-12
**Branch:** `test-jan2-animation`
**Technical Debt Score:** 7/10 → Target: 9/10

---

## IMMEDIATE PRIORITY (Blocking Production)

### 1. Session Persistence - CRITICAL
- [ ] **File:** `App.tsx:247-255`
- [ ] **Issue:** Users must re-login on every app restart
- [ ] **Fix:** Call `AuthService.isAuthenticated()` in useEffect before transitioning LOADING → LOGIN
- [ ] **Test:** Kill app, reopen, should restore authenticated state

### 2. Profile Submission Confirmation - CRITICAL
- [ ] **File:** `App.tsx:558-581`
- [ ] **Issue:** Profile submission fails silently - users think data saved when it may have failed
- [ ] **Fix:** Add Alert on success/failure OR implement retry with exponential backoff
- [ ] **Test:** Disconnect network, complete onboarding, should see error message

### 3. Branch Merge - CRITICAL
- [ ] **Branches:** `test-jan2-animation` ↔ `client-api-integration`
- [ ] **Issue:** idToken fix on one branch, animation fixes on other
- [ ] **Fix:** Cherry-pick `466ee989` into client-api-integration, then merge to main
- [ ] **Test:** Both auth AND animations work on merged branch

### 4. Fire-and-Forget Bugs - CRITICAL
- [ ] **File:** `useDemoStore.ts:198` - `clearStorage()` not awaited in `reset()`
- [ ] **File:** `CoachScreen.tsx:167` - `sendTextMessage()` no error handling
- [ ] **Fix:** Add await and try-catch with user feedback
- [ ] **Test:** Reset interview, immediately navigate - no stale data

---

## HIGH PRIORITY (Data Loss Risk)

### 5. Timer/Memory Cleanup
- [ ] **File:** `AbbyRealtimeService.ts:283-286`
- [ ] **Issue:** Demo timers fire on unmounted components
- [ ] **Fix:** Attach cleanup to component lifecycle, not manual endConversation()
- [ ] **Test:** Navigate rapidly during demo mode - no crashes

### 6. Console Leaks in Production
- [ ] **File:** `useDemoStore.ts:123`
- [ ] **File:** `useOnboardingStore.ts:390, 398, 407`
- [ ] **Issue:** 4 console.error calls not gated by `__DEV__`
- [ ] **Fix:** Wrap in `if (__DEV__)` guard
- [ ] **Test:** Production build has no console output

### 7. Token Refresh Race Condition
- [ ] **File:** `AuthService.ts:360-401`
- [ ] **Issue:** Multiple concurrent refreshes can race
- [ ] **Fix:** Strengthen mutex pattern
- [ ] **Test:** Fire 10 concurrent authenticated requests after token expiry

---

## MEDIUM PRIORITY (UX Degradation)

### 8. Password Requirements UX
- [ ] **File:** `PasswordScreen.tsx`
- [ ] **Issue:** Requirements shown AFTER failure, not before
- [ ] **Fix:** Display requirements upfront, real-time validation feedback
- [ ] **Test:** New user sees requirements before typing

### 9. Inline Validation Errors
- [ ] **Files:** `EmailScreen.tsx`, `PasswordScreen.tsx`, `DOBScreen.tsx`
- [ ] **Issue:** Disabled buttons with no explanation why
- [ ] **Fix:** Add error text below each field
- [ ] **Test:** Invalid input shows clear error message

### 10. SearchingScreen Cancel
- [ ] **File:** `SearchingScreen.tsx`
- [ ] **Issue:** Users trapped in loading state
- [ ] **Fix:** Add back/cancel button
- [ ] **Test:** Can escape loading screen

---

## LOW PRIORITY (Cleanup)

### 11. Remove Dead Code
- [ ] **File:** `config.ts:19` - `USE_REAL_API` never used
- [ ] **Fix:** Delete or integrate properly

### 12. Accessibility Labels
- [ ] **Files:** All screen components
- [ ] **Issue:** No accessibilityLabel on form fields
- [ ] **Fix:** Add labels for screen readers

---

## COMPLETED THIS SESSION

- [x] First principles verification (branch check)
- [x] Deep bug scan (Explore agent) - 14 bugs found
- [x] Root cause analysis (Brainstorm agent) - Tech debt 7/10
- [x] UX/Performance audit (Superpower agent) - 15 UX issues
- [x] Created SCREEN-STATUS.md in docs/05-planning/
- [x] Documented branch divergence analysis

---

## METRICS

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Technical Debt | 7/10 | - | 9/10 |
| Critical Bugs | 3 | - | 0 |
| High Bugs | 3 | - | 0 |
| Tests Passing | 404 | - | 404+ |

---

*Next session: Start with `handover.md`, work through tasks 1-4 first*
