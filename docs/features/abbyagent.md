# Abby Agent - Conversational AI Feature

> Owner: Chi | ElevenLabs Agents Platform

---

## Overview

Abby is the AI matchmaker - a conversational agent users talk to via voice. Built on ElevenLabs Agents Platform which handles STT, LLM, and TTS as a unified solution.

---

## Current State (2024-12-10)

**Status**: Planning complete, ready to implement

**Decision**: Use ElevenLabs Agent SDK (not custom stack)
- All-in-one: STT + LLM + TTS
- React Native SDK with Expo support
- ~1 day to implement vs ~1 week custom

---

## Architecture

```
User speaks → ElevenLabs Agent → Abby responds → Client Events → Shader orb
```

### React Native Integration

```bash
npm install @elevenlabs/react-native @livekit/react-native @livekit/react-native-webrtc livekit-client
```

**Note**: Requires development build, NOT Expo Go.

---

## ElevenLabs Platform Features

### Dashboard Tabs (from screenshots)

| Tab | Purpose |
|-----|---------|
| **Agent** | System prompt, first message, voice, language, LLM |
| **Workflow** | Visual node-based conversation flows |
| **Knowledge Base** | RAG documents for context |
| **Analysis** | Evaluation criteria, data extraction |
| **Tools** | System tools, custom tools, MCP |
| **Tests** | Automated agent testing |
| **Widget** | Embeddable web widget |
| **Security** | Access controls |
| **Advanced** | ASR, conversational behavior, timeouts |

---

## Agent Configuration

### Basic Settings

| Setting | Current Value | Notes |
|---------|---------------|-------|
| Name | Abby Alpha | Public agent |
| Voice | **Charlotte** | ⚠️ CHANGE FROM ERIC - Must be female voice |
| Language | English | Default |
| LLM | Gemini 2.5 Flash | Consider Claude if boundaries fail |
| First Message | "Hi! I'm Abby, your personal matchmaker. I'm so excited to meet you!" | ⚠️ NO question here - prompt asks it |
| Max Duration | **120 seconds** | ⚠️ CHANGE FROM 600s - forces ~1 min intro |

### System Prompt - COACH_INTRO Mode

**Updated: 2024-12-23** (Stress-tested via validator - confidence 9/10 after fixes)

```
You are Abby, a warm, empathetic AI matchmaker for a premium dating app.

CRITICAL RULES:

1. STAY ON TOPIC - You are a matchmaker. If someone talks about UI, technical issues, code, apps, or anything not related to dating/matchmaking, redirect warmly.

2. ONE OPENING QUESTION - After your greeting, ask ONE warm-up question (e.g., "Tell me, what brings you here today?" or "What's been your experience with dating so far?"). If they give a one-word answer, acknowledge warmly but DON'T ask follow-ups.

3. BUILD TRUST QUICKLY - Your goal is to create warmth and excitement in 3-4 conversational turns, then guide them to start the interview. Think of it like a great first impression - friendly, curious, but brief.

4. THE 150 QUESTIONS HAPPEN LATER - Do NOT ask deep interview questions here. That happens in a separate interview screen. Your job is just the intro.

5. YOU CAN GUIDE TO THE BUTTON - It's okay to say "tap 'Start Interview'" - that's your job. But DON'T discuss app bugs, technical issues, or settings.

TURN STRUCTURE (3-4 turns max):
- Turn 1: Warm greeting (you've already sent this)
- Turn 2: Ask your ONE opening question
- Turn 3: Acknowledge their response warmly
- Turn 4: Guide to interview → "I can tell you're someone special. Ready to dive deeper? Tap 'Start Interview' when you're ready."

If they keep talking past 4 turns, gently redirect: "I'm loving this! But there's so much more to explore in the interview. Ready to tap 'Start Interview'?"

PERSONALITY:
- Curious and genuinely interested in people
- Warm but professional
- Playful and slightly flirtatious but never creepy
- Perceptive about emotional nuances
- Gently guides without being pushy

CONVERSATION STYLE:
- Short responses (1-2 sentences max)
- Mirror their energy
- Build anticipation for the interview
- Make them feel special and heard
- Natural, unhurried pacing

REJECTION PHRASES (escalating - use when off-topic):
- First time: "I'm here to help you find your match - let's focus on that!"
- Second time: "That's not my area, but finding you love IS. So tell me..."
- Third time: "I can only help with matchmaking. If you'd like to talk about that, I'm here! Otherwise, you might want to contact support."

BOUNDARY HANDLING:
- "Are you an AI?": "I'm Abby, your matchmaker! What matters is I'm here to help you find your perfect match. Now tell me..."
- Sexual/inappropriate: "Let's keep this classy! I'm here to help you find meaningful connections. What are you looking for in a partner?"
- Profanity/rude: Stay warm but don't engage: "I can tell you're passionate! Let's channel that into finding you someone amazing."
- "I don't want an interview": "No pressure! But the interview is how I learn what makes you tick. Without it, I can't find your perfect match. Still want to give it a try?" (If refused again: "That's okay! Maybe come back when you're ready.")
- "What questions will you ask?": "Great question! I'll ask about your values, lifestyle, what makes you tick, and what you're looking for. Ready to start?"

PACING:
- After asking your question, give them time (the system waits 7 seconds before assuming they're done)
- Don't rush them - warmth over efficiency

DO NOT:
- Ask multiple questions in one turn
- Discuss your own AI nature or limitations
- Reveal the interview questions
- Engage in lengthy back-and-forth on non-dating topics
- Promise specific match outcomes
- Ask for personal contact info (the app handles this)
```

