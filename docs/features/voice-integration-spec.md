# FEATURE SPEC: Voice Integration System

**What:** ElevenLabs conversational AI agent integration enabling natural voice conversations with Abby
**Who:** All app users who want to interact with Abby through voice instead of touch interface
**Why:** Core differentiator - creates intimate, natural conversations that feel like talking to a real matchmaker
**Status:** 📝 Needs Implementation

---

## User Stories

**US-004: Voice Conversation with Abby**
As a user meeting Abby, I want to have a natural voice conversation so that it feels like talking to a real matchmaker.

Acceptance Criteria:
- [ ] User can activate voice mode by tapping the AbbyOrb
- [ ] ElevenLabs agent responds in real-time with <500ms latency for first audio
- [ ] Voice latency is under 500ms for response start across conversation
- [ ] User can switch between voice and text seamlessly without losing context
- [ ] Abby responds contextually to user hesitation, confusion, or interruptions
- [ ] Voice session automatically handles microphone permissions
- [ ] Real-time audio amplitude drives orb breathing animation
- [ ] Clear visual feedback for listening, processing, and speaking states

**US-012: Voice Question Answering**
As a user in an interview, I want to answer questions naturally through speech so that I can express myself more authentically.

Acceptance Criteria:
- [ ] User can answer any question type (choice, scale, text) via voice
- [ ] Speech-to-text accurately captures user responses with >90% accuracy
- [ ] Voice responses are automatically mapped to appropriate question formats
- [ ] User can say commands like "go back", "skip", "repeat question"
- [ ] Confidence scores are captured for voice responses for quality metrics
- [ ] Voice transcripts are stored securely for answer verification
- [ ] Fallback to text input if voice recognition fails repeatedly

**US-013: Conversational Context Management**
As a user, I want Abby to remember our conversation flow so that each interaction feels continuous and personal.

Acceptance Criteria:
- [ ] Abby maintains context across questions and conversation segments
- [ ] Recent conversation history informs Abby's responses and tone
- [ ] User can ask clarifying questions about previous topics
- [ ] Conversation state persists if user pauses and resumes interview
- [ ] Abby adapts her speaking style based on user's communication patterns
- [ ] Context includes current vibe state and question category for appropriate responses

---

## Functional Requirements

What this feature DOES:
- [ ] Integrates @elevenlabs/react-native SDK with pre-built Abby conversational agent
- [ ] Provides real-time bidirectional voice communication (<500ms latency)
- [ ] Processes speech-to-text for user input with intent recognition
- [ ] Streams text-to-speech audio output with amplitude data for orb animation
- [ ] Manages WebRTC audio streaming via LiveKit for optimal performance
- [ ] Handles conversation context and state management across question flow
- [ ] Provides voice command recognition for navigation ("skip", "go back", "repeat")
- [ ] Integrates with AbbyOrb for visual voice state representation
- [ ] Maintains conversation history for contextual AI responses
- [ ] Securely handles voice transcripts and audio processing

What this feature does NOT do:
- ❌ Store raw audio recordings locally (streams only for privacy)
- ❌ Support multiple simultaneous voice conversations
- ❌ Function offline (requires ElevenLabs cloud services)
- ❌ Replace text interface entirely (voice is additive, not replacement)
- ❌ Handle background voice processing (pauses when app backgrounds)
- ❌ Provide custom voice training or personalization (V2 feature)

---

## Data Model

Entities involved:
- **AppState** - Voice enablement and conversation state
- **InterviewSession** - Context for conversation routing and history
- **InterviewResponse** - Voice transcripts and confidence metrics
- **VoiceSession** - Active voice conversation metadata

New fields needed:
| Entity | Field | Type | Description |
|--------|-------|------|-------------|
| AppState | voiceEnabled | boolean | If voice mode is currently active |
| AppState | voiceState | enum | idle / listening / processing / speaking / error |
| AppState | microphonePermission | enum | not_requested / granted / denied |
| AppState | conversationContext | string[] | Last 3 exchanges for context |
| InterviewSession | voiceSessionId | UUID | Link to active voice session |
| InterviewResponse | voiceTranscript | string | STT transcription of user input |
| InterviewResponse | voiceConfidence | float | 0-1 recognition confidence score |
| InterviewResponse | answerMethod | enum | voice / touch for analytics |
| VoiceSession | elevenLabsSessionId | string | ElevenLabs conversation session ID |
| VoiceSession | startedAt | DateTime | Voice session start time |
| VoiceSession | contextMessages | JSON | Conversation history for AI context |
| VoiceSession | currentIntent | enum | question_answer / navigation / clarification |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /voice/transcribe | POST | Convert user speech to text with intent extraction |
| /voice/conversation | POST | Send message to ElevenLabs conversational agent |
| /voice/session/start | POST | Initialize new voice conversation session |
| /voice/session/end | POST | Clean up active voice session |
| /app/config | GET | Get voice feature flags and configuration |

