# ABBY MVP Scope Reconciliation

**Date:** 2026-01-13
**Purpose:** Objective analysis of disputed "Above & Beyond" items against original Nov 10, 2025 scope documents
**Analyst:** Chi (AI CTO)

---

## Executive Summary

After reviewing the four original scope documents against the "True-Up" disputed items, I find:

| Category | Verdict |
|----------|---------|
| **Onboarding Flow (5 screens)** | ✅ **IN ORIGINAL SCOPE** |
| **Authentication System** | ⚠️ **PARTIALLY IN SCOPE** - UI was in scope, full Cognito flow was above |
| **Full App Experience (5 screens)** | ⚠️ **PARTIALLY IN SCOPE** - Match flow was in scope, Coach mode maps to Premium |
| **Technical Infrastructure** | ❌ **ABOVE & BEYOND** - Professional best practice, not explicitly required |
| **Backend/Business Logic** | ❌ **ABOVE & BEYOND** - Explicitly excluded in original scope |
| **Quality Assurance (399 tests)** | ❌ **ABOVE & BEYOND** - Not mentioned in original scope |
| **Security & Compliance** | ⚠️ **PARTIALLY ABOVE** - Date picker exceeds "checkbox" requirement |

---

## Detailed Analysis

### 1. Onboarding Flow (5 screens) - ✅ IN ORIGINAL SCOPE

**Disputed items:**
- Gender/identity selection
- Location and distance preferences
- Relationship type selection
- Age and ethnicity preferences
- Smoking preference
- Permission requests

**Nov 10 Spec explicitly states (Index II):**
> "Start with questions screen: Full legal Name, Preferred name, Email, Phone number, DOB, **Gender (provide a list of multiple choice), Orientation, Identity, Relationship**, Height, Body type, **Ethnicity, Smoking** (needs to be "yes, no"), **Location (GPS)**"

**VERDICT:** Manny is correct. All these items were explicitly listed in the November 10 specification. This is NOT above and beyond.

---

### 2. Authentication System (5 screens) - ⚠️ PARTIALLY IN SCOPE

**Disputed items:**
- Login with social auth options
- Email verification with 6-digit code
- Phone verification with SMS
- Session persistence
- Token management
- Full AWS Cognito auth flow

**Nov 10 Spec states:**
> "Send Verification Code **(UI only)**"
> "(data storage to be provided by backend database)"

**What was explicitly IN SCOPE:**
- Email and Phone collection screens
- Verification code UI screens

**What was NOT specified:**
- Social auth options (not mentioned)
- Full AWS Cognito implementation
- Token management logic
- Session persistence

**VERDICT:** The **UI screens** for verification were in scope. However, the **full AWS Cognito auth flow** with token management and session persistence goes beyond "UI only" as specified. The original scope said "(data storage to be provided by backend database)" - indicating the frontend was supposed to build UI, not full auth logic.

**Fair allocation:**
- 2 screens (email/phone verification UI) = IN SCOPE
- 3 screens + Cognito integration = ABOVE & BEYOND

---

### 3. Full App Experience (5 additional screens) - ⚠️ PARTIALLY IN SCOPE

**Disputed items:**
- Coach introduction sequence
- Match searching animation
- Match reveal (bio)
- Payment gate
- Photo reveal after payment
- Ongoing coach mode

**Nov 10 Spec states:**

**Match Flow (IN SCOPE):**
> "Match Found Workflow: When a match is identified... Abby shows: Two public photos (headshot + full-body). One personalized paragraph describing why she believes this woman is a great match"
> "Step 4 – Payment Gate (Required for Conversation or Phone Exchange)"
> "If both accept, Abby celebrates the connection and transitions to permission phase (private photo sharing)"

**Coach/Premium (DISPUTED):**
The True-Up doc itself states:
> "Premium subscription screens - **not on the initial 18 screens presented in Nov as requirements so roadmap not MVP**"

BUT the Nov 10 spec Index II includes:
> "💛 The Gold Experience – Dating with Confidence... I become your personal dating coach"
> "💎 The Platinum Experience – Elite, Personalized Matchmaking"

**VERDICT:**
- Match reveal, payment gate, photo reveal = **IN SCOPE** (explicitly in Match Found Workflow)
- Coach mode = **AMBIGUOUS** - Premium subscriptions were described in detail in Nov 10 spec, but True-Up doc says "not on initial 18 screens"

**Fair allocation:**
- Match flow screens (3) = IN SCOPE
- Coach intro + ongoing coach (2) = Could go either way - needs client clarification

---

### 4. Technical Infrastructure - ❌ ABOVE & BEYOND

**Disputed items:**
- Type-safe API client (ready for your backend)
- Mock service layer (for development)
- State management (Zustand)
- Token refresh logic & session persistence
- Automatic mock/real API switching

