# FEATURE SPEC: AbbyOrb - The AI Presence

**What:** 3D orb representing Abby AI with voice-reactive breathing animations and emotional state visualization
**Who:** All app users interacting with Abby through voice or touch interface
**Why:** Provides human-like AI presence that makes conversations feel personal and alive - core to the anti-dating app metaphor
**Status:** 🚧 In Development

---

## User Stories

**US-003: Abby Introduction**
As a user who completed basic setup, I want to meet Abby in a magical way so that I feel excited about the process.

Acceptance Criteria:
- [x] VibeMatrix background renders smoothly with color morphing
- [x] Abby orb appears with breathing animation
- [x] Transition from onboarding to Abby is seamless
- [x] User feels the interface is "alive" not static
- [x] No white screens or jarring cuts

**US-004: Voice Conversation with Abby**
As a user meeting Abby, I want to have a natural voice conversation so that it feels like talking to a real matchmaker.

Acceptance Criteria:
- [x] User can activate voice mode (via orb tap)
- [ ] ElevenLabs agent responds in real-time (<500ms latency)
- [ ] Voice latency is under 500ms for response start
- [x] User can switch between voice and text seamlessly
- [ ] Abby responds contextually to user hesitation or confusion

**US-006: Emotional State Visualization**
As a user, I want the background to reflect the mood of our conversation so that the experience feels emotionally connected.

Acceptance Criteria:
- [x] VibeMatrix shifts to TRUST (blue) during onboarding
- [x] VibeMatrix shifts to DEEP (violet) during intimate questions
- [x] VibeMatrix shifts to CAUTION (orange) during deal-breaker topics
- [x] Color transitions are smooth (800-1200ms) not jarring
- [x] Abby orb position and breathing adapt to conversation state

**US-009: Smooth Performance**
As a user, I want the app to run smoothly so that the magical feeling isn't broken by technical issues.

Acceptance Criteria:
- [x] App maintains 60fps during normal usage
- [x] Shader performance doesn't drain battery excessively
- [x] Low power mode switches to static backgrounds when battery < 20%
- [x] App launches in under 3 seconds
- [x] No crashes during 10-minute usage sessions

---

## Functional Requirements

What this feature DOES:
- [x] Renders G4 talking orb shader with breathing animations
- [x] Responds to audio levels with dynamic expansion (15% max scaling)
- [x] Morphs colors based on vibe state (TRUST/DEEP/CAUTION/PASSION/GROWTH/ALERT)
- [x] Integrates with VibeMatrix via alpha-glow blending for color cohesion
- [x] Provides visual feedback for voice activation and listening states
- [x] Supports 5 orb positions: centered, docked, active, thinking, listening
- [ ] Connects to ElevenLabs Flash v2.5 for <500ms voice latency
- [ ] Streams real-time audio with amplitude extraction
- [ ] Provides lip-sync style animation during speech output
- [ ] Handles STT (Speech-to-Text) integration for user voice input

What this feature does NOT do:
- ❌ Store or replay voice conversations locally (streams only)
- ❌ Function without internet connection (requires ElevenLabs)
- ❌ Support multiple simultaneous voice sessions
- ❌ Replace text interface (voice is additive to touch)
- ❌ Generate new orb designs (uses pre-built G4 shader)

---

## Data Model

Entities involved:
- **AppState** - Tracks orb position, state, and voice enablement
- **InterviewSession** - Context for conversation routing
- **InterviewResponse** - Voice transcripts and confidence scores

New fields needed:
| Entity | Field | Type | Description |
|--------|-------|------|-------------|
| AppState | orbPosition | enum | centered / docked / active / thinking / listening |
| AppState | orbState | enum | breathing / active / thinking / listening / speaking |
| AppState | voiceEnabled | boolean | If voice mode is currently active |
| AppState | audioLevel | float | Real-time audio amplitude 0.0-1.0 |
| InterviewResponse | voiceTranscript | string | STT transcription of user input |
| InterviewResponse | confidence | float | Voice recognition confidence score |
| InterviewResponse | answerMethod | enum | touch / voice for analytics |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /voice/transcribe | POST | Convert user speech to text with intent extraction |
| /voice/conversation | POST | Send message to ElevenLabs conversational agent |
| /app/config | GET | Get voice feature flags (voiceEnabled, maxVoiceDuration) |
| /interview/answer | POST | Submit voice-based interview responses |

### ElevenLabs Integration Points

