# ABBY - API Contracts

**Product Name:** ABBY - The Anti-Dating App
**Version:** 1.0 MVP
**Last Updated:** January 2, 2026
**References:** PRD.md, DATA-MODEL.md

---

## Overview

This document defines the API contracts for ABBY MVP.

> **Implementation Note (2026-01-02):** Original spec documented Nathan's planned backend. MVP uses client's backend (dev.api.myaimatchmaker.ai) with AWS Cognito for auth. See API docs: https://dev.api.myaimatchmaker.ai/docs#/

**Base URL:** `https://dev.api.myaimatchmaker.ai/v1`

---

## Authentication (AWS Cognito)

### Current Implementation

Auth is handled via AWS Cognito SDK (`amazon-cognito-identity-js`), NOT REST API endpoints.

**Configuration:**
```typescript
const poolData = {
  UserPoolId: 'us-east-1_l3JxaWpl5',
  ClientId: '2ljj7mif1k7jjc2ajiq676fhm1',
};
```

### AuthService Methods

| Method | Purpose | Status |
|--------|---------|--------|
| `signup(email, password, name)` | Create new account | ✅ Implemented |
| `verify(username, code)` | Verify email with 6-digit code | ✅ Implemented |
| `resendVerificationCode(username)` | Resend verification code | ✅ Implemented |
| `login(email, password)` | Authenticate user | ✅ Implemented |
| `refreshToken()` | Refresh access token | ✅ Implemented (not called) |
| `logout()` | Clear tokens | ✅ Implemented |
| `isAuthenticated()` | Check auth status | ✅ Implemented |
| `getAccessToken()` | Get current token | ✅ Implemented |

### Token Response

```typescript
{
  accessToken: string;   // 1 hour expiration
  idToken: string;       // User claims
  refreshToken: string;  // 30 days expiration
  expiresIn: number;     // Seconds
  tokenType: 'Bearer';
}
```

---

## ~~Phone/Social Auth~~ (V2 - Not Implemented)

These endpoints were in the original spec but are NOT implemented in MVP:

```
❌ POST /auth/phone/send     - Send phone verification code
❌ POST /auth/phone/verify   - Verify phone code
❌ POST /auth/social         - Apple/Google/Facebook login
```

---

## API Headers

All authenticated endpoints require:

```
Authorization: Bearer <cognito_access_token>
Content-Type: application/json
```

---

## Voice Integration (OpenAI Realtime API)

### GET /abby/realtime/available

Check if voice API is available.

**Response (200):**
```typescript
{
  available: boolean;
}
```

**Implementation:** `AbbyRealtimeService.checkAvailability()`

---

### POST /abby/realtime/session

Create a new voice session.

**Request:**
```typescript
{
  screenType?: 'intro' | 'coach';
}
```

**Response (200):**
```typescript
{
  sessionId: string;
  wsUrl?: string;           // WebSocket URL (V2)
  rtcConfig?: RTCConfiguration;  // WebRTC config (V2)
  expiresAt: string;
}
```

**Implementation:** `AbbyRealtimeService.startConversation()`

---

### POST /abby/session/{sessionId}/end

End a voice session.

**Response (200):**
```typescript
{
  success: true;
}
```

**Implementation:** `AbbyRealtimeService.endConversation()`

---

### POST /abby/realtime/{sessionId}/message

Send text message to Abby during voice session.

**Request:**
```typescript
{
  message: string;
  userId?: string;
}
```

**Response (200):**
```typescript
{
  response: string;
  sessionId: string;
}
```

**Implementation:** `AbbyRealtimeService.sendTextMessage()`

---

### GET /abby/memory/context

Get conversation context/memory for user.

**Response (200):**
```typescript
{
  context: string;
  lastInteraction?: string;
}
```

---

## User Profile

### GET /me

Get current authenticated user info.

**Response (200):**
```typescript
{
  id: string;
  email: string;
  // Additional fields TBD
}
```

---

### POST /profile/public

Update public profile information.

**Request:**
```typescript
{
  name: string;
  dateOfBirth: string;      // ISO 8601
  gender: 'man' | 'woman';
  seekingGenders: string[];
  ethnicity: string;
  ethnicityPrefs: string[];
  relationshipType: string;
  smokingPref: string;
  location: {
    latitude: number;
    longitude: number;
  };
}
```

> **Gap Identified:** This endpoint exists but `getProfilePayload()` in `useOnboardingStore` is never called. Profile data collected during onboarding is NOT submitted to backend.

---

## Questions

### GET /questions

Get all questions for interview flow.

**Response (200):**
```typescript
{
  questions: Array<{
    id: string;
    category: string;
    text: string;
    type: 'choice' | 'multi_choice' | 'scale' | 'text';
    options?: Array<{ id: string; text: string }>;
    required: boolean;
  }>;
}
```

---

### POST /answers

Submit answer to a question.

**Request:**
```typescript
{
  questionId: string;
  answer: any;  // Type depends on question type
}
```

**Response (200):**
```typescript
{
  success: true;
}
```

---

## Matches

### GET /matches/candidates

Get list of potential matches (users interested in you).

**Response (200):**
```typescript
{
  candidates: Array<{
    id: string;
    name: string;
    bio: string;
    compatibilityScore: number;
  }>;
}
```

> **Gap Identified:** `MatchesScreen.tsx` has TODO: "Integrate with /v1/matches/candidates API"

---

### GET /matches/{matchId}

Get details of a specific match.

**Response (200):**
```typescript
{
  id: string;
  name: string;
  bio: string;
  photos?: string[];  // Only after payment/reveal
  compatibilityScore: number;
}
```

---

## Photos

### POST /photos/upload

Upload user photo.

**Request:**
```
Content-Type: multipart/form-data

photo: File
position: number (0-5)
```

**Response (200):**
```typescript
{
  photoId: string;
  url: string;
}
```

---

### DELETE /photos/{photoId}

Delete a photo.

**Response (200):**
```typescript
{
  success: true;
}
```

---

## Implementation Status

| Endpoint | Service | Status |
|----------|---------|--------|
| Cognito SDK | `AuthService.ts` | ✅ Full implementation |
| `/abby/realtime/*` | `AbbyRealtimeService.ts` | ✅ With demo fallback |
| `/profile/public` | `useOnboardingStore.ts` | ⚠️ Payload built, never called |
| `/questions/*` | `QuestionsService.ts` | ⚠️ Using local JSON |
| `/answers` | - | ❌ Not integrated |
| `/matches/*` | `MatchesScreen.tsx` | ❌ TODO |
| `/photos/*` | `PhotosScreen.tsx` | ❌ Not integrated |

---

## Error Response Format

All API errors follow this structure:

```typescript
{
  error: string;           // Error code
  message: string;         // Human-readable message
  details?: object;        // Additional context
}
```

---

## Security

All API calls use `secureFetch.ts`:
- 20 second timeout for voice operations
- 5 second timeout for availability checks
- Error messages sanitized (no internal details)
- Tokens stored in expo-secure-store

---

## ~~Original Spec (Deprecated)~~

The following endpoints were in the original spec (Nathan's backend) but are NOT implemented:

```
❌ POST /auth/phone/send
❌ POST /auth/phone/verify
❌ POST /auth/social
❌ POST /voice/transcribe
❌ POST /voice/conversation (ElevenLabs - replaced by OpenAI)
❌ POST /interview/start
❌ POST /interview/answer
❌ POST /interview/skip
❌ GET /interview/resume
❌ GET /interview/progress
❌ GET /app/config
```

---

*Document created: December 20, 2024*
*Last updated: January 2, 2026*
