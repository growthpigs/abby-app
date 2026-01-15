# AbbyOrb - The AI Agent Feature

> Owner: CC1 | Layer 1 of Glass Sandwich

---

## Overview

Abby is the AI matchmaker represented as a living orb. She transforms between states, never hides. The orb breathes and pulses when speaking, with vibe-driven colors.

---

## Current State (2024-12-10)

**Working:**
- G4 orb shader with audio-reactive breathing
- TTS via Fal.ai Orpheus (Tara voice) - works but 3-5s latency
- Demo UI in `App.abby.tsx` with phrase buttons
- Vibe color switching (TRUST/PASSION/CAUTION/GROWTH/DEEP)
- Reanimated worklets for audio→shader (CC2 recommendation)

**Issues:**
- Amplitude simulation not synced to actual syllables
- TTS latency too slow for conversational AI
- expo-av deprecated, need to switch audio library

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

### Current: OpenAI Realtime API (via Client Backend)
- Architecture: WebRTC connection to OpenAI Realtime API
- Integration: Client backend at dev.api.myaimatchmaker.ai handles sessions
- Streaming: Yes - real-time bidirectional audio
- Quality: Excellent

**Decision**: OpenAI Realtime API via client backend for production

---

## Voice Architecture (Current)

```
User speaks → WebRTC to OpenAI Realtime API (via client backend)
           → AI processes and responds in real-time
           → Audio stream → Shader amplitude
```

### Components
- **Voice**: OpenAI Realtime API (bidirectional)
- **Backend**: dev.api.myaimatchmaker.ai handles sessions
- **Audio Analysis**: Amplitude extraction for shader animation

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

### (LEGACY) ElevenLabs SDK API change (2024-12-23) - NO LONGER APPLICABLE
> Note: This was fixed before migration to OpenAI Realtime API. Kept for historical reference only.
> Voice now uses OpenAI Realtime API via client backend - see AbbyRealtimeService.ts

---

## Open Tasks

- [x] Switch to OpenAI Realtime API (via client backend) - DONE
- [ ] Implement streaming audio with real amplitude extraction
- [ ] Create production AbbyOrb.tsx component
- [ ] Test full stack with background shader

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-10 | Created feature doc (CC2) |
| 2024-12-10 | Built G4 shader with pure blob approach (CC1) |
| 2024-12-10 | Integrated Fal.ai Orpheus TTS (CC1) |
| 2024-12-10 | Fixed Reanimated worklet pattern for audio→shader (CC1) |
| 2024-12-10 | Added diaphragm breathing effect (CC1) |
| 2024-12-10 | Researched TTS providers (later migrated to OpenAI Realtime) (CC1) |
| 2024-12-10 | Documented full conversational stack plan (CC1) |