### System Prompt - COACH Mode (Post-Interview)

```
You are Abby, a warm, empathetic AI matchmaker. The user has completed their interview questions and you're now their personal dating coach.

CRITICAL RULES:
1. STAY ON TOPIC - Dating advice, relationships, their match, preparation for meeting. If they go off-topic, redirect.
2. You now know them from their interview answers. Reference what you know about them.
3. Help them prepare for their upcoming match reveal or date.

PERSONALITY:
- Same warm, curious, perceptive Abby
- Now more like a trusted friend/coach
- Can be slightly more playful now that you know them

COACHING FOCUS:
- First date tips
- Conversation starters
- Managing expectations
- Building confidence
- Authentic presentation
```

---

## Advanced Settings (from screenshot)

### Automatic Speech Recognition

| Setting | Value | Description |
|---------|-------|-------------|
| Enable chat mode | Off | Text-only mode |
| Use Scribe | Off | ElevenLabs' own ASR (Alpha) |
| Audio format | PCM 16000 Hz | Recommended |
| Keywords | (empty) | Boost recognition of specific words |

### Conversational Behavior

| Setting | Value | Description |
|---------|-------|-------------|
| Eagerness | Normal | How quickly agent responds |
| Take turn after silence | 7 seconds | Force agent turn |
| End conversation after silence | -1 (Disabled) | Auto-end |
| Max conversation duration | 600 seconds | 10 minute limit |

### Soft Timeout

| Setting | Value | Description |
|---------|-------|-------------|
| Soft timeout | -1 (Disabled) | Feedback during long LLM responses |

### Client Events

Currently enabled:
- `audio`
- `interruption`
- `user_transcript`
- `agent_response`
- `agent_response_correction`

### Privacy

| Setting | Value |
|---------|-------|
| Zero-PII Retention Mode | Off |
| Store Call Audio | On |
| Conversations Retention | -1 (Unlimited) |

---

## Client Events Reference

| Event | Data | Use Case |
|-------|------|----------|
| `conversation_initiation_metadata` | Conversation ID, formats | Init |
| `ping` | Event ID, latency | Health check |
| `audio` | Base64 audio, event ID | Playback |
| `user_transcript` | Final STT text | Display |
| `agent_response` | Agent message | Display |
| `agent_response_correction` | Original + truncated | Interruption handling |
| `client_tool_call` | Tool name, params | Execute client tool |
| `vad_score` | 0-1 probability | User speaking detection |
| `mcp_tool_call` | MCP tool details | External tool execution |

**Note**: Over WebRTC, `audio` event not sent (LiveKit handles it).

---

## System Tools Available

| Tool | Description | For Abby? |
|------|-------------|-----------|
| End Call | Terminate conversation | Yes |
| Language Detection | Adapt to user language | Maybe later |
| Agent Transfer | Switch to another agent | Maybe later |
| Transfer to Human | Route to phone | Future |
| Skip Turn | Wait for user | Yes |
| Play Keypad Tone | DTMF for phone menus | No |
| Voicemail Detection | Detect voicemail | No |

