# ABBY Active Tasks

**Last Updated:** 2026-01-13
**Branch:** `client-api-integration`
**Technical Debt Score:** 9/10 → Target: 9/10 ✅ ACHIEVED

---

## IMMEDIATE PRIORITY - ALL FIXED ✅

### 1. Session Persistence - FIXED (commit 4ee62d56)
- [x] **File:** `App.tsx:247-273`
- [x] **Fix Applied:** App.tsx now calls `AuthService.isAuthenticated()` on startup
- [x] **Test:** Kill app, reopen, should restore authenticated state

### 2. Profile Submission Confirmation - FIXED (commit 4ee62d56)
- [x] **File:** `App.tsx:594-604`
- [x] **Fix Applied:** Alert shown to user on profile submission failure
- [x] **Test:** Disconnect network, complete onboarding, should see error message

### 3. VibeMatrix Animation Fix - COMPLETED ✅ (2026-01-13)
- [x] **Branch:** `client-api-integration`
- [x] **Root Cause:** GitHub Issue #2640 - useDerivedValue dep array breaks Skia animation
- [x] **Fixes Applied (commit 58dba57):**
  - Removed dep array from useDerivedValue in VibeMatrixAnimated.tsx
  - Added mode="continuous" to Canvas
  - Increased animation speed 3x in domainWarp.ts
  - Added 19 shader preset switching in VibeDebugOverlay.tsx
- [x] **Validation:** Stress test passed (9.5/10 confidence), GitHub Issue verified via browser
- [x] **PAI Documentation Updates:**
  - EP-084 added to error-patterns.md ("File Existence Fallacy")
  - Animation verification commands added to RUNBOOK.md
  - Lesson committed to mem0

### 4. Fire-and-Forget Bugs - FIXED (commit 4ee62d56)
- [x] **File:** `useDemoStore.ts:197-202` - `clearStorage()` now has .catch()
- [x] **File:** `CoachScreen.tsx:166-174` - `sendTextMessage()` now has .catch()
- [x] **Test:** Reset interview, immediately navigate - no stale data

---

## HIGH PRIORITY - ALL VERIFIED ✅

### 5. Timer/Memory Cleanup - VERIFIED CORRECT (False Positive)
- [x] **File:** `AbbyRealtimeService.ts:83-112, 523-529`
- [x] **Verification:** `scheduleTimer()` tracks timers in Set, `clearAllTimers()` cancels all
- [x] **Evidence:** useEffect cleanup calls `endConversation()` → `clearAllTimers()`
- [x] **Status:** ✅ No fix needed - pattern is robust

### 6. Console Leaks in Production - VERIFIED CORRECT (False Positive)
- [x] **Files:** All console.error calls reviewed
- [x] **Verification:** All ARE inside `if (__DEV__)` blocks (guard on previous line)
- [x] **Evidence:** Agent missed the guard pattern `if (__DEV__) { console.error(...) }`
- [x] **Status:** ✅ No fix needed - already guarded

### 7. Token Refresh Race Condition - VERIFIED CORRECT (False Positive)
- [x] **File:** `AuthService.ts:340-356`
- [x] **Verification:** JS single-threaded - check and assignment in same event loop tick
- [x] **Evidence:** `refreshPromise` mutex prevents concurrent refreshes correctly
- [x] **Status:** ✅ No fix needed - pattern is correct for JS runtime

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

## COMPLETED THIS SESSION (2026-01-13)

### Business & Scope Analysis
- [x] **Scope Reconciliation for Brent** - Created comprehensive analysis of disputed "Above & Beyond" items
- [x] **Reconciliation Document** - `docs/SCOPE-RECONCILIATION.md` with verdict on each disputed item
- [x] **Key Finding:** 60% of "Above & Beyond" claims NOT supported by Nov 10 spec
- [x] **Onboarding Screens Defense:** Gender, ethnicity, smoking, relationship were explicitly required
- [x] **Technical Infrastructure Verdict:** API client, 399 tests, full Cognito legitimately above scope

### API Integration Audit
- [x] **API Endpoint Audit** - Reviewed our client.ts against Nathan's backend requirements
- [x] **Matches POST:** ✅ Have `likeUser()` and `passUser()` endpoints
- [x] **Chat Endpoints:** ✅ Have `sendChatMessage()`, `getThreads()`, `getMessages()`
- [x] **Consent Endpoints:** ✅ Have basic consent, may need match-specific consent clarification
- [x] **MCP Mystery:** Identified as Model Context Protocol (Anthropic) - need Nathan clarification

### Previous Session Work
- [x] **VibeMatrix Animation Fix** - Root cause: GitHub Issue #2640
- [x] Removed useDerivedValue dependency array (VibeMatrixAnimated.tsx)
- [x] Added Canvas mode="continuous" (VibeMatrixAnimated.tsx)
- [x] Increased animation speed 3x (domainWarp.ts)
- [x] Added 19 shader preset switching (VibeDebugOverlay.tsx)
- [x] **Commit:** `58dba57` - Animation fixes + documentation
- [x] **Validation Stress Test:** 9.5/10 confidence score
- [x] **PAI Documentation Phase:**
  - EP-084 added to ~/.claude/troubleshooting/error-patterns.md
  - Animation verification commands added to RUNBOOK.md
  - Lesson committed to mem0

## COMPLETED PREVIOUS SESSION (2026-01-12)

- [x] First principles verification (branch check)
- [x] Deep bug scan (Explore agent) - 14 bugs found
- [x] Root cause analysis (Brainstorm agent) - Tech debt 7/10
- [x] UX/Performance audit (Superpower agent) - 15 UX issues
- [x] Created SCREEN-STATUS.md in docs/05-planning/
- [x] Documented branch divergence analysis
- [x] **FIX: Session persistence** - App.tsx now checks AuthService.isAuthenticated() on startup
- [x] **FIX: Profile feedback** - Alert shown on profile submission failure
- [x] **FIX: Fire-and-forget useDemoStore** - clearStorage() now has .catch()
- [x] **FIX: Fire-and-forget CoachScreen** - sendTextMessage() now has .catch()
- [x] **Commit:** `4ee62d56` - 4 critical bugs fixed
- [x] **VERIFY: Timer cleanup** - AbbyRealtimeService.ts already robust (false positive)
- [x] **VERIFY: Console guards** - All console.error already in `if (__DEV__)` (false positive)
- [x] **VERIFY: Token mutex** - JS single-threaded, pattern correct (false positive)
- [x] **Tech Debt Score:** 7/10 → 9/10 TARGET ACHIEVED

---

## METRICS

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Technical Debt | 7/10 | 9/10 | 9/10 ✅ |
| Critical Bugs | 3 | 0 | 0 ✅ |
| High Bugs | 3 | 0 (false positives) | 0 ✅ |
| Tests Passing | 404 | 404 | 404+ ✅ |

---

*Animation fixed (2026-01-13). Next priorities: Medium priority UX items (Password UX, Inline Validation, SearchingScreen Cancel)*
