# API Integration Feature

## Overview

Complete integration with MyAIMatchmaker backend API at `dev.api.myaimatchmaker.ai` for ABBY React Native app.

## Status: COMPLETE

### Implemented Endpoints

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/v1/matches/candidates` | GET | ✅ | Fetch match candidates |
| `/v1/matches/{id}/like` | POST | ✅ | Accept/like a match |
| `/v1/matches/{id}/pass` | POST | ✅ | Reject/pass a match |
| `/v1/consents` | POST | ✅ | Record match-specific consent |
| `/v1/consents` | DELETE | ✅ | Revoke consent |
| `/v1/answers` | POST | ✅ | Submit onboarding answers |

### Key Fixes Applied

1. **MatchesScreen - Missing Core Functionality**
   - Added like/pass handlers (POST to backend)
   - Added double-tap prevention with `isActioning` state
   - Added circular action buttons with disabled states

2. **Consent API Type Mismatch**
   - Fixed ConsentType from `terms_of_service` to API-supported values:
     - `photo_exchange`, `phone_exchange`, `payment_agreement`, `private_photos`
   - Added required `counterpart_user_id` parameter
   - Removed incorrect consent call from PermissionsScreen

3. **Onboarding Data Persistence**
   - Wired all onboarding screens to submit via POST /v1/answers
   - Mapped onboarding data to question IDs (ONB_001-008)
   - Added batch submission after profile completion

## Technical Details

### Files Modified

```
M src/components/screens/MatchesScreen.tsx   - like/pass handlers, double-tap prevention
M src/components/screens/PermissionsScreen.tsx - removed bad consent call
M src/services/api/types.ts - fixed ConsentType
M src/services/api/client.ts - updated consent signatures
M src/services/api/mock.ts - updated mock consent
M src/services/QuestionsService.ts - onboarding submission
M src/services/AuthService.ts - profile completion hook
```

### Validation

- TypeScript: ✅ Clean compilation
- API Tests: ✅ 31/31 passing
- Runtime: ✅ Verified with demo mode fallback

### Edge Cases Handled

- Demo mode detection (graceful fallback)
- Double-tap prevention on action buttons
- Photo load failures
- API request failures with user feedback
- Type safety for all API contracts

## Architecture

API service follows interface pattern with mock/real implementations swappable via `USE_REAL_API` config flag.

```
IApiService (interface)
├── MockApiService (demo mode)
└── RealApiService (backend integration)
```

All screens check `checkIsDemoMode()` and gracefully fall back to mock data when no auth token is available.