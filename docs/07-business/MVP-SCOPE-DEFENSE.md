# Abby App MVP Requirements & Deliverables
## Scope Definition Document (Internal Dev Copy v2)

**Last Updated:** 2026-01-02
**Purpose:** Align expectations between iOS development (ZenChange) and Backend (Nathan) teams. Document scope boundaries and over-delivery.

---

## Executive Summary

The Frontend team was contracted to deliver an MVP iOS app with:
- UI screens for onboarding, profile, matches
- Design system (shaders, glass UI, orb)
- Placeholder API bindings

**What was actually delivered:**
- **29 production screens** (vs ~9 originally scoped)
- **398 automated tests** across 10 test suites
- **Real API integration** with Cognito auth and backend endpoints
- **Demo mode** with graceful fallbacks
- **Security hardening** (input validation, 18+ enforcement, GDPR delete)

**Current Status:** Frontend COMPLETE. Blocked on backend Lambda permissions.

---

## Original MVP Scope (November Requirements)

### Frontend Responsibilities (ZenChange)

| Category | Scoped Items |
|----------|--------------|
| **iOS App Frontend** | User onboarding UI, profile creation, chat UI (placeholder), match reveal (static), payment UI (stub), admin flags (hooks only) |
| **Design System** | Living shaders (VibeMatrix), animated orb, glass UI components, brand styling |
| **Technical Foundation** | Screen flows, UX transitions, placeholder API bindings, TestFlight build |

### Explicitly Excluded from Frontend Scope

- Backend architecture or API development
- Data persistence logic
- Credit/payment accounting engines
- Subscription or billing logic
- Android platform
- Production-grade infrastructure

---

## What Frontend Actually Delivered

### Screens Built: 29 Total (26 Accessible)

| Category | Screens | Count |
|----------|---------|-------|
| **Authentication** | SignIn, Login, Password, Email, EmailVerification | 5 |
| **Onboarding** | Name, DOB, Ethnicity, Smoking, Permissions, BasicsGender, BasicsLocation, BasicsRelationship, BasicsPreferences, EthnicityPreference | 10 |
| **Core Experience** | Interview, Coach, CoachIntro, Searching, Reveal, Payment, Match | 7 |
| **Menu (Hamburger)** | Profile, Settings, Photos, Matches | 4 |
| **Orphaned (V2)** | PhoneNumber, VerificationCode, Loading | 3 |

### Technical Infrastructure Delivered

| Component | Description | Status |
|-----------|-------------|--------|
| **Cognito Integration** | Full AWS Cognito auth flow (not placeholder) | ✅ Complete |
| **Type-Safe API Client** | Calls `dev.api.myaimatchmaker.ai` with proper typing | ✅ Complete |
| **Token Management** | Automatic refresh, session persistence, secure storage | ✅ Complete |
| **Demo Mode** | Graceful fallbacks when API unavailable | ✅ Complete |
| **State Management** | Zustand stores with persistence | ✅ Complete |
| **Voice Framework** | OpenAI Realtime API integration (upgraded from ElevenLabs) | ✅ Complete |

### Services Built: 7 Total

```
AuthService.ts         - Cognito authentication
TokenManager.ts        - JWT handling and refresh
AbbyRealtimeService.ts - OpenAI voice integration
AbbyTTSService.ts      - Text-to-speech fallback
QuestionsService.ts    - Interview question flow
EmotionVibeService.ts  - Shader mood mapping
CognitoConfig.ts       - AWS configuration
```

### Quality Assurance

| Metric | Value |
|--------|-------|
| Test Suites | 10 |
| Individual Tests | 398 |
| Test Coverage | 74% |
| TypeScript | Strict mode, zero errors |

### Security & Compliance

- [x] 18+ age verification with date picker (not just checkbox)
- [x] GDPR delete account functionality
- [x] Input validation with maxLength on all fields
- [x] Console statements gated behind `__DEV__`
- [x] Secure token storage

---

## Backend Responsibilities (Nathan)

These features must be implemented via API and data services by the backend team.

### Core Backend Requirements

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Authentication & Verification** | ⚠️ PARTIAL | Cognito works, PostConfirmation Lambda fails |
| 2 | **User Data Storage** | ❌ BLOCKED | Lambda must sync users to PostgreSQL |
| 3 | **Matchmaking Engine** | ❌ NOT STARTED | Daily match delivery, match history |
| 4 | **AI Photo Moderation** | ❌ NOT STARTED | OpenAI Vision for content filtering |
| 5 | **Stripe Integration** | ❌ NOT STARTED | Payment webhooks, subscription management |
| 6 | **Certification Logic** | ❌ NOT STARTED | Third-party verification |
| 7 | **Consent Logging** | ❌ NOT STARTED | Photo sharing, payment consent timestamps |

### Current Blocker

```
BLOCKER: PostConfirmation Lambda IAM Permissions

Status: User creation succeeds in Cognito, but Lambda fails with AccessDeniedException
Impact: Users exist in Cognito but NOT in PostgreSQL database
Result: ALL /v1/* API calls fail (no user record to query)
Owner: Nathan
Since: 2026-01-02

Frontend cannot proceed with integration testing until resolved.
```

---

## Items NOT Included in MVP (Roadmap)

The following items have been discussed but are **explicitly NOT part of the MVP scope**. Any work on these items constitutes a scope change requiring separate agreement.

| Item | Requested By | Category | Effort Estimate | Notes |
|------|--------------|----------|-----------------|-------|
| Android version | Client | Platform | Full rebuild | Separate project |
| Real Stripe payments | Manny | Backend | 2-3 weeks | Webhook handling, subscription logic |
| Human photo certification | Diane | Backend + Admin | 2-4 weeks | Admin dashboard, review queue |
| Voice sentiment analysis | Manny | Backend | 2-3 weeks | OpenAI analysis pipeline |
| Feedback learning system | Client | Backend | 2-3 weeks | ML model training |
| Match consumption credits | Client | Backend | 1-2 weeks | Credit accounting engine |
| Push notifications | Client | Both | 1-2 weeks | Backend + iOS certificates |
| In-app messaging | Client | Both | 3-4 weeks | Real-time chat infrastructure |
| Profile video uploads | Client | Both | 2-3 weeks | Video processing pipeline |

---

## Acceptance Criteria for MVP Complete

Frontend is considered **COMPLETE** when:

- [x] User can sign up with email/password via Cognito
- [x] User can complete onboarding flow (all 10 screens)
- [x] User can view/edit profile
- [x] User can view matches screen (with API data or demo fallback)
- [x] User can interact with Abby coach (voice or text)
- [x] User can view photos screen
- [x] All screens render without crashes
- [x] TypeScript compiles without errors
- [x] 398 tests pass
- [x] TestFlight build deployable

Backend is considered **COMPLETE** when:

- [ ] PostConfirmation Lambda creates user in PostgreSQL
- [ ] All `/v1/*` endpoints return real data
- [ ] Match algorithm returns compatible users
- [ ] Photo upload stores to S3 and returns URLs
- [ ] Stripe webhook processes test payments

---

## Change Order Process

Any requests beyond the scope defined in this document require:

1. Written request specifying the feature
2. Effort estimate from relevant team
3. Approval from both parties
4. Updated timeline and budget agreement

**No verbal agreements or chat messages constitute scope changes.**

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1 | 2026-01-02 | Brent | Initial scope document |
| v2 | 2026-01-02 | Chi/Roderic | Added metrics, blocker documentation, roadmap items, acceptance criteria |