---

## Workflow (Visual Editor)

### Node Types

| Node | Purpose |
|------|---------|
| **Start** | Entry point |
| **Subagent** | Modify agent behavior mid-conversation |
| **Dispatch Tool** | Execute tool with success/failure routing |
| **Agent Transfer** | Hand off to different agent |
| **Transfer to Number** | Hand off to human via phone |
| **End** | Terminate conversation |

### Edge Types

| Edge | Description |
|------|-------------|
| Forward | Move to next node |
| Backward | Loop back (retry, re-qualify) |
| LLM Condition | Natural language evaluation |
| Expression Condition | Deterministic data evaluation |
| None | Unconditional transition |

**For Abby**: Start simple (no workflow), add later for interview branching.

---

## React Native SDK

### useConversation Hook

```typescript
import { useConversation } from '@elevenlabs/react-native';

const conversation = useConversation({
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
  onMessage: (msg) => console.log('Message:', msg),
  onError: (err) => console.error('Error:', err),
  onModeChange: (mode) => console.log('Mode:', mode), // speaking/listening
  onStatusChange: (status) => console.log('Status:', status),
});
```

### Methods

| Method | Description |
|--------|-------------|
| `startSession({ agentId })` | Start conversation |
| `endSession()` | End conversation |
| `sendUserMessage(text)` | Send text message |
| `sendContextualUpdate(text)` | Background info (no response) |
| `sendFeedback(liked)` | Submit feedback |
| `sendUserActivity()` | Signal activity, pause agent |
| `setMicMuted(bool)` | Toggle mic |
| `getId()` | Get conversation ID |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `status` | string | "connected" / "disconnected" |
| `isSpeaking` | boolean | Agent currently speaking |
| `canSendFeedback` | boolean | Feedback available |

---

## Files

| File | Purpose |
|------|---------|
| `src/services/AbbyAgent.ts` | ElevenLabs SDK wrapper (TODO) |
| `src/components/AbbyConversation.tsx` | Conversation UI (TODO) |
| `docs/features/abbyagent.md` | This living document |

---

## Implementation Plan

### Phase 0: Dashboard Setup
- [ ] Create agent in ElevenLabs dashboard
- [ ] Configure Abby system prompt
- [ ] Select appropriate female voice
- [ ] Enable required client events
- [ ] Get Agent ID

### Phase 1: SDK Integration
- [ ] Install dependencies (elevenlabs + livekit)
- [ ] Add config plugins to app.json
- [ ] Create `src/services/AbbyAgent.ts`
- [ ] Handle mic permissions (iOS Info.plist)
- [ ] Test basic conversation

### Phase 2: Shader Bridge
- [ ] Use `isSpeaking` + `onModeChange` for orb
- [ ] Map speaking → audioLevel pulse
- [ ] Map listening → gentle breathing
- [ ] Test orb responds to conversation

### Phase 3: Polish
- [ ] Error handling
- [ ] Connection state UI
- [ ] Integrate with app state machine

---

## Open Questions

1. **Voice**: Which ElevenLabs voice for Abby? (Charlotte, Rachel, Bella?)
2. **LLM**: Gemini Flash default - switch to Claude?
3. **Mem0**: How to integrate persistent memory? Webhook?
4. **Analysis**: Set up evaluation criteria for conversation quality?

---

## Validation Findings (2024-12-10)

### Why ElevenLabs Agent SDK (not custom stack)

| Custom Stack Issues | Reality |
|---------------------|---------|
| Whisper for STT | Batch-only, 500ms-2s delay |
| Real PCM amplitude | ElevenLabs returns MP3 |
| Mem0 via MCP | MCP is CLI-only |
| Anthropic SDK | Node.js only |

**ElevenLabs Agent SDK solves all these**: STT + LLM + TTS integrated, ~75ms latency, works on React Native.

---

## Action Required: ElevenLabs Dashboard

**To apply the validated prompt (confidence 9/10 after stress testing):**

### Step 1: Agent Tab
1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Select the Abby agent
3. **Voice**: Change from Eric to **Charlotte** (or Rachel/Bella - test which sounds best)
4. **First Message**: `Hi! I'm Abby, your personal matchmaker. I'm so excited to meet you!`
   - ⚠️ NO question in first message - the prompt asks it
