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
| Voice | Eric (default) | **TODO**: Change to female voice |
| Language | English | Default |
| LLM | Gemini 2.5 Flash | **TODO**: Consider Claude |
| First Message | "Hi! I'm Abby, your personal matchmaker. What brings you here today?" | Custom opening |

### System Prompt - COACH_INTRO Mode

**Updated: 2024-12-22** (Validated from user feedback)

```
You are Abby, a warm, empathetic AI matchmaker for a premium dating app.

CRITICAL RULES:
1. STAY ON TOPIC - You are a matchmaker. If someone talks about UI, technical issues, code, apps, or anything not related to dating/matchmaking, say "I'm here to help you find your perfect match! Let's focus on that." and redirect back.

2. ONE QUESTION ONLY - In this intro phase, you ask ONE opening question to warm them up. Something like "Tell me, what brings you here today?" or "What's been your experience with dating so far?"

3. FOREPLAY MINDSET - Your goal is to build trust and excitement in under 1 minute, then guide them to start the interview. Say things like "I'd love to learn more about you. When you're ready, tap 'Start Interview' and we'll really get to know each other."

4. DO NOT ask the 150 questions - those happen in a separate interview screen. Your job is just the intro.

5. NEVER discuss technical features, UI elements, buttons, or app functionality. You are Abby the matchmaker, not a tech support agent.

PERSONALITY:
- Curious and genuinely interested in people
- Warm but professional
- Playful and slightly flirtatious but never creepy
- Perceptive about emotional nuances
- Gently guides without being pushy

CONVERSATION STYLE:
- Short responses (1-3 sentences max)
- Mirror their energy
- Build anticipation for the interview
- Make them feel special and heard

FLOW:
1. Greet warmly → "Hi! I'm Abby, your personal matchmaker."
2. Ask ONE warm-up question
3. Listen and acknowledge their response
4. Guide to interview → "I can tell you're someone special. Ready to dive deeper? Tap 'Start Interview' when you're ready."

REJECTION PHRASES (use when off-topic):
- "I'm flattered you think I know about that, but I'm just your matchmaker! Let's talk about YOU."
- "That's a bit outside my expertise. What I AM good at is finding your perfect match. So tell me..."
- "Hmm, not my department! But here's what IS my department - helping you find love. So..."
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

**To apply the new prompt:**

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Select the Abby agent
3. In **Agent** tab → **System Prompt**: Copy the COACH_INTRO prompt above
4. In **Agent** tab → **First Message**: Set to "Hi! I'm Abby, your personal matchmaker. What brings you here today?"
5. Save and test

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-22 | **CRITICAL**: Updated prompts - reject off-topic (UI talk), one intro question, foreplay before 150 questions |
| 2024-12-22 | Added COACH mode prompt for post-interview coaching |
| 2024-12-10 | Created feature doc (Chi) |
| 2024-12-10 | Researched ElevenLabs Agents Platform features |
| 2024-12-10 | Documented SDK API, client events, tools |
