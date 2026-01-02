# ABBY - Data Model

**Product Name:** ABBY - The Anti-Dating App
**Version:** 1.0 MVP
**Last Updated:** January 2, 2026
**References:** PRD.md (US-001 through US-012)

---

## Overview

This document defines the data entities, relationships, and storage strategy for ABBY MVP.

> **Implementation Note (2026-01-02):** MVP uses AWS Cognito for auth and client backend (dev.api.myaimatchmaker.ai) for API. Local storage uses Zustand + AsyncStorage. Phone/social auth deferred to V2.

---

## Entities

### User

Core user profile information collected during onboarding (US-001, US-002).

> **Implementation Note (2026-01-02):** Auth is via AWS Cognito. The `username` field is the Cognito user sub (UUID). Phone/social auth fields exist in schema but are V2.

| Field | Type | Required | Description | Status |
|-------|------|----------|-------------|--------|
| id | UUID | Yes | Primary key (Cognito userSub) | ✅ Implemented |
| email | string | Yes | Primary auth method | ✅ Implemented |
| ~~phoneNumber~~ | ~~string~~ | ~~Yes~~ | ~~Primary auth~~ | ❌ V2 |
| ~~authProvider~~ | ~~enum~~ | ~~Yes~~ | ~~phone/apple/google/facebook~~ | ❌ V2 |
| fullName | string | Yes | User's name | ✅ Implemented |
| ~~displayName~~ | ~~string~~ | ~~Yes~~ | ~~Public name~~ | ❌ V2 (nickname) |
| dateOfBirth | Date | Yes | For age calculation | ✅ Implemented |
| ~~preferredAgeMin~~ | ~~number~~ | ~~Yes~~ | ~~Min age preference~~ | ❌ V2 (slider) |
| ~~preferredAgeMax~~ | ~~number~~ | ~~Yes~~ | ~~Max age preference~~ | ❌ V2 (slider) |
| gender | enum | Yes | User's gender (man/woman) | ✅ Implemented (2 options) |
| seekingGenders | enum[] | Yes | Who they're looking for | ✅ Implemented |
| ethnicity | enum | Yes | User's ethnicity | ✅ Implemented |
| ethnicityPrefs | enum[] | No | Preferences | ✅ Implemented |
| relationshipType | enum | Yes | serious / casual / unsure | ✅ Implemented |
| smokingPref | enum | Yes | Smoking preference | ✅ Implemented |
| location | object | Yes | Latitude/longitude | ✅ Implemented |
| createdAt | DateTime | Yes | Account creation | ✅ Via Cognito |
| lastActiveAt | DateTime | Yes | Last app usage | ⚠️ Not tracked |
| interviewStatus | enum | Yes | not_started / in_progress / completed | ⚠️ Local only |

**Enum: Gender (Current - 2 options)**
```
man | woman
```

**Enum: Gender (V2 - 10+ options per client spec)**
```
male | female | non_binary | transgender_male | transgender_female |
genderqueer | agender | two_spirit | other | prefer_not_to_say
```

**Enum: Ethnicity**
```
white | black | hispanic_latino | asian | south_asian | middle_eastern |
native_american | pacific_islander | mixed | other | prefer_not_to_say
```

---

### InterviewSession

Tracks interview progress for resume capability (US-005).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| userId | UUID | Yes | Foreign key to User |
| startedAt | DateTime | Yes | When session began |
| lastUpdatedAt | DateTime | Yes | Last activity timestamp |
| currentQuestionId | string | Yes | Current question in flow |
| completedQuestions | number | Yes | Count of completed questions |
| totalQuestions | number | Yes | Total questions in flow |
| status | enum | Yes | active / paused / completed / abandoned |
| expiresAt | DateTime | Yes | Draft expires after 7 days |

---

### InterviewResponse

Individual question answers (US-005, US-007).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| sessionId | UUID | Yes | Foreign key to InterviewSession |
| userId | UUID | Yes | Foreign key to User |
| questionId | string | Yes | Question identifier from questions.json |
| questionType | enum | Yes | choice / multi_choice / scale / text / picturegram |
| answer | JSON | Yes | Flexible answer storage |
| answerMethod | enum | Yes | touch / voice |
| confidence | float | No | 0-1 how certain user seemed (voice analysis) |
| skipped | boolean | Yes | If user skipped this question |
| timestamp | DateTime | Yes | When answered |
| voiceTranscript | string | No | Raw voice transcription if applicable |

**Answer JSON Examples:**
```typescript
// choice
{ "selected": "option_a" }

// multi_choice
{ "selected": ["option_a", "option_c"] }

// scale
{ "value": 7, "min": 0, "max": 10 }

// text
{ "text": "I value honesty above all..." }

// picturegram
{ "categories": ["athletic", "curvy"], "weights": [0.8, 0.6] }
```