*Note: For MVP, ElevenLabs endpoints are called directly via SDK. Voice endpoints are mocked locally.*

### ElevenLabs Integration Points

```typescript
// Direct ElevenLabs Conversational AI Agent Integration
const conversationConfig = {
  agentId: "abby_agent_id",       // Pre-built Abby agent
  streaming: true,                 // Enable real-time audio streaming
  onMessage: handleAbbyResponse,   // Response callback
  onAudio: handleAudioStream,      // Audio amplitude for orb
  voiceId: "abby_custom_voice",    // Custom voice cloning
  language: "en-US"
};
```

---

## UI Components

| Component | Purpose | Location |
|-----------|---------|----------|
| VoiceButton | Activate/deactivate voice mode | `src/components/ui/VoiceButton.tsx` ❌ |
| VoiceIndicator | Show listening/processing/speaking state | `src/components/ui/VoiceIndicator.tsx` ❌ |
| MicrophonePermission | Request microphone access | `src/components/ui/MicrophonePermission.tsx` ❌ |
| VoiceCommandGuide | Show available voice commands | `src/components/ui/VoiceCommandGuide.tsx` ❌ |
| VoiceErrorHandler | Handle voice service errors | `src/components/ui/VoiceErrorHandler.tsx` ❌ |
| VoiceTranscriptDisplay | Show real-time transcription | `src/components/ui/VoiceTranscriptDisplay.tsx` ❌ |

### Service Layer Components
| Service | Purpose | Location |
|---------|---------|----------|
| VoiceService | Main voice integration orchestrator | `src/services/VoiceService.ts` ❌ |
| ElevenLabsClient | ElevenLabs SDK wrapper | `src/services/ElevenLabsClient.ts` ❌ |
| SpeechToText | STT processing and intent recognition | `src/services/SpeechToText.ts` ❌ |
| ConversationManager | Context and session management | `src/services/ConversationManager.ts` ❌ |
| AudioStreamManager | WebRTC audio handling | `src/services/AudioStreamManager.ts` ❌ |

---

## Implementation Tasks

### Setup & Permissions
- [ ] TASK-001: Install @elevenlabs/react-native and LiveKit dependencies
- [ ] TASK-002: Configure microphone permissions and request handling
- [ ] TASK-003: Set up secure storage for ElevenLabs credentials
- [ ] TASK-004: Create VoiceService base architecture

### ElevenLabs Integration
- [ ] TASK-005: Integrate ElevenLabs conversational agent SDK
- [ ] TASK-006: Configure pre-built Abby agent with custom voice
- [ ] TASK-007: Implement real-time audio streaming with LiveKit
- [ ] TASK-008: Extract audio amplitude data for AbbyOrb synchronization
- [ ] TASK-009: Handle ElevenLabs session lifecycle management
- [ ] TASK-010: Implement conversation context and history management

### Speech Processing
- [ ] TASK-011: Implement speech-to-text with intent recognition
- [ ] TASK-012: Build voice command processing ("skip", "go back", "repeat")
- [ ] TASK-013: Create answer extraction from voice transcripts
- [ ] TASK-014: Implement confidence scoring for voice responses
- [ ] TASK-015: Handle multi-turn conversation flow

### UI Integration
- [ ] TASK-016: Create voice activation button in AbbyOrb
- [ ] TASK-017: Implement voice state indicators (listening, processing, speaking)
- [ ] TASK-018: Build real-time transcription display
- [ ] TASK-019: Create voice command help overlay
- [ ] TASK-020: Implement seamless voice/text mode switching

### Error Handling & Fallbacks
- [ ] TASK-021: Handle network failures gracefully
- [ ] TASK-022: Implement voice service timeout handling
- [ ] TASK-023: Create fallback to text mode when voice fails
- [ ] TASK-024: Handle permission denied states
- [ ] TASK-025: Implement retry logic for failed voice operations

### Performance & Polish
- [ ] TASK-026: Optimize battery usage during voice sessions
- [ ] TASK-027: Implement background/foreground state handling
- [ ] TASK-028: Add haptic feedback for voice interactions
- [ ] TASK-029: Test voice latency and optimize for <500ms target
- [ ] TASK-030: Implement voice session analytics and monitoring