```typescript
// Direct ElevenLabs Conversational AI Agent
const elevenLabsConfig = {
  agentId: "agent_xxx...", // Pre-built Abby personality
  streaming: true,         // Enable real-time audio streaming
  latencyOptimization: "speed", // Prioritize <500ms response
  voiceId: "abby_custom",  // Custom voice cloning
};
```

---

## UI Components

| Component | Purpose | Location | Status |
|-----------|---------|----------|--------|
| AbbyOrb | Main orb renderer with G4 shader | `src/components/layers/AbbyOrb.tsx` | 📝 Needs Creation |
| LiquidGlass4 | G4 talking orb shader implementation | `src/components/layers/LiquidGlass4.tsx` | ✅ Implemented |
| VoiceButton | Voice activation trigger | `src/components/ui/VoiceButton.tsx` | 📝 Needs Creation |
| AbbyDemo | Development testing interface | `src/components/AbbyDemo.tsx` | ✅ Implemented |

---

## Implementation Tasks

### Setup ✅
- [x] TASK-001: Create G4 shader with breathing and audio responsiveness
- [x] TASK-002: Implement vibe color switching system
- [x] TASK-003: Set up Reanimated worklets for audio→shader pipeline
- [x] TASK-004: Build demo UI for testing voice interactions

### Core - In Progress 🚧
- [x] TASK-005: Integrate Fal.ai Orpheus TTS (interim solution)
- [ ] TASK-006: Replace with ElevenLabs Flash v2.5 for <500ms latency
- [ ] TASK-007: Implement real-time audio streaming and amplitude extraction
- [ ] TASK-008: Add STT (Whisper/Deepgram) for user voice input
- [ ] TASK-009: Create production AbbyOrb.tsx component
- [ ] TASK-010: Implement orb state machine (breathing → listening → thinking → speaking)

### Polish - Pending 📝
- [ ] TASK-011: Add lip-sync style animation during speech output
- [ ] TASK-012: Implement voice command recognition ("go back", "skip", "repeat")
- [ ] TASK-013: Create graceful fallbacks for voice service failures
- [ ] TASK-014: Add haptic feedback for voice interactions
- [ ] TASK-015: Optimize battery usage during voice sessions

---

## Architecture: Glass Sandwich Layer 1

```
Layer 3 (Z:30) - SemanticOverlay    │ Accessibility targets
Layer 2 (Z:20) - GlassInterface     │ BlurView + all UI
Layer 1 (Z:10) - AbbyOrb            │ Reactive 3D orb ← THIS LAYER
Layer 0 (Z:0)  - VibeMatrix         │ GLSL shader background
```

**Critical Integration**: AbbyOrb uses alpha-glow blending to influence VibeMatrix colors, creating emergent color cohesion across layers.

---

## Orb States & Positions

### Orb States

| State | Visual Behavior | Audio Activity | Trigger |
|-------|----------------|----------------|---------|
| breathing | Slow sine wave expansion (3s cycle) | None | Default idle state |
| active | Excited pulse, larger size (140px) | None | Voice activation |
| listening | Rapid pulse, expanded (110%) | Recording | User speaking |
| thinking | Shimmer effect, current size | None | Processing STT/LLM |
| speaking | Lip-sync style animation | Audio output | Abby talking |

### Orb Positions

| Position | Location | Size | Use Case |
|----------|----------|------|----------|
| centered | Screen center | Large (120px) | Introduction, focus mode |
| docked | Top-right | Medium (80px) | During questions, non-intrusive |
| active | Screen center | Large (140px) | Voice activation |
| thinking | Current position | Current size | Processing states |
| listening | Current position | Expanded (110%) | User voice input |

---

## Voice System Architecture

### Current State (Interim)
```
User taps orb → Fal.ai Orpheus TTS → 3-5s latency → Audio playback → Orb animation
```

**Issues**: 3-5s latency breaks conversational flow

### Target State (ElevenLabs)
```
User speaks → Whisper STT → GPT-4/Claude + context → ElevenLabs Flash → <500ms streaming audio → Real amplitude → Orb sync
```

### Voice Service Comparison

| Provider | Latency | Quality | Streaming | Cost | Decision |
|----------|---------|---------|-----------|------|----------|
| ElevenLabs Flash | ~75ms | Excellent | Yes | Medium | ✅ Production |
| Cartesia Sonic | ~50ms | Very good | Yes | Low | Alternative |
| OpenAI TTS | ~200ms | Excellent | No | Medium | Too slow |
| Fal.ai Orpheus | ~3-5s | Great | No | Low | ❌ Demo only |

