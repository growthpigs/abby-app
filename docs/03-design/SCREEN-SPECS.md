# SCREEN-SPECS.md - ABBY Screen Inventory & Gap Analysis

**Last Updated:** 2026-01-02
**Status:** Audit Complete - Gaps Identified

---

## Executive Summary

**Current State:** 28 screens implemented
**Client Requirement:** ~40+ screens (based on design doc + spreadsheet analysis)
**Critical Gaps:** Phone auth, social auth, profile editing, certification, Main Street hub

---

## 1. Current Screen Inventory (28 Total)

### Auth/Onboarding Flow (14 screens)

| # | Screen | File | Status | Client Required |
|---|--------|------|--------|-----------------|
| 1 | Login/Signup Selection | `LoginScreen.tsx` | ✅ Implemented | ✅ Yes |
| 2 | Sign In (returning user) | `SignInScreen.tsx` | ✅ Implemented | ✅ Yes |
| 3 | Name Entry | `NameScreen.tsx` | ✅ Implemented | ✅ Yes |
| 4 | Email Entry | `EmailScreen.tsx` | ✅ Implemented | ✅ Yes |
| 5 | Password Creation | `PasswordScreen.tsx` | ✅ Implemented | ✅ Yes |
| 6 | Email Verification | `EmailVerificationScreen.tsx` | ✅ Implemented | ⚠️ Client wants phone |
| 7 | Date of Birth | `DOBScreen.tsx` | ✅ Implemented | ✅ Yes |
| 8 | Permissions | `PermissionsScreen.tsx` | ✅ Implemented | ✅ Yes |
| 9 | Gender Identity | `BasicsGenderScreen.tsx` | ✅ Implemented | ✅ Yes |
| 10 | Dating Preferences | `BasicsPreferencesScreen.tsx` | ✅ Implemented | ✅ Yes |
| 11 | Ethnicity | `EthnicityScreen.tsx` | ✅ Implemented | ❌ Not in client doc |
| 12 | Ethnicity Preference | `EthnicityPreferenceScreen.tsx` | ✅ Implemented | ❌ Not in client doc |
| 13 | Relationship Type | `BasicsRelationshipScreen.tsx` | ✅ Implemented | ❌ Not in client doc |
| 14 | Smoking | `SmokingScreen.tsx` | ✅ Implemented | ❌ Not in client doc |

### Main App Flow (7 screens)

| # | Screen | File | Status | Client Required |
|---|--------|------|--------|-----------------|
| 15 | Coach Intro | `CoachIntroScreen.tsx` | ✅ Implemented | ✅ Yes |
| 16 | Interview/Questions | `InterviewScreen.tsx` | ✅ Implemented | ✅ Yes |
| 17 | Searching | `SearchingScreen.tsx` | ✅ Implemented | ✅ Yes |
| 18 | Match Bio | `MatchScreen.tsx` | ✅ Implemented | ✅ Yes |
| 19 | Payment Gate | `PaymentScreen.tsx` | ✅ Mock Only | ✅ Yes |
| 20 | Photo Reveal | `RevealScreen.tsx` | ✅ Implemented | ✅ Yes |
| 21 | Coach Mode | `CoachScreen.tsx` | ✅ Implemented | ✅ Yes |

### Menu/Settings Screens (4 screens)

| # | Screen | File | Status | Client Required |
|---|--------|------|--------|-----------------|
| 22 | Settings | `SettingsScreen.tsx` | ✅ Implemented | ✅ Yes |
| 23 | Photos | `PhotosScreen.tsx` | ⚠️ Stub Only | ✅ Yes (detail view missing) |
| 24 | Matches List | `MatchesScreen.tsx` | ⚠️ No API | ✅ Yes |
| 25 | Loading | `LoadingScreen.tsx` | ✅ Implemented | N/A |
| 26 | Basics Location | `BasicsLocationScreen.tsx` | ✅ Implemented | ✅ Yes |

### Orphaned Screens (2 - Not Exported)

| # | Screen | File | Status | Notes |
|---|--------|------|--------|-------|
| 27 | Phone Number | `PhoneNumberScreen.tsx` | ❌ Orphaned | Was for phone auth |
| 28 | Verification Code | `VerificationCodeScreen.tsx` | ❌ Orphaned | Was for phone auth |

---

## 2. Client Requirements (From Design Docs)

### Source: "Abby Fluid UI Screens" Google Doc (17 pages)

| Page | Screen | Status |
|------|--------|--------|
| 1-2 | Splash/Welcome | ✅ Have (LoginScreen) |
| 3 | Login Method Selection | ⚠️ Missing social auth buttons |
| 4 | Pricing ($49 PRO, $99 ELITE) | ❌ Missing |
| 5-6 | Registration (Phone + Email) | ⚠️ Have email only |
| 7 | Permissions | ✅ Have |
| 8-9 | Basics (Gender, Relationship, Location) | ✅ Have |
| 10 | Non-Monogamy Options | ❌ Missing |
| 11 | **Main Hub ("Main Street")** | ❌ Missing (using hamburger menu) |
| 12 | Match Reveal | ✅ Have |
| 13 | My Photos (grid + detail) | ⚠️ Have grid, missing detail |
| 14 | Payments (cards, history) | ❌ Missing (have mock only) |
| 15 | System Settings | ⚠️ Minimal (input mode only) |
| 16 | Profile Screen | ❌ Missing |
| 17 | Memberships/Tiers | ❌ Missing |
| 18 | Matches Dashboard | ⚠️ Have list, no API |
| 19 | Text Chat | ❌ Missing |
| 20 | Certification | ❌ Missing |

