# AbbyOrb - The AI Agent Feature

> Owner: CC1 | Layer 1 of Glass Sandwich

---

## Overview

Abby is the AI matchmaker represented as a living orb. She transforms between states, never hides. The orb breathes and pulses when speaking, with vibe-driven colors.

---

## Current State (2025-12-10)

**Working:**
- AbbyOrbUnified with energy morphing (0.0→1.0)
- All orbs (G1/G2/G4) support colorA/colorB vibe colors
- G4 optimized: fBM 4→2 octaves, warping 3→2 passes, sparkles 15→8
- Smooth 1000ms color transitions via Reanimated
- TTS via Fal.ai Orpheus (Tara voice) - works but 3-5s latency
- Demo UI in `App.abby.tsx` with phrase buttons
- Vibe color switching (TRUST/PASSION/CAUTION/GROWTH/DEEP)
- Reanimated worklets for audio→shader (CC2 recommendation)

**Energy States:**
- CALM (energy=0.0): Contained, slow, domain-warped lava texture
- ENGAGED (energy=0.5): More blob drift, medium speed
- EXCITED (energy=1.0): Free-flowing blobs, fast, no boundary

**Issues:**
- Amplitude simulation not synced to actual syllables
- TTS latency too slow for conversational AI
- expo-av deprecated, need to switch audio library
- Need to wire `startSpeakingPulse()`/`stopSpeakingPulse()` from VibeController

---

## Orb Inventory

| ID | Name | Description | Status |
|----|------|-------------|--------|
| G1 | Flowing amoeba | Organic blob | Done |
| G2 | Contained orb | Spherical, contained | Done |
| G3 | Orbiting satellites | Multi-element | Done |
| G4 | **Abby talking orb** | Audio-reactive, vibe colors | **Active** |
| G5 | Depth parallax | 3D depth effect | Done |
| G6 | Wave shells + core | Layered waves | Done |
| G7 | Crashing waves | Dynamic motion | Done |
| G8 | Spiral nebula | Cosmic effect | Done |
| G9 | Fluid ribbons | Ribbon trails | Done |
| G10 | Lava orb | Domain-warped lava lamp | Done |

---

## G4 Shader Details

### Visual Effects
- **Breathing**: Uniform expansion from center (15% max when audio=1.0)
- **Edge wobble**: Subtle sine waves (1.6%-4% amplitude)
- **Blob drift**: 5-6 blobs with organic smin merging
- **Lava texture**: Domain-warped fBM noise (from G10)
- **Vibe colors**: Gradient from colorA to colorB with hot center

### Uniforms
```glsl
uniform float2 resolution;
uniform float time;
uniform float audioLevel;  // 0.0 - 1.0
uniform float3 colorA;     // Primary vibe color
uniform float3 colorB;     // Secondary vibe color
```

### Key Code Pattern (Reanimated Worklets)
```typescript
// Convert React prop to shared value
const audioLevelShared = useSharedValue(0);
React.useEffect(() => {
  audioLevelShared.value = audioLevel;
}, [audioLevel]);

// Derive final value for shader
const finalAudioLevel = useDerivedValue(() => {
  return audioLevelShared.value > 0.01
    ? audioLevelShared.value
    : idleBreathing;
}, [clock]);
```

---

## Voice System

### Current: Fal.ai Orpheus
- Voice: "tara"
- Quality: Excellent, empathetic
- Latency: **3-5 seconds** (not suitable for real-time)
- Cost: Cheap

### Planned: ElevenLabs Flash v2.5
- Latency: **~75ms** with streaming
- Quality: Excellent + emotional expressiveness
- Voice cloning: Can create unique "Abby" voice
- Streaming: Yes - audio starts as it generates

### TTS Provider Research

| Provider | Latency | Quality | Best For |
|----------|---------|---------|----------|
| ElevenLabs Flash | ~75ms | Excellent | Voice agents (recommended) |
| Cartesia Sonic-3 | ~50ms | Very good | Maximum speed |
| OpenAI TTS | ~200ms | Excellent | Quality over speed |
| Fal.ai Orpheus | ~3-5s | Great | Batch, not real-time |

**Decision**: ElevenLabs for production (75ms still instant, better voice character)

---

## Conversational AI Architecture

### Decision: ElevenLabs Agent SDK (2024-12-10)

After validating custom stack approach, pivoted to ElevenLabs all-in-one solution.

**Why**: Faster to ship, less complexity, works on iOS.

```
User speaks → ElevenLabs Agent SDK → Abby responds → agentState → Shader orb
```

### ElevenLabs Agent SDK

```bash
npx expo install @elevenlabs/react-native @livekit/react-native @livekit/react-native-webrtc
```

**What it handles:**
- STT (speech-to-text) - built-in
- LLM (configurable via dashboard) - hosted by ElevenLabs
- TTS (text-to-speech) - ElevenLabs Flash ~75ms
- Turn-taking - built-in

