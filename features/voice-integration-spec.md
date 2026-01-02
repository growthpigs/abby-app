# FEATURE SPEC: Voice Integration System

**What:** Real-time voice conversations with Abby using OpenAI Realtime API via client backend
**Who:** All app users who want to interact with Abby through voice instead of touch interface
**Why:** Core differentiator - creates intimate, natural conversations that feel like talking to a real matchmaker
**Status:** 🚧 Demo Mode (API integration ready, needs real API connection)

> **Architecture Decision (2026-01-02):** Using OpenAI Realtime API via client backend (dev.api.myaimatchmaker.ai). This replaced the original ElevenLabs plan. The client controls the API and AI model.

---

## Current Implementation

### Service: `AbbyRealtimeService.ts`

The voice system is implemented and falls back to demo mode when the API is unavailable.

**Key Files:**
- `src/services/AbbyRealtimeService.ts` - Main service with demo fallback
- `src/services/AbbyTTSService.ts` - Text-to-speech utilities

**React Hook:**
```typescript
import { useAbbyAgent } from '@/services/AbbyRealtimeService';

const {
  startConversation,
  endConversation,
  sendTextMessage,
  toggleMute,
  isConnected,
  isMuted,
  isSpeaking,
  isDemoMode,  // true when API unavailable
} = useAbbyAgent({
  enabled: true,
  screenType: 'intro' | 'coach',
  onAbbyResponse: (text) => {},
  onConnect: () => {},
  onDisconnect: () => {},
  onError: (error) => {},
});
```

---

## API Endpoints

**Base URL:** `https://dev.api.myaimatchmaker.ai/v1`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/abby/realtime/available` | GET | Check if API is available (health check) |
| `/abby/realtime/session` | POST | Create new voice session |
| `/abby/session/{id}/end` | POST | End voice session |
| `/abby/realtime/{session_id}/message` | POST | Send text message to Abby |
| `/abby/memory/context` | GET | Get conversation context/memory |

### Authentication

All endpoints require Bearer token:
```
Authorization: Bearer <cognito_access_token>
```

Token is managed by `TokenManager.ts` (Cognito integration).

### Response Types

```typescript
interface RealtimeSessionResponse {
  sessionId: string;
  wsUrl?: string;         // WebSocket URL if provided
  rtcConfig?: RTCConfiguration; // WebRTC config if provided
  expiresAt: string;
}

interface RealtimeMessageRequest {
  message: string;
  userId?: string;
}
```

---

## User Stories

**US-004: Voice Conversation with Abby**
As a user meeting Abby, I want to have a natural voice conversation so that it feels like talking to a real matchmaker.

Acceptance Criteria:
- [x] User can activate voice mode (CoachScreen, CoachIntroScreen)
- [x] Service falls back to demo mode when API unavailable
- [ ] Real-time voice latency under 500ms (requires real API)
- [x] User can switch between voice and text seamlessly
- [x] Clear visual feedback for connection state
- [x] Demo mode provides realistic conversation simulation

---

## Demo Mode

When the API is unavailable, the service enters demo mode automatically.

**Demo mode features:**
- Simulated typing delays (1.5-3 seconds)
- Context-appropriate responses based on screen type
- Keyword-based response generation for user messages
- Full UI/UX works identically to real mode

**Demo intro messages:**
```typescript
const DEMO_INTRO_MESSAGES = [
  "Hi there! I'm Abby, your AI matchmaker...",
  "I'd normally ask you questions about...",
  "When the full system is connected...",
  "For now, feel free to explore the app!",
];
```

---

## Implementation Status

### Completed ✅

- [x] AbbyRealtimeService class with full API integration
- [x] Demo mode fallback with realistic simulation
- [x] useAbbyAgent React hook (drop-in replacement for old ElevenLabs hook)
- [x] Token management integration (TokenManager)
- [x] Secure fetch with timeouts (secureFetch)
- [x] Error handling and graceful degradation
- [x] CoachScreen integration
- [x] CoachIntroScreen integration

### TODO 🚧

- [ ] WebSocket connection for real-time audio
- [ ] WebRTC integration for voice streaming
- [ ] Audio amplitude extraction for orb animation
- [ ] Real microphone input handling
- [ ] Voice-to-text (STT) processing

---

## Architecture

### Service Flow

```
┌─────────────────────────────────────────────────────────┐
│                     AbbyRealtimeService                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  startConversation()                                     │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────┐                                   │
│  │ checkAvailability│ → GET /abby/realtime/available   │
│  └────────┬─────────┘                                   │
│           │                                              │
│     ┌─────┴─────┐                                       │
│     │           │                                       │
│   Available?  No ──────► startDemoMode()               │
│     │                         │                         │
│    Yes                   Demo messages                  │
│     │                    with delays                    │
│     ▼                                                   │
│  ┌──────────────────┐                                   │
│  │ Create Session   │ → POST /abby/realtime/session    │
│  └────────┬─────────┘                                   │
│           │                                              │
│           ▼                                              │
│  ┌──────────────────┐                                   │
│  │ WebSocket/WebRTC │ (TODO)                            │
│  │ Connection       │                                   │
│  └──────────────────┘                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Layer Integration

```
Layer 3 (Z:30) - SemanticOverlay    │ Voice command overlays
Layer 2 (Z:20) - GlassInterface     │ Chat UI, transcript display
Layer 1 (Z:10) - AbbyOrb            │ Voice-reactive animations
Layer 0 (Z:0)  - VibeMatrix         │ Emotional state visualization
```

---

## Security

- All API calls use `secureFetch` with:
  - 20 second timeout for voice operations
  - 5 second timeout for availability checks
  - Error sanitization (no sensitive data in logs)
- Tokens stored securely via TokenManager
- Console logs gated with `__DEV__`

---

## Testing

Run tests:
```bash
npm test
```

Test coverage includes:
- `__tests__/security.test.ts` - secureFetch validation
- Service behavior tested via component integration

---

## Next Steps

**To connect to real API:**

1. Verify API availability:
```bash
curl -X GET https://dev.api.myaimatchmaker.ai/v1/abby/realtime/available \
  -H "Authorization: Bearer <token>"
```

2. Test session creation:
```bash
curl -X POST https://dev.api.myaimatchmaker.ai/v1/abby/realtime/session \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

3. Implement WebSocket connection in AbbyRealtimeService
4. Add WebRTC for voice streaming
5. Extract audio amplitude for orb animation

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-02 | **MAJOR:** Rewrote spec to match actual implementation (OpenAI Realtime API) | Chi |
| 2026-01-02 | Documented demo mode fallback and current API endpoints | Chi |
| 2024-12-22 | Changed to Voice I/O Only strategy (ElevenLabs TTS + react-native-voice STT) | Chi |
| 2024-12-20 | Initial SpecKit specification (ElevenLabs conversational agent) | Chi |

---

*Document created: December 20, 2024*
*Last updated: January 2, 2026*