### Source: "pre-onboarding Screens.xlsx" Spreadsheet

| Screen | Client Requirement | Status |
|--------|-------------------|--------|
| Screen 1 | Welcome | ✅ Have |
| Screen 2 | Login Method | ⚠️ **Missing phone + social** |
| | - Phone Number (REQUIRED) | ❌ Orphaned, not connected |
| | - Email (REQUIRED) | ✅ Have |
| | - Continue w/ Apple | ❌ Missing |
| | - Continue w/ Facebook | ❌ Missing |
| | - Continue w/ Google | ❌ Missing |
| Screen 3 | Phone Verification | ❌ Orphaned, not connected |
| Screen 4 | Name (full + nickname) | ⚠️ Have full, missing nickname |
| Screen 5 | DOB + Age Range Slider | ⚠️ Have DOB, missing slider |
| Screen 6 | Sexual Identity (10+ options) | ⚠️ Have 2 options only |
| Screen 7 | Sexual Preference | ✅ Have |

---

## 3. Critical Gap Analysis

### SEVERITY: CRITICAL (Legal/Blocking)

#### Gap 1: Phone Number Authentication - Client REQUIRED
**Client Says:** "Ph Number (required)" with 6-digit verification
**We Have:** Email/password only via Cognito
**Impact:** Client's explicit requirement not met

**Files to Update:**
- `src/components/screens/PhoneNumberScreen.tsx` - exists but orphaned
- `src/components/screens/VerificationCodeScreen.tsx` - exists but orphaned
- `src/components/screens/index.ts` - add exports
- `App.tsx` - add to AUTH_ORDER

#### Gap 2: Social Authentication - Client REQUIRED
**Client Says:** "Continue w/ Apple, Facebook, Google" (1 choice each)
**We Have:** Nothing
**Impact:** Client's explicit requirement not met

**Files to Create:**
- None needed at service level (Cognito supports it)
- `LoginScreen.tsx` needs social auth buttons
- `AuthService.ts` needs social auth methods

#### Gap 3: Age Verification - Legal Requirement
**Issue:** Self-reported DOB only, no ID verification
**Legal Risk:** Under-18 access liability (App Store guidelines)

**Recommendation:** Add Socure/Jumio integration or similar

#### Gap 4: GDPR/CCPA Data Deletion - Legal Requirement
**Issue:** No "Delete My Data" option anywhere
**Legal Risk:** Illegal to operate in EU without this

**Files to Create:**
- Add delete option to `SettingsScreen.tsx`
- Add DELETE /v1/profile endpoint call

### SEVERITY: HIGH (UX Dead Ends)

#### Gap 5: No Profile Edit After Onboarding
**Issue:** Users can't change name, preferences, etc. after completing signup
**User Impact:** Stuck with initial answers forever

**Files to Create:**
- `ProfileScreen.tsx` or `EditProfileScreen.tsx`
- Add to hamburger menu

#### Gap 6: Main Street Hub - Client Design
**Client Shows:** Central hub with navigation buttons (My Matches, Coach, Settings, Photos)
**We Have:** Hamburger menu (3 lines) in corner

**Decision Needed:** Is hamburger acceptable or must we match "Main Street" design?

#### Gap 7: Post-Match Flow Dead End
**Issue:** After RevealScreen, no clear next step
**User sees:** Match photo, then... nothing?

**Files to Update:**
- `RevealScreen.tsx` - add "Message" or "Next Match" button
- Define post-reveal navigation

### SEVERITY: MEDIUM (Technical Debt)

#### Gap 8: Profile Data Never Submitted
**Issue:** `getProfilePayload()` in useOnboardingStore builds payload but it's never called
**Impact:** Backend never receives profile data

**Files to Fix:**
- Call `getProfilePayload()` after onboarding completes
- POST to `/v1/profile/public`

#### Gap 9: Token Refresh Not Integrated
**Issue:** `AuthService.refreshToken()` exists but never called
**Impact:** Session expires after 1 hour, user gets API errors

#### Gap 10: No State Persistence
**Issue:** If app crashes mid-onboarding, user starts over
**Impact:** Poor UX, lost data

---

## 4. Screen-by-Screen Decision Matrix