---

## G4 Shader Specifications

### Visual Effects
- **Breathing**: Uniform expansion from center (15% max when audio=1.0)
- **Edge wobble**: Subtle sine waves (1.6%-4% amplitude)
- **Blob drift**: 5-6 blobs with organic smin merging (k=0.7)
- **Lava texture**: Domain-warped fBM noise for organic feel
- **Vibe colors**: Gradient from colorA to colorB with hot center

### GLSL Uniforms
```glsl
uniform float2 resolution;    // Screen dimensions
uniform float time;           // Animation timer
uniform float audioLevel;     // Real-time audio 0.0-1.0
uniform float3 colorA;        // Primary vibe color
uniform float3 colorB;        // Secondary vibe color
uniform float breathingPhase; // Breathing cycle offset
```

### Performance Budget
- **Target**: 55-60fps when combined with VibeMatrix
- **Memory**: Additional 20-30MB over VibeMatrix base
- **GPU**: Optimized for A13+ (iPhone 11+)
- **Battery**: 5-10% additional drain during voice sessions

---

## Voice Integration Specifications

### Audio Pipeline
```typescript
interface AudioPipeline {
  input: {
    source: 'microphone' | 'test';
    format: 'wav' | 'm4a';
    sampleRate: 44100 | 48000;
    maxDuration: 60; // seconds
  };
  processing: {
    stt: 'whisper' | 'deepgram';
    llm: 'gpt4' | 'claude';
    tts: 'elevenlabs-flash';
  };
  output: {
    streaming: true;
    amplitudeExtraction: true;
    format: 'wav';
  };
}
```

