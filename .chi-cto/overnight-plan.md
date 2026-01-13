# Chi CTO Overnight Execution Plan

**Created:** 2026-01-13
**Target:** MVP API Integration Complete
**Workers:** 3 parallel

---

## Worker 1: InterviewScreen → Questions API

**Task ID:** `worker-interview-api`
**Priority:** IMMEDIATE (Score: 36)
**Estimated:** 30-45 min

### Current State
- `InterviewScreen.tsx` uses `ALL_DATA_POINTS` from local `questions-schema.ts`
- `QuestionsService.ts` is FULLY IMPLEMENTED but NOT USED

### Instructions
1. Import QuestionsService in InterviewScreen
2. Replace local data with API calls:
   - On mount: `QuestionsService.getNextQuestion()`
   - On answer: `QuestionsService.submitAnswer()`
3. Handle loading/error states
4. Keep local fallback for demo mode (check `TokenManager.getToken()`)

### Files to Modify
- `src/components/screens/InterviewScreen.tsx`

### Success Criteria
- [ ] Questions load from API when authenticated
- [ ] Answers submit to API
- [ ] Progress tracks from API response
- [ ] Demo mode falls back to local questions
- [ ] No TypeScript errors

---

## Worker 2: Profile Save Verification

**Task ID:** `worker-profile-verify`
**Priority:** IMMEDIATE (Score: 32)
**Estimated:** 15-20 min

### Current State
- Profile payload converted to snake_case (just fixed)
- Need to verify it works with real API

### Instructions
1. Test signup flow end-to-end
2. Check console logs for profile payload
3. Verify API response (200 OK or specific error)
4. If still failing, check API docs for exact field names

### Files to Check
- `App.tsx` (handleLocationComplete)
- `src/store/useOnboardingStore.ts` (getProfilePayload)

### Success Criteria
- [ ] Profile saves without "Profile Save Issue" alert
- [ ] Console shows "Profile submitted successfully"
- [ ] Or: Document exact API error for Nathan

---

## Worker 3: Voice Session Test

**Task ID:** `worker-voice-test`
**Priority:** IMMEDIATE (Score: 28)
**Estimated:** 20-30 min

### Instructions
1. Navigate to Coach screen (authenticated)
2. Check if voice session creates with auth token
3. Monitor console for API responses
4. Document what works / what doesn't

### Current State
- AbbyRealtimeService has WebRTC stub (line 164)
- Demo mode working
- Need to verify real session creation

### Files to Check
- `src/services/AbbyRealtimeService.ts`

### Success Criteria
- [ ] Session creates with 200 response
- [ ] Or: Document API requirements for real WebRTC

---

## Execution Commands

### Start Overnight Run

```bash
# Terminal 1: Main orchestrator (this session)
cd /Users/rodericandrews/_PAI/projects/abby-client-api

# Terminal 2: Worker 1 - InterviewScreen
cd /Users/rodericandrews/_PAI/projects/abby-client-api
claude "You are Chi CTO worker-interview-api. Wire InterviewScreen to use QuestionsService instead of local ALL_DATA_POINTS. Keep demo mode fallback. Run: npm run build after changes."

# Terminal 3: Build watcher
cd /Users/rodericandrews/_PAI/projects/abby-client-api
npx expo run:ios
```

---

## Quality Gates

Before marking complete:
```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Test (if tests exist)
npm test
```

---

## Rollback Plan

If anything breaks:
```bash
git checkout -- src/components/screens/InterviewScreen.tsx
git checkout -- App.tsx
```

---

## Morning Checklist

When you wake up, verify:
- [ ] App builds without errors
- [ ] Signup → Onboarding → Interview flow works
- [ ] Questions come from API (check network tab)
- [ ] Photos upload works
- [ ] Voice session at least creates (even if WebRTC stub)