| Screen | Current | Client Wants | Action |
|--------|---------|--------------|--------|
| PhoneNumberScreen | Orphaned | Required | **Wire back into auth flow** |
| VerificationCodeScreen | Orphaned | Required | **Wire back into auth flow** |
| Social Auth | Missing | Required | **Add to LoginScreen** |
| 18+ Checkbox | Missing | Required | **Add to DOBScreen or PermissionsScreen** |
| ProfileScreen | Missing | Required | **Create new screen** |
| Main Street Hub | Missing | In design | **Discuss with client** |
| Pricing/Tiers | Missing | In design | **V2 or MVP?** |
| Certification | Missing | In design | **V2 feature** |
| Text Chat | Missing | In design | **V2 feature** |
| Photo Detail View | Missing | In design | **Add to PhotosScreen** |
| Nickname Field | Missing | Required | **Add to NameScreen** |
| Age Range Slider | Missing | Required | **Add to DOBScreen** |
| 10 Gender Options | Missing | Required | **Expand BasicsGenderScreen** |
| Non-Mono Options | Missing | In design | **Create new screen** |

---

## 5. Prioritized Action Plan

### Phase 1: Wire Orphaned Screens (1 day)
1. Export `PhoneNumberScreen` and `VerificationCodeScreen` in index.ts
2. Add to AUTH_ORDER in App.tsx (optional path alongside email)
3. Connect to backend phone verification endpoint

### Phase 2: Add Social Auth (1-2 days)
1. Add Apple/Google/Facebook buttons to LoginScreen
2. Implement `AuthService.loginWithSocial()` methods
3. Configure Cognito identity providers

### Phase 3: Critical UX Fixes (2-3 days)
1. Create ProfileScreen (edit name, preferences)
2. Add "Delete My Data" to SettingsScreen
3. Add 18+ checkbox to DOBScreen
4. Fix post-reveal navigation dead end

### Phase 4: Client Design Alignment (TBD)
1. Discuss Main Street hub vs hamburger menu
2. Confirm MVP scope for pricing/membership screens
3. Confirm V2 scope for certification, chat

---

## 6. Files Changed in This Audit

| File | Change |
|------|--------|
| `docs/03-design/SCREEN-SPECS.md` | Created (this file) |
| `features/INDEX.md` | Updated status (already done) |
| `features/onboarding-auth-spec.md` | Updated to reflect Cognito (already done) |

---

## 7. Questions for Client

1. **Phone vs Email Auth:** Client spreadsheet says phone is REQUIRED. Current implementation is email-only. Is email acceptable for MVP, or must we add phone?

2. **Social Auth:** Design shows Apple/Facebook/Google. These are V2 or MVP requirement?

3. **Main Street Hub:** Design shows central navigation hub. We use hamburger menu. Is this acceptable?

4. **Pricing Tiers:** Design shows $49 PRO / $99 ELITE. When is this needed?

5. **Certification:** Design shows ID verification. Confirmed V2?

---

## Appendix A: Complete File List

```
src/components/screens/
├── BasicsGenderScreen.tsx      ✅ Implemented
├── BasicsLocationScreen.tsx    ✅ Implemented
├── BasicsPreferencesScreen.tsx ✅ Implemented
├── BasicsRelationshipScreen.tsx ✅ Implemented
├── CoachIntroScreen.tsx        ✅ Implemented
├── CoachScreen.tsx             ✅ Implemented
├── DOBScreen.tsx               ⚠️ Missing age slider
├── EmailScreen.tsx             ✅ Implemented
├── EmailVerificationScreen.tsx ✅ Implemented
├── EthnicityPreferenceScreen.tsx ✅ Implemented
├── EthnicityScreen.tsx         ✅ Implemented
├── InterviewScreen.tsx         ✅ Implemented
├── LoadingScreen.tsx           ✅ Implemented
├── LoginScreen.tsx             ⚠️ Missing social auth
├── MatchScreen.tsx             ✅ Implemented
├── MatchesScreen.tsx           ⚠️ No API integration
├── NameScreen.tsx              ⚠️ Missing nickname
├── PasswordScreen.tsx          ✅ Implemented
├── PaymentScreen.tsx           ⚠️ Mock only
├── PermissionsScreen.tsx       ⚠️ Missing 18+ checkbox
├── PhoneNumberScreen.tsx       ❌ Orphaned
├── PhotosScreen.tsx            ⚠️ Missing detail view
├── RevealScreen.tsx            ⚠️ Dead end after
├── SearchingScreen.tsx         ✅ Implemented
├── SettingsScreen.tsx          ⚠️ Missing GDPR delete
├── SignInScreen.tsx            ✅ Implemented
├── SmokingScreen.tsx           ✅ Implemented
└── VerificationCodeScreen.tsx  ❌ Orphaned
└── index.ts                    ⚠️ Missing 2 exports
```

---

## Appendix B: Agent Analysis Sources

This audit was performed using three parallel analysis agents:

1. **Explorer Agent:** Codebase traversal, orphan detection, file inventory
2. **Superpower Agent:** UX/Legal/Technical gap identification
3. **Brainstorm Agent:** Root cause analysis of design vs implementation gaps

**Confidence Level:** 9/10 (comprehensive codebase + client doc analysis)

---

*Document created: January 2, 2026*
*Last updated: January 2, 2026*