### ElevenLabs Agent Configuration
```typescript
const abbyAgentConfig = {
  agentId: "agent_xxx...",           // Pre-built Abby personality
  voiceId: "abby_custom_voice",      // Custom voice cloning
  model: "eleven_flash_v2_5",        // Low-latency model
  stability: 0.8,                    // Voice consistency
  similarityBoost: 0.7,              // Voice clone fidelity
  streaming: true,                   // Enable streaming
  optimizeFor: "latency",            // vs "quality"
};
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Voice service unavailable | Show text-only mode, orb shows "offline" state |
| Microphone permission denied | Graceful fallback to text, clear messaging |
| Network connectivity issues | Cache last response, show "reconnecting" state |
| Audio playback failure | Fallback to text display, log for debugging |
| STT confidence < 50% | Ask user to repeat, show uncertainty animation |
| Voice interruption mid-response | Stop audio immediately, show listening state |
| Background app during voice | Pause conversation, resume on return |
| Low battery mode active | Disable voice features, text-only mode |
| Device overheating | Reduce orb complexity, maintain voice functionality |

---

## Testing Checklist

- [x] Happy path works - G4 shader renders and responds to audio
- [x] Error states handled - Network failures don't crash app
- [ ] Voice latency tested - <500ms response time achieved
- [ ] Loading states shown - Clear feedback during voice processing
- [ ] Mobile responsive - Orb scales properly across screen sizes
- [ ] Accessibility checked - VoiceOver integration, text alternatives
- [ ] Battery tested - Voice sessions don't drain battery excessively
- [ ] Permission handling - Microphone access gracefully handled
- [ ] Network resilience - Handles poor connectivity scenarios
- [ ] Interruption handling - Voice calls, notifications handled properly

---

## Performance Specifications

### Audio Processing Budget
| Metric | Target | Fallback |
|--------|--------|----------|
| STT Latency | <200ms | Show processing indicator |
| LLM Response | <300ms | "Thinking" animation |
| TTS Latency | <500ms | Buffer and stream |
| Total Round Trip | <1000ms | Acceptable conversation flow |

### Resource Usage
| Resource | Normal Operation | Voice Active | Low Power Mode |
|----------|------------------|--------------|----------------|
| CPU | 15-25% | 25-35% | 10-15% |
| Memory | +30MB over base | +50MB | +20MB |
| Network | Minimal | 50-100kb/s | Text only |
| Battery | +5%/hr | +15%/hr | +2%/hr |

---

## Integration Points

### State Management (Zustand)
```typescript
interface VoiceState {
  isVoiceEnabled: boolean;
  orbState: 'breathing' | 'active' | 'listening' | 'thinking' | 'speaking';
  orbPosition: 'centered' | 'docked' | 'active';
  audioLevel: number;
  isProcessing: boolean;
  lastError: string | null;
}
```

### VibeMatrix Integration
- Orb colors automatically sync with current vibe state
- Alpha-glow blending creates natural color cohesion
- Conversation emotional tone triggers background transitions
- Voice activity influences background animation intensity

### Question Flow Integration
- Voice answers automatically captured and transcribed
- Multi-modal input: voice OR touch for all question types
- Intent recognition routes voice to appropriate question handlers
- Progress saved regardless of input method

---

## Security Considerations

| Layer | Approach |
|-------|----------|
| Voice Data | Stream-only processing, no local storage |
| API Keys | Server-side ElevenLabs credentials only |
| Transcripts | Encrypt voice transcripts at rest |
| Network | HTTPS only, validate all audio uploads |
| Privacy | Clear disclosure of voice processing to users |

---

## Future Enhancements (V2)

| Enhancement | Description | Effort Estimate |
|-------------|-------------|------------------|
| Voice Cloning | Custom Abby voice trained on user preferences | 2-3 weeks |
| Multi-language | Support for Spanish, French voice interactions | 2-3 weeks |
| Emotion Detection | Real-time sentiment analysis from voice tone | 1-2 weeks |
| Voice Commands | "Skip", "Go back", "Repeat" voice navigation | 1 week |
| Background Conversation | Ambient Abby check-ins between sessions | 2-3 weeks |

---

## Known Issues & Fixes

### Fixed Issues ✅
| Issue | Cause | Fix | Date |
|-------|-------|-----|------|
| Hard edge on orb | smin boundary clipping | Pure blob approach, k=0.7 | 2024-12-10 |
| expo-av module error | Missing native rebuild | npx expo prebuild --clean | 2024-12-10 |
| Audio not reaching shader | React props vs Reanimated | useSharedValue pattern | 2024-12-10 |
| SkSL compatibility | Function overloading | Hash-based noise, atan fixes | 2024-12-10 |

### Open Issues 🐛
| Issue | Impact | Priority | Owner |
|-------|--------|----------|-------|
| 3-5s TTS latency | Breaks conversation flow | High | Chi |
| Simulated amplitude | Not synced to syllables | Medium | Chi |
| expo-av deprecation | Future compatibility | Low | Chi |

---

## File Structure

```
src/
├── components/
│   ├── layers/
│   │   ├── AbbyOrb.tsx              # Main production component (TBD)
│   │   └── LiquidGlass4.tsx         # G4 shader implementation ✅
│   ├── ui/
│   │   └── VoiceButton.tsx          # Voice activation trigger (TBD)
│   └── AbbyDemo.tsx                 # Development demo interface ✅
├── services/
│   ├── AbbyVoice.ts                 # TTS service (Fal.ai → ElevenLabs)
│   ├── SpeechRecognition.ts         # STT service (TBD)
│   └── AudioAnalysis.ts             # Real-time amplitude extraction (TBD)
├── types/
│   └── voice.ts                     # Voice-related TypeScript types
└── constants/
    └── voice.ts                     # ElevenLabs config, voice commands
```

---

## Migration from Fal.ai to ElevenLabs

### Phase 1: Parallel Implementation
- Keep existing Fal.ai integration working
- Build ElevenLabs streaming alongside
- A/B test latency and quality

### Phase 2: ElevenLabs Production
- Switch default to ElevenLabs Flash v2.5
- Keep Fal.ai as fallback for service failures
- Monitor latency metrics in production

### Phase 3: Cleanup
- Remove Fal.ai dependencies
- Optimize ElevenLabs integration
- Full voice command recognition

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2024-12-20 | Created comprehensive SpecKit specification | Chi |
| 2024-12-10 | Documented full conversational stack plan | CC1 |
| 2024-12-10 | Researched TTS providers, decided ElevenLabs | CC1 |
| 2024-12-10 | Added diaphragm breathing effect | CC1 |
| 2024-12-10 | Fixed Reanimated worklet pattern for audio→shader | CC1 |
| 2024-12-10 | Integrated Fal.ai Orpheus TTS (interim) | CC1 |
| 2024-12-10 | Built G4 shader with pure blob approach | CC1 |
| 2024-12-10 | Created feature documentation | CC2 |

---

*Document created: December 20, 2024*
*Last updated: December 20, 2024*