**Nov 10 Spec states:**
> "**Technical Foundation**: Screen flows and UI states, UX transitions, **Placeholder API bindings**, Demo-ready TestFlight build"
>
> "**It excluded the following**: Backend architecture or API development"

**VERDICT:** The spec called for "Placeholder API bindings" - not a full type-safe API client with mock service layer. These are professional best practices that make the app more maintainable, but they were NOT explicitly required.

This is legitimately **ABOVE & BEYOND** the stated requirements.

---

### 5. Backend/Business Logic - ❌ ABOVE & BEYOND

**Disputed items:**
- Credit accounting system design
- Promotion logic (free matches, bundles, packages)
- Certification & verification flow design
- Match consumption logic
- API debugging
- 399 automated tests

**Nov 10 Spec EXPLICITLY EXCLUDES:**
> "It excluded the following:
> - Backend architecture or API development
> - Data persistence logic
> - **Credit/payment accounting engines**
> - Subscription or billing logic"

**VERDICT:** The original scope explicitly says "Credit/payment accounting engines" is EXCLUDED from frontend work. This is clearly **ABOVE & BEYOND**.

---

### 6. Quality Assurance (399 tests) - ❌ ABOVE & BEYOND

**Nov 10 Spec:** No mention of test requirements, test coverage, or automated testing.

**VERDICT:** Professional best practice, not required. Legitimately **ABOVE & BEYOND**.

---

### 7. Security & Compliance - ⚠️ PARTIALLY ABOVE & BEYOND

**Disputed items:**
- 18+ age verification with date picker (not just checkbox)
- GDPR delete account functionality
- Input validation with maxLength on all fields
- Console statements gated behind __DEV__
- Secure token storage

**Nov 10 Spec states:**
> "Checkbox: 'I am over 18'"

**VERDICT:**
- Date picker instead of checkbox = **ABOVE & BEYOND** (spec said checkbox)
- GDPR delete = **ABOVE & BEYOND** (not mentioned)
- Input validation, console gating, secure storage = Professional practices, **ABOVE & BEYOND**

---

## Summary Table

| Item | Nov 10 Spec Says | Verdict |
|------|------------------|---------|
| Gender/Orientation/Identity screens | "Gender (multiple choice), Orientation, Identity" | ✅ IN SCOPE |
| Location/Relationship/Ethnicity screens | Explicitly listed | ✅ IN SCOPE |
| Smoking preference | "Smoking (yes/no)" | ✅ IN SCOPE |
| Verification UI screens | "Send Verification Code (UI only)" | ✅ IN SCOPE |
| Match reveal + payment gate | Detailed in Match Found Workflow | ✅ IN SCOPE |
| Photo reveal after payment | "private photos become visible" | ✅ IN SCOPE |
| Full Cognito auth flow | "UI only" + "data by backend" | ❌ ABOVE |
| Token management + session | Not mentioned | ❌ ABOVE |
| Coach intro/ongoing mode | In Premium section, but "not in 18 screens" | ⚠️ AMBIGUOUS |
| Type-safe API client | "Placeholder API bindings" | ❌ ABOVE |
| Mock service layer | Not mentioned | ❌ ABOVE |
| Credit accounting design | "EXCLUDED" explicitly | ❌ ABOVE |
| 399 automated tests | Not mentioned | ❌ ABOVE |
| Date picker vs checkbox | "Checkbox" specified | ❌ ABOVE |
| GDPR delete | Not mentioned | ❌ ABOVE |

---

## Recommendations for Brent

### Items Manny is CORRECT about (should NOT be disputed):
1. **All onboarding screens** (gender, orientation, identity, ethnicity, smoking, location, relationship) - These were explicitly in the Nov 10 spec
2. **Match flow screens** (reveal, payment gate, photo reveal) - Explicitly described

### Items that ARE legitimately Above & Beyond:
1. Full AWS Cognito integration (spec said "UI only")
2. Type-safe API client + mock service layer (spec said "placeholder bindings")
3. Credit accounting system design (spec explicitly excluded)
4. 399 automated tests (not mentioned)
5. Date picker instead of checkbox for 18+ verification
6. GDPR delete functionality

### Ambiguous items (need client clarification):
1. Coach mode screens - Premium tiers are described in Nov 10 spec, but True-Up says "not in initial 18 screens"

---

## Key Quote for Dispute Resolution

The strongest argument for Manny on the onboarding screens comes directly from the Nov 10 spec Index II:

> "Start with questions screen: Full legal Name, Preferred name, Email, Phone number, DOB, Gender (provide a list of multiple choice), Orientation, Identity, Relationship, Height, Body type, Ethnicity, Smoking (needs to be 'yes, no'), Location (GPS)"

This explicitly lists gender, orientation, identity, relationship, ethnicity, and smoking as required intake fields. Claiming these as "above and beyond" is not supported by the original documentation.