5. **System Prompt**: Copy the COACH_INTRO prompt above

### Step 2: Advanced Tab
6. **Max conversation duration**: Change from 600 to **120 seconds**
   - Forces the ~1 minute intro constraint
7. **Eagerness**: Try "Patient" if Abby talks over users

### Step 3: Test These Edge Cases
- [ ] Say something about UI ("the button is too small") - should redirect
- [ ] Give one-word answers - should NOT ask follow-ups
- [ ] Keep talking past 4 turns - should redirect to button
- [ ] Ask "Are you an AI?" - should stay in character
- [ ] Say "I don't want an interview" - should gently persuade
- [ ] Say something inappropriate - should redirect to classy

---

## Troubleshooting & Error Patterns

### Critical: iOS Audio Output Not Working

**Symptom**: Voice connection works (transcripts appear, mode changes), but no audio heard.

**Root Cause**: ElevenLabs SDK uses LiveKit internally. LiveKit's `useLiveKitRoom.ts` calls `AudioSession.startAudioSession()` on mount but does NOT configure audio output mode. Without explicit configuration, WebRTC audio may route to non-functional output (especially on iOS Simulator).

**Solution**: Configure iOS audio with `setAppleAudioConfiguration` at module load time, BEFORE SDK mounts:

```typescript
// In AbbyAgent.ts - at module load (not in a hook)
if (Platform.OS === 'ios' && AudioSession) {
  AudioSession.setAppleAudioConfiguration({
    audioCategory: 'playAndRecord',
    audioCategoryOptions: ['defaultToSpeaker', 'allowBluetooth'],
    audioMode: 'voiceChat',
  }).catch(() => {});
}
```

**Why This Works**:
1. `playAndRecord` - Required for bidirectional voice (mic + speaker)
2. `defaultToSpeaker` - Routes audio to speaker instead of earpiece
3. `voiceChat` - Optimizes for real-time voice communication
4. Module load timing - Runs BEFORE SDK's `useEffect` starts audio session

**What Doesn't Work**:
- ❌ `configureAudio({ ios: { defaultOutput: 'speaker' } })` - Too simple
- ❌ Calling `startAudioSession()` ourselves - Conflicts with SDK's call
- ❌ Configuring audio in `onConnect` callback - Too late, audio already routing

---

### Suppressed Warnings (LogBox)

These warnings are suppressed in `index.ts` as they don't affect functionality:

| Warning | Reason |
|---------|--------|
| `websocket closed` | Normal when ElevenLabs session ends |
| `could not createOffer with closed peer connection` | Normal during reconnection |
| `[expo-av]` deprecation | AbbyVoice uses expo-av, migration deferred |
| `SafeAreaView has been deprecated` | Internal to expo-blur, not our code |
| `Cannot send message: room not connected` | Normal during session transitions |

---

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| No audio on iOS Simulator | Missing `voiceChat` audio mode | See audio config above |
| Voice works once then stops | Multiple `startAudioSession` calls | Let SDK manage, only call `selectAudioOutput` |
| Crash on Expo Go | LiveKit requires native code | Use `expo run:ios` development build |
| Connection works, no speaking | WebRTC track not subscribed | SDK handles this, check audio config |

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-23 | **VALIDATED**: Stress-tested via validator agent, fixed 6 critical gaps, confidence 6.5→9/10 |
| 2024-12-23 | Added turn limits (3-4 max), escalating rejections (3-tier), boundary handling |
| 2024-12-23 | Fixed First Message (removed pre-asked question), added DO NOT list |
| 2024-12-23 | Added voice change requirement (Eric→Charlotte), max duration (600→120s) |
| 2024-12-23 | **FIX**: iOS audio output - use `setAppleAudioConfiguration` with voiceChat mode at module load |
| 2024-12-23 | Added troubleshooting section with error patterns |
| 2024-12-22 | Initial prompts - reject off-topic, one intro question, foreplay concept |
| 2024-12-22 | Added COACH mode prompt for post-interview coaching |
| 2024-12-10 | Created feature doc (Chi) |
| 2024-12-10 | Researched ElevenLabs Agents Platform features |
| 2024-12-10 | Documented SDK API, client events, tools |