---

### Question (Static - from questions.json)

Question definitions loaded from local JSON (not a database table).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique question identifier |
| category | string | Yes | Question category (values, lifestyle, physical, etc.) |
| vibeState | enum | Yes | TRUST / DEEP / CAUTION / PASSION / GROWTH |
| type | enum | Yes | choice / multi_choice / scale / text / picturegram |
| text | string | Yes | Question text for display |
| voiceText | string | No | Alternative text for Abby to speak |
| options | Option[] | No | For choice/multi_choice types |
| scaleMin | number | No | For scale type |
| scaleMax | number | No | For scale type |
| scaleLabels | string[] | No | Labels for scale endpoints |
| required | boolean | Yes | If question can be skipped |
| followUpQuestions | string[] | No | Conditional follow-up question IDs |

---

### AppState (Local Only)

Zustand store state - persisted to AsyncStorage.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| hubState | enum | Yes | Current app state machine position |
| vibeState | enum | Yes | Current vibe for VibeMatrix |
| user | User | No | Current user if authenticated |
| sessionId | UUID | No | Current interview session |
| orbPosition | enum | Yes | centered / docked / hidden |
| orbState | enum | Yes | breathing / active / thinking / listening / speaking |
| voiceEnabled | boolean | Yes | If voice mode is active |
| lowPowerMode | boolean | Yes | If shaders should be disabled |

**Enum: HubState**
```
SPLASH | ONBOARDING | MEETING_ABBY | INTERVIEW | INTERVIEW_COMPLETE
```

**Enum: VibeState**
```
TRUST | DEEP | CAUTION | PASSION | GROWTH | ALERT
```

---

## Relationships

```
User 1──────* InterviewSession (one user, many sessions over time)
InterviewSession 1──────* InterviewResponse (one session, many responses)
User 1──────* InterviewResponse (denormalized for quick queries)
```

---

## Storage Strategy

### MVP (Current Implementation)

| Data | Storage | Persistence | Status |
|------|---------|-------------|--------|
| Auth tokens | expo-secure-store | Permanent | ✅ TokenManager |
| Onboarding data | Zustand (memory) | Session only | ⚠️ Not persisted |
| Settings (input mode) | AsyncStorage | Permanent | ✅ useSettingsStore |
| Demo state | Zustand (memory) | Session only | ⚠️ Not persisted |
| Interview progress | Zustand (memory) | Session only | ⚠️ Not persisted |
| Questions | Static JSON bundle | App binary | ✅ QuestionsService |

> **Gap Identified:** Interview progress and onboarding data are NOT persisted. If app crashes, user loses progress.

### Backend Integration (Client API)

| Data | API Endpoint | Status |
|------|--------------|--------|
| User profile | POST `/v1/profile/public` | ⚠️ Endpoint exists, not called |
| Questions | GET `/v1/questions/*` | ✅ Available |
| Answers | POST `/v1/answers` | ⚠️ Available, not integrated |
| Matches | GET `/v1/matches/candidates` | ⚠️ TODO in MatchesScreen |
| Photos | POST `/v1/photos/*` | ⚠️ Available, not integrated |
| Voice | POST `/v1/abby/realtime/session` | ✅ Demo mode fallback |

### Backend Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Auth | AWS Cognito | Email/password authentication |
| API | Client (dev.api.myaimatchmaker.ai) | REST API |
| Voice | OpenAI Realtime API (via client) | Voice conversations |
| ~~Database~~ | ~~Nathan's PostgreSQL~~ | ~~Replaced by client backend~~ |

---

## Security Considerations

1. **fullName** is private - never exposed in API responses to other users
2. **email** used only for auth, never shared (via Cognito)
3. **Auth tokens** stored in expo-secure-store (not AsyncStorage)
4. **voiceTranscript** may contain sensitive info - encrypt at rest
5. **Interview responses** contain intimate personal data - strict access controls
6. All data encrypted in transit (HTTPS) and at rest (AES-256)
7. **Console logs** gated with `__DEV__` to prevent sensitive data leakage
8. **secureFetch** utility sanitizes error messages to prevent internal detail exposure

### Security Implementation (Added 2026-01-02)

| Feature | File | Status |
|---------|------|--------|
| Token storage | `TokenManager.ts` | ✅ Uses expo-secure-store |
| Request timeouts | `secureFetch.ts` | ✅ 20s voice, 5s availability |
| Error sanitization | `secureFetch.ts` | ✅ No internal details exposed |
| Input validation | `validation.ts` | ✅ Email, password, DOB |
| Dev-only logging | All services | ✅ `__DEV__` gated |

---

*Document created: December 20, 2024*
*Last updated: January 2, 2026*