---

## Architecture: Integration Points

### Glass Sandwich Layer Integration
```
Layer 3 (Z:30) - SemanticOverlay    │ Voice command overlays
Layer 2 (Z:20) - GlassInterface     │ Voice buttons and indicators
Layer 1 (Z:10) - AbbyOrb            │ Voice-reactive animations
Layer 0 (Z:0)  - VibeMatrix         │ Emotional state visualization
```

### Voice State Machine
```
VoiceState Flow:
idle → listening → processing → speaking → idle
  ↓         ↓           ↓           ↓
error ←────────────────┴───────────┘
  ↓
retry/fallback
```

### Zustand Store Integration
```typescript
interface VoiceState {
  voiceEnabled: boolean;
  voiceState: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  currentTranscript: string;
  conversationHistory: ConversationMessage[];
  elevenLabsSessionId: string | null;

  // Actions
  startVoice: () => Promise<void>;
  stopVoice: () => void;
  sendVoiceMessage: (transcript: string) => Promise<void>;
  handleVoiceCommand: (command: VoiceCommand) => void;
}
```

---

## Voice Service Architecture

### ElevenLabs Agent Configuration
```typescript
const abbyAgentConfig = {
  agentId: process.env.ELEVENLABS_ABBY_AGENT_ID,
  voiceId: "abby_custom_voice",
  model: "flash-2.5",
  systemPrompt: `You are Abby, a warm and intuitive AI matchmaker...`,
  firstMessage: "Hi there! I'm Abby, your personal matchmaker...",
  language: "en-US",
  streaming: true,
  interruptible: true
};
```

### WebRTC Audio Pipeline
```
User Microphone → LiveKit Capture → ElevenLabs STT → Intent Processing
                                                    ↓
Abby Response ← ElevenLabs TTS ← AI Agent ← Context + Question Flow
      ↓
Audio Amplitude → AbbyOrb Animation → Shader Breathing
```

### Conversation Context Management
```typescript
interface ConversationContext {
  currentQuestionId: string;
  vibeState: VibeState;
  userProfile: Partial<User>;
  recentAnswers: InterviewResponse[];
  conversationHistory: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: DateTime;
  }[];
}
```

---

## Voice Command Processing

### Supported Voice Commands
| Command | Intent | Action |
|---------|--------|--------|
| "skip" / "pass" / "next" | navigation | Skip current question |
| "go back" / "previous" | navigation | Return to previous question |
| "repeat" / "say that again" | clarification | Repeat Abby's last response |
| "help" / "what can I say" | help | Show voice command guide |
| "switch to typing" / "use text" | mode_switch | Disable voice, enable touch |

### Intent Recognition Pipeline
1. **Speech-to-Text**: Convert audio to text transcript
2. **Intent Classification**: Determine if answer, command, or clarification
3. **Command Processing**: Execute navigation or help commands
4. **Answer Extraction**: Map answers to question format
5. **Context Update**: Update conversation history and state

```typescript
interface VoiceIntent {
  type: 'answer' | 'command' | 'clarification' | 'unclear';
  confidence: number;
  transcript: string;
  command?: VoiceCommand;
  extractedAnswer?: QuestionAnswer;
}
```

---

## Performance Specifications

### Latency Targets
- **Initial Response**: <500ms from end of user speech to start of Abby audio
- **STT Processing**: <200ms for speech transcription
- **Intent Recognition**: <100ms for command classification
- **TTS Generation**: <300ms for Abby response generation
- **Audio Streaming**: Real-time with <50ms buffer

### Audio Quality
- **Sample Rate**: 16kHz minimum, 44.1kHz preferred
- **Audio Format**: WAV/M4A for upload, streaming MP3 for playback
- **Compression**: Optimized for voice clarity, not music quality
- **Noise Handling**: Basic noise suppression via device hardware

### Battery & Performance
- **Additional Battery**: 5-10% per hour during active voice sessions
- **CPU Usage**: <15% during voice processing
- **Memory**: <100MB additional for voice services
- **Network**: ~50KB/min for bidirectional audio streaming

---

## Security & Privacy Specifications

### Data Protection
1. **No Local Audio Storage**: Raw audio never stored on device
2. **Transcript Encryption**: Voice transcripts encrypted before AsyncStorage
3. **Network Security**: HTTPS/WSS only for all voice communications
4. **Session Management**: Voice sessions automatically expire after inactivity
5. **Permission Respect**: Immediate stop when microphone access revoked