**Files to create:**
- `src/services/AbbyAgent.ts` - SDK wrapper
- `src/components/AbbyConversation.tsx` - Conversation UI

### Alternative: Custom Stack (If Needed Later)

Only build custom if ElevenLabs Agent has limitations:

```
User speaks → Deepgram STT → Claude + Mem0 → ElevenLabs TTS → Simulated amplitude → Shader
```

**Required services:**
- `AbbySTT.ts` - Deepgram WebSocket
- `AbbyBrain.ts` - Claude manual SSE parsing (Anthropic SDK is Node-only)
- `AbbyMemory.ts` - Mem0 REST API (not MCP)
- `AbbyVoice.ts` - ElevenLabs TTS

---

## Files

| File | Purpose |
|------|---------|
| `src/components/layers/LiquidGlass4.tsx` | G4 Abby talking orb shader |
| `src/services/AbbyVoice.ts` | TTS service (currently Fal.ai) |
| `src/components/AbbyDemo.tsx` | Demo UI for testing |
| `App.abby.tsx` | Entry point for Abby demo |
| `App.dev.tsx` | Dev mode toggle (shaders vs abby) |

---

## Bugs & Fixes Log

### Hard edge on orb (FIXED)
- **Issue**: Straight edge appearing on left side
- **Cause**: Combining blobs with hard circular boundary via smin
- **Fix**: Pure blob approach - removed boundary, 6 blobs with high smin k=0.7

### expo-av native module error (FIXED)
- **Issue**: "Cannot find native module 'ExponentAV'"
- **Cause**: expo-av requires native rebuild, not just JS install
- **Fix**: `npx expo prebuild --platform ios --clean` then native build

### Audio not reaching shader (FIXED)
- **Issue**: Orb not responding to audioLevel prop
- **Cause**: React props don't trigger Reanimated derived values
- **Fix**: Convert prop to useSharedValue, update in useEffect

### SkSL compatibility issues (FIXED)
- No function overloading (use hash-based noise instead of simplex)
- Use `atan(y, x)` not `atan2`
- Use integer division not `%` operator

---

## Open Tasks

**ElevenLabs Agent SDK Approach:**
- [ ] Create ElevenLabs Agent in dashboard (configure Abby personality)
- [ ] Install SDK dependencies (elevenlabs + livekit)
- [ ] Create `src/services/AbbyAgent.ts` - SDK wrapper
- [ ] Create `src/components/AbbyConversation.tsx` - conversation UI
- [ ] Bridge `agentState` to shader audioLevel
- [ ] Test full voice conversation on iOS device

**If Custom Stack Needed Later:**
- [ ] Switch TTS from Fal.ai to ElevenLabs
- [ ] Add Deepgram STT (WebSocket streaming)
- [ ] Add Claude LLM (manual SSE parsing)
- [ ] Add Mem0 REST API integration

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-10 | Created feature doc (CC2) |
| 2024-12-10 | Built G4 shader with pure blob approach (CC1) |
| 2024-12-10 | Integrated Fal.ai Orpheus TTS (CC1) |
| 2024-12-10 | Fixed Reanimated worklet pattern for audio→shader (CC1) |
| 2024-12-10 | Added diaphragm breathing effect (CC1) |
| 2024-12-10 | Researched TTS providers, decided ElevenLabs (CC1) |
| 2024-12-10 | Documented full conversational stack plan (CC1) |
| 2024-12-10 | **Validated custom stack** - found critical issues (Chi) |
| 2024-12-10 | **Pivoted to ElevenLabs Agent SDK** - simpler, all-in-one (Chi) |

---

## Validation Findings (2024-12-10)

### Custom Stack Issues Found

| Original Claim | Reality | Decision |
|----------------|---------|----------|
| Whisper for STT | Batch-only, 500ms-2s delay | Would need Deepgram |
| Real PCM amplitude | ElevenLabs returns MP3 | Keep simulated (works fine) |
| Mem0 via MCP | MCP is CLI-only, not React Native | Would need REST API |
| Anthropic SDK | Node.js only | Would need manual SSE parsing |

### Why ElevenLabs Agent SDK Instead

- **All-in-one**: STT + LLM + TTS in one package
- **Less code**: ~50 lines vs ~500+ lines custom
- **Faster to ship**: 1 day vs 1 week
- **Works on iOS**: React Native SDK with livekit
- **Just one API key**: Agent ID from dashboard

### Risks with Agent SDK

| Risk | Mitigation |
|------|------------|
| LLM not customizable enough | Can configure system prompt in dashboard |
| No Mem0 integration | Can add webhook later, or switch to custom |
| No raw audio amplitude | Use `isSpeaking` boolean, simulate pulsing |