### Privacy Compliance
- Clear disclosure that voice data is processed by ElevenLabs
- User control over voice data retention (delete conversation history)
- Opt-out option to disable voice features entirely
- No voice data used for marketing or analytics beyond core functionality

### ElevenLabs Data Handling
```typescript
const privacyConfig = {
  dataRetention: "session-only",     // Don't store conversations
  voiceCloning: false,               // Don't train on user voice
  analytics: "aggregate-only",       // No individual user profiling
  sharing: false                     // No third-party data sharing
};
```

---

## Accessibility Specifications

### Voice Accessibility
- Visual indicators for all voice states (listening, processing, speaking)
- Text alternatives for all voice interactions
- Support for users who cannot or prefer not to use voice
- Clear feedback when voice recognition fails

### Screen Reader Integration
```typescript
// VoiceButton accessibility
accessibilityLabel="Start voice conversation with Abby"
accessibilityHint="Double tap to activate microphone and speak to Abby"
accessibilityRole="button"
accessibilityState={{ pressed: voiceEnabled }}

// Voice state announcements
const announceVoiceState = (state: VoiceState) => {
  const announcements = {
    listening: "Listening for your response",
    processing: "Processing your message",
    speaking: "Abby is responding",
    error: "Voice connection error. Switching to text mode."
  };
  AccessibilityInfo.announceForAccessibility(announcements[state]);
};
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Microphone permission denied | Show clear explanation, fallback to text mode |
| Network failure during voice | Save context, retry when reconnected, fallback if persistent |
| Background app during conversation | Pause voice session, resume on return |
| Overlapping speech (user interrupts Abby) | Stop Abby audio immediately, start listening |
| Unclear speech recognition | Ask for clarification, offer to repeat question |
| ElevenLabs service outage | Graceful degradation to text-only mode |
| Device overheating | Reduce voice processing, maintain core functionality |
| Battery critical (<10%) | Auto-switch to text mode, preserve battery |
| Multiple rapid taps on voice button | Prevent multiple sessions, show single toggle state |

---

## Testing Checklist

- [ ] Happy path works - Complete voice conversation from start to finish
- [ ] Error states handled - Network failures, permission denied, service outages
- [ ] Loading states shown - Clear feedback during voice processing
- [ ] Latency tested - <500ms response time consistently achieved
- [ ] Voice commands work - All navigation commands properly recognized
- [ ] Answer extraction tested - Voice answers correctly mapped to question types
- [ ] Background handling - Voice pauses/resumes appropriately
- [ ] Accessibility verified - Screen reader announcements and visual indicators
- [ ] Battery impact measured - Within 5-10% additional drain target
- [ ] Privacy compliance - No sensitive data logged or exposed

---

## Future Enhancements (V2)

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Custom Voice Training | Train Abby's voice on user preferences | 3-4 weeks |
| Multi-language Support | Spanish, French voice interactions | 2-3 weeks |
| Emotion Detection | Real-time sentiment analysis from voice tone | 2-3 weeks |
| Advanced Voice Commands | "Tell me more about...", complex navigation | 1-2 weeks |
| Voice Personalization | Adapt speech patterns to user communication style | 2-3 weeks |
| Offline Voice Fallback | Basic voice recognition without internet | 3-4 weeks |

---

## ElevenLabs Integration Details

### Agent Setup Requirements
1. **Agent Creation**: Pre-built Abby agent with matchmaking personality
2. **Voice Selection**: Custom female voice optimized for empathy and warmth
3. **System Prompt**: Comprehensive matchmaker persona and question flow knowledge
4. **Streaming Config**: Enable real-time audio with amplitude extraction

### SDK Configuration
```typescript
import { useConversation } from '@elevenlabs/react-native';

const { startConversation, endConversation, status } = useConversation({
  agentId: process.env.ELEVENLABS_ABBY_AGENT_ID,
  onMessage: (message) => {
    // Handle text response
    handleAbbyTextResponse(message);
  },
  onAudio: (audio, eventId) => {
    // Handle streaming audio + amplitude
    handleAbbyAudioResponse(audio, eventId);
  },
  onStatusChange: (newStatus) => {
    // Handle connection state changes
    updateVoiceState(newStatus);
  }
});
```

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2024-12-20 | Initial SpecKit specification created with comprehensive ElevenLabs integration | Chi |

---

*Document created: December 20, 2024*
*Last updated: December 20, 2024